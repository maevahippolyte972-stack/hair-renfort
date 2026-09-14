import { Injectable, Logger } from "@nestjs/common";
import { AccountStatus, AssignmentStatus, CancelledByParty } from "@hair-renfort/db";
import { DEFAULT_RELIABILITY_SANCTION } from "@hair-renfort/shared";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Taux de fiabilité : indicateur DISTINCT de la note de qualité (Review), jamais fusionné
 * (brief, section Annulations & fiabilité — exigence RGPD d'explicabilité d'une décision
 * automatisée). Alimenté uniquement par les transitions ACCEPTEE -> ANNULEE, jamais par
 * un refus (PROPOSEE -> REFUSEE), qui reste libre et sans conséquence.
 * Sanctions : exclusivement commerciales (visibilité, puis suspension), jamais financières.
 */
@Injectable()
export class ReliabilityService {
  private readonly logger = new Logger(ReliabilityService.name);

  constructor(private prisma: PrismaService) {}

  private async getSanctionSettings() {
    const setting = await this.prisma.platformSetting.findUnique({
      where: { key: "reliability.cancellation_sanction" },
    });
    return (
      (setting?.value as {
        windowDays: number;
        visibilityReductionThreshold: number;
        suspensionThreshold: number;
      }) ?? DEFAULT_RELIABILITY_SANCTION
    );
  }

  async recomputeFreelance(freelanceId: string) {
    const accepted = await this.prisma.missionAssignment.findMany({
      where: { freelanceId, acceptedAt: { not: null } },
      select: { status: true, cancelledBy: true },
    });
    const score = this.computeScore(accepted, CancelledByParty.FREELANCE);
    await this.prisma.freelanceProfile.update({
      where: { id: freelanceId },
      data: { reliabilityScore: score },
    });
    await this.maybeSuspend("FREELANCE", freelanceId);
  }

  async recomputeSalon(salonId: string) {
    const accepted = await this.prisma.missionAssignment.findMany({
      where: { missionNeed: { salonId }, acceptedAt: { not: null } },
      select: { status: true, cancelledBy: true },
    });
    const score = this.computeScore(accepted, CancelledByParty.SALON);
    await this.prisma.salonProfile.update({
      where: { id: salonId },
      data: { reliabilityScore: score },
    });
    await this.maybeSuspend("SALON", salonId);
  }

  private computeScore(
    assignments: { status: AssignmentStatus; cancelledBy: CancelledByParty | null }[],
    party: CancelledByParty,
  ): number {
    if (assignments.length === 0) return 100;
    const honored = assignments.filter(
      (a) => a.status === AssignmentStatus.TERMINEE || (a.status === AssignmentStatus.ANNULEE && a.cancelledBy !== party),
    ).length;
    return Math.round((honored / assignments.length) * 1000) / 10; // ex. 97.3
  }

  /** Réduction de visibilité : calculée à la volée dans le matching (pas de flag persistant
   * nécessaire). Ici on ne gère que le palier de suspension, seule sanction qui change
   * réellement l'accès au compte. */
  private async maybeSuspend(actorType: "SALON" | "FREELANCE", profileId: string) {
    const settings = await this.getSanctionSettings();
    const since = new Date(Date.now() - settings.windowDays * 24 * 60 * 60 * 1000);

    const recentCancellations = await this.prisma.reliabilityEvent.count({
      where: {
        party: actorType,
        createdAt: { gte: since },
        ...(actorType === "SALON" ? { salonId: profileId } : { freelanceId: profileId }),
      },
    });

    if (recentCancellations >= settings.suspensionThreshold) {
      const userId = await this.resolveUserId(actorType, profileId);
      if (!userId) return;
      await this.prisma.user.update({ where: { id: userId }, data: { status: AccountStatus.SUSPENDED } });
      this.logger.warn(`Compte ${actorType} ${profileId} suspendu (récidive d'annulations).`);
    }
  }

  private async resolveUserId(actorType: "SALON" | "FREELANCE", profileId: string) {
    if (actorType === "SALON") {
      const p = await this.prisma.salonProfile.findUnique({ where: { id: profileId } });
      return p?.userId ?? null;
    }
    const p = await this.prisma.freelanceProfile.findUnique({ where: { id: profileId } });
    return p?.userId ?? null;
  }

  /** Utilisé par le matching pour réduire la visibilité sans suspendre (palier intermédiaire). */
  async hasReducedVisibility(actorType: "SALON" | "FREELANCE", profileId: string): Promise<boolean> {
    const settings = await this.getSanctionSettings();
    const since = new Date(Date.now() - settings.windowDays * 24 * 60 * 60 * 1000);
    const recentCancellations = await this.prisma.reliabilityEvent.count({
      where: {
        party: actorType,
        createdAt: { gte: since },
        ...(actorType === "SALON" ? { salonId: profileId } : { freelanceId: profileId }),
      },
    });
    return recentCancellations >= settings.visibilityReductionThreshold;
  }
}
