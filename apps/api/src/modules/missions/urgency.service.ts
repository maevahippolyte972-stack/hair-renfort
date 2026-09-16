import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { NeedStatus, UrgencyLevel } from "@hair-renfort/db";
import { DEFAULT_URGENCY_THRESHOLDS_HOURS } from "@hair-renfort/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { PushService } from "../notifications/push.service";

/**
 * Calcule le niveau d'urgence à partir du seul délai restant avant le créneau le plus
 * proche du besoin. JAMAIS déclaré manuellement par le salon (brief, section "Modèle
 * de fonctionnement" et "Points de vigilance"). Seuils par défaut configurables via
 * PlatformSetting["urgency.thresholds_hours"], sans déploiement.
 */
@Injectable()
export class UrgencyService {
  private readonly logger = new Logger(UrgencyService.name);

  constructor(
    private prisma: PrismaService,
    private pushService: PushService,
  ) {}

  async getThresholds() {
    const setting = await this.prisma.platformSetting.findUnique({
      where: { key: "urgency.thresholds_hours" },
    });
    return (setting?.value as { urgent: number; tresUrgent: number }) ?? DEFAULT_URGENCY_THRESHOLDS_HOURS;
  }

  computeLevel(hoursUntilEarliestSlot: number, thresholds: { urgent: number; tresUrgent: number }): UrgencyLevel {
    if (hoursUntilEarliestSlot <= thresholds.tresUrgent) return UrgencyLevel.TRES_URGENT;
    if (hoursUntilEarliestSlot <= thresholds.urgent) return UrgencyLevel.URGENT;
    return UrgencyLevel.NORMAL;
  }

  /**
   * Recalcule l'urgence de tous les besoins ouverts. Idempotent : ne notifie que sur
   * un passage à un niveau plus élevé (notification poussée anticipée, brief section
   * "Découverte & matching").
   */
  @Cron(CronExpression.EVERY_HOUR)
  async recomputeOpenNeeds() {
    const thresholds = await this.getThresholds();
    const needs = await this.prisma.missionNeed.findMany({
      where: { status: NeedStatus.OUVERT },
      include: { slots: true, specialty: true, salon: true },
    });

    const now = Date.now();
    for (const need of needs) {
      const earliest = need.slots
        .map((s) => s.date.getTime())
        .filter((t) => t > now)
        .sort((a, b) => a - b)[0];
      if (!earliest) continue;

      const hoursUntil = (earliest - now) / (1000 * 60 * 60);
      const newLevel = this.computeLevel(hoursUntil, thresholds);
      if (newLevel !== need.urgencyLevel) {
        await this.prisma.missionNeed.update({
          where: { id: need.id },
          data: { urgencyLevel: newLevel, urgencyLastComputedAt: new Date() },
        });
        if (newLevel !== UrgencyLevel.NORMAL) {
          this.logger.log(`Besoin ${need.id} recalculé au niveau ${newLevel}.`);
          this.pushService
            .notifyFreelancesOfNewNeed({
              specialtyLabel: need.specialty.name,
              salonNom: need.salon.raisonSociale,
              ville: need.salon.ville,
              urgencyLevel: newLevel,
            })
            .catch(() => undefined);
        }
      }
    }
  }
}
