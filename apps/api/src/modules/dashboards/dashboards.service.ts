import { Injectable } from "@nestjs/common";
import { AssignmentStatus } from "@hair-renfort/db";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Système de triangulation de preuves — brief : "cœur de la sécurisation juridique",
 * une brique prioritaire de la V1, pas une fonctionnalité secondaire. Donne à chaque
 * partie une preuve vérifiable qu'elle n'est pas dans une relation exclusive de fait.
 * Alimenté automatiquement par l'historique réel des missions, jamais de saisie manuelle.
 * Visible UNIQUEMENT par son titulaire (appliqué au niveau des controllers : chaque
 * endpoint ne peut lire que le dashboard du profil authentifié, jamais un autre).
 */
@Injectable()
export class DashboardsService {
  constructor(private prisma: PrismaService) {}

  async freelanceProof(freelanceProfileId: string) {
    const assignments = await this.prisma.missionAssignment.findMany({
      where: { freelanceId: freelanceProfileId, acceptedAt: { not: null } },
      include: { missionNeed: { include: { salon: true } } },
      orderBy: { acceptedAt: "desc" },
    });

    const allAttempts = await this.prisma.missionAssignment.findMany({
      where: { freelanceId: freelanceProfileId },
      select: { status: true },
    });

    const bySalon = new Map<string, { salonNom: string; count: number }>();
    for (const a of assignments) {
      const key = a.missionNeed.salonId;
      const entry = bySalon.get(key) ?? { salonNom: a.missionNeed.salon.raisonSociale, count: 0 };
      entry.count += 1;
      bySalon.set(key, entry);
    }
    const total = assignments.length;
    const repartition = [...bySalon.entries()].map(([salonId, v]) => ({
      salonId,
      salonNom: v.salonNom,
      missions: v.count,
      pourcentage: total > 0 ? Math.round((v.count / total) * 1000) / 10 : 0,
    }));

    return {
      nombreSalonsDifferents: bySalon.size,
      totalMissionsAccepteesOuPlus: total,
      repartitionParSalon: repartition.sort((a, b) => b.missions - a.missions),
      historique: {
        acceptees: allAttempts.filter((a) => a.status !== "PROPOSEE" && a.status !== "REFUSEE").length,
        refusees: allAttempts.filter((a) => a.status === "REFUSEE").length,
        annulees: allAttempts.filter((a) => a.status === AssignmentStatus.ANNULEE).length,
        terminees: allAttempts.filter((a) => a.status === AssignmentStatus.TERMINEE).length,
      },
      genereLe: new Date().toISOString(),
    };
  }

  async salonProof(salonProfileId: string) {
    const assignments = await this.prisma.missionAssignment.findMany({
      where: { missionNeed: { salonId: salonProfileId }, acceptedAt: { not: null } },
      include: { freelance: true },
      orderBy: { acceptedAt: "desc" },
    });

    const allAttempts = await this.prisma.missionAssignment.findMany({
      where: { missionNeed: { salonId: salonProfileId } },
      select: { status: true },
    });

    const byFreelance = new Map<string, { nom: string; count: number }>();
    for (const a of assignments) {
      const key = a.freelanceId;
      const entry = byFreelance.get(key) ?? { nom: `${a.freelance.prenom} ${a.freelance.nom}`, count: 0 };
      entry.count += 1;
      byFreelance.set(key, entry);
    }
    const total = assignments.length;
    const repartition = [...byFreelance.entries()].map(([freelanceId, v]) => ({
      freelanceId,
      freelanceNom: v.nom,
      missions: v.count,
      pourcentage: total > 0 ? Math.round((v.count / total) * 1000) / 10 : 0,
    }));

    return {
      nombreFreelancesDifferentes: byFreelance.size,
      totalMissionsConfieesOuPlus: total,
      repartitionParFreelance: repartition.sort((a, b) => b.missions - a.missions),
      historique: {
        acceptees: allAttempts.filter((a) => a.status !== "PROPOSEE" && a.status !== "REFUSEE").length,
        annulees: allAttempts.filter((a) => a.status === AssignmentStatus.ANNULEE).length,
        terminees: allAttempts.filter((a) => a.status === AssignmentStatus.TERMINEE).length,
      },
      genereLe: new Date().toISOString(),
    };
  }
}
