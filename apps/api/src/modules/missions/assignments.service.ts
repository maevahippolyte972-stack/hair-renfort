import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AssignmentStatus, CancelledByParty, InteractionAction, InteractionActorType, NeedStatus } from "@hair-renfort/db";
import { PrismaService } from "../../prisma/prisma.service";
import { ReliabilityService } from "./reliability.service";
import { CancelAssignmentDto } from "./dto/cancel-assignment.dto";

@Injectable()
export class AssignmentsService {
  constructor(
    private prisma: PrismaService,
    private reliabilityService: ReliabilityService,
  ) {}

  /** Freelance manifeste son intérêt pour un besoin ouvert ("swipe droite"). Libre, réversible. */
  async candidater(freelanceProfileId: string, needId: string) {
    const need = await this.prisma.missionNeed.findUnique({ where: { id: needId } });
    if (!need) throw new NotFoundException("Besoin introuvable.");
    if (need.status !== NeedStatus.OUVERT) {
      throw new BadRequestException("Ce besoin n'est plus ouvert aux candidatures.");
    }

    const existing = await this.prisma.missionAssignment.findFirst({
      where: { missionNeedId: needId, freelanceId: freelanceProfileId, status: AssignmentStatus.PROPOSEE },
    });

    await this.prisma.interaction.create({
      data: {
        actorType: InteractionActorType.FREELANCE,
        actorUserId: freelanceProfileId,
        missionNeedId: needId,
        targetSalonId: need.salonId,
        action: InteractionAction.LIKED,
      },
    });

    if (existing) return existing;

    return this.prisma.missionAssignment.create({
      data: { missionNeedId: needId, freelanceId: freelanceProfileId, status: AssignmentStatus.PROPOSEE },
    });
  }

  /** Freelance "swipe gauche" : passe, simplement enregistré pour la V2 (aucune candidature créée). */
  async passer(freelanceProfileId: string, needId: string) {
    const need = await this.prisma.missionNeed.findUnique({ where: { id: needId } });
    if (!need) throw new NotFoundException("Besoin introuvable.");
    await this.prisma.interaction.create({
      data: {
        actorType: InteractionActorType.FREELANCE,
        actorUserId: freelanceProfileId,
        missionNeedId: needId,
        targetSalonId: need.salonId,
        action: InteractionAction.PASSED,
      },
    });
  }

  /** Le salon retient une candidature : ACCEPTEE pour elle, REFUSEE (libre, sans effet) pour les autres. */
  async accepter(salonProfileId: string, assignmentId: string) {
    const assignment = await this.prisma.missionAssignment.findUnique({
      where: { id: assignmentId },
      include: { missionNeed: true },
    });
    if (!assignment) throw new NotFoundException("Candidature introuvable.");
    if (assignment.missionNeed.salonId !== salonProfileId) throw new ForbiddenException();
    if (assignment.status !== AssignmentStatus.PROPOSEE) {
      throw new BadRequestException("Seule une candidature en attente peut être acceptée.");
    }

    await this.prisma.$transaction([
      this.prisma.missionAssignment.update({
        where: { id: assignmentId },
        data: { status: AssignmentStatus.ACCEPTEE, acceptedAt: new Date() },
      }),
      this.prisma.missionAssignment.updateMany({
        where: {
          missionNeedId: assignment.missionNeedId,
          id: { not: assignmentId },
          status: AssignmentStatus.PROPOSEE,
        },
        data: { status: AssignmentStatus.REFUSEE, refusedAt: new Date() },
      }),
      this.prisma.missionNeed.update({
        where: { id: assignment.missionNeedId },
        data: { status: NeedStatus.POURVU },
      }),
    ]);

    return this.prisma.missionAssignment.findUniqueOrThrow({ where: { id: assignmentId } });
  }

  /** Refus AVANT acceptation : totalement libre, jamais comptabilisé comme un manquement. */
  async refuser(actorUserId: string, actorType: "SALON" | "FREELANCE", assignmentId: string) {
    const assignment = await this.getOwnedAssignment(actorUserId, actorType, assignmentId);
    if (assignment.status !== AssignmentStatus.PROPOSEE) {
      throw new BadRequestException("Seule une candidature en attente peut être refusée.");
    }
    return this.prisma.missionAssignment.update({
      where: { id: assignmentId },
      data: { status: AssignmentStatus.REFUSEE, refusedAt: new Date() },
    });
  }

  /** Annulation APRES acceptation : manquement, motif obligatoire, impacte le taux de fiabilité. */
  async annuler(
    actorUserId: string,
    actorType: "SALON" | "FREELANCE",
    assignmentId: string,
    dto: CancelAssignmentDto,
  ) {
    const assignment = await this.getOwnedAssignment(actorUserId, actorType, assignmentId);
    if (assignment.status !== AssignmentStatus.ACCEPTEE) {
      throw new BadRequestException("Seule une mission acceptée peut être annulée (un refus suffit avant acceptation).");
    }

    const cancelledBy = actorType === "SALON" ? CancelledByParty.SALON : CancelledByParty.FREELANCE;
    const need = await this.prisma.missionNeed.findUniqueOrThrow({ where: { id: assignment.missionNeedId } });

    await this.prisma.$transaction([
      this.prisma.missionAssignment.update({
        where: { id: assignmentId },
        data: {
          status: AssignmentStatus.ANNULEE,
          cancelledAt: new Date(),
          cancelledBy,
          cancelReason: dto.reason,
        },
      }),
      // L'événement de fiabilité est rattaché au profil de la partie qui annule : c'est
      // elle qui commet le manquement, jamais l'autre (voir ReliabilityService).
      this.prisma.reliabilityEvent.create({
        data: {
          missionAssignmentId: assignmentId,
          party: cancelledBy,
          salonId: cancelledBy === CancelledByParty.SALON ? need.salonId : null,
          freelanceId: cancelledBy === CancelledByParty.FREELANCE ? assignment.freelanceId : null,
        },
      }),
    ]);

    // Recalcule le taux de fiabilité des DEUX parties (celle qui annule voit le sien baisser,
    // l'autre voit son historique mis à jour mécaniquement par les mêmes données).
    await this.reliabilityService.recomputeFreelance(assignment.freelanceId);
    await this.reliabilityService.recomputeSalon(need.salonId);

    return this.prisma.missionAssignment.findUniqueOrThrow({ where: { id: assignmentId } });
  }

  /** Double validation, purement informative (n'engage aucun paiement, alimente les preuves). */
  async valider(actorUserId: string, actorType: "SALON" | "FREELANCE", assignmentId: string) {
    const assignment = await this.getOwnedAssignment(actorUserId, actorType, assignmentId);
    if (assignment.status !== AssignmentStatus.ACCEPTEE) {
      throw new BadRequestException("Seule une mission acceptée peut être validée.");
    }

    const data =
      actorType === "SALON" ? { validatedBySalonAt: new Date() } : { validatedByFreelanceAt: new Date() };
    const updated = await this.prisma.missionAssignment.update({ where: { id: assignmentId }, data });

    if (updated.validatedBySalonAt && updated.validatedByFreelanceAt) {
      const final = await this.prisma.missionAssignment.update({
        where: { id: assignmentId },
        data: { status: AssignmentStatus.TERMINEE },
      });
      const need = await this.prisma.missionNeed.findUniqueOrThrow({ where: { id: assignment.missionNeedId } });
      await this.reliabilityService.recomputeFreelance(assignment.freelanceId);
      await this.reliabilityService.recomputeSalon(need.salonId);
      return final;
    }
    return updated;
  }

  async listMineFreelance(freelanceProfileId: string) {
    return this.prisma.missionAssignment.findMany({
      where: { freelanceId: freelanceProfileId },
      include: { missionNeed: { include: { specialty: true, slots: true, salon: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async listCandidaturesForNeed(salonProfileId: string, needId: string) {
    const need = await this.prisma.missionNeed.findUnique({ where: { id: needId } });
    if (!need) throw new NotFoundException("Besoin introuvable.");
    if (need.salonId !== salonProfileId) throw new ForbiddenException();

    return this.prisma.missionAssignment.findMany({
      where: { missionNeedId: needId, status: AssignmentStatus.PROPOSEE },
      include: {
        freelance: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            badgeVerifie: true,
            reliabilityScore: true,
            tarifsAffiches: true,
            zoneMobiliteKm: true,
          },
        },
      },
    });
  }

  private async getOwnedAssignment(actorUserId: string, actorType: "SALON" | "FREELANCE", assignmentId: string) {
    const assignment = await this.prisma.missionAssignment.findUnique({
      where: { id: assignmentId },
      include: { missionNeed: true },
    });
    if (!assignment) throw new NotFoundException("Mission introuvable.");

    if (actorType === "FREELANCE" && assignment.freelanceId !== actorUserId) throw new ForbiddenException();
    if (actorType === "SALON" && assignment.missionNeed.salonId !== actorUserId) throw new ForbiddenException();

    return assignment;
  }
}
