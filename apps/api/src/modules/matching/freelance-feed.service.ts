import { Injectable } from "@nestjs/common";
import { InteractionAction, NeedStatus, SalonSubscriptionTier, UrgencyLevel } from "@hair-renfort/db";
import { PrismaService } from "../../prisma/prisma.service";
import { distanceKm } from "../../common/utils/geo";
import { AvailabilityService } from "./availability.service";
import { ReliabilityService } from "../missions/reliability.service";

const URGENCY_RANK: Record<UrgencyLevel, number> = {
  TRES_URGENT: 2,
  URGENT: 1,
  NORMAL: 0,
};

/**
 * Suggestions automatiques côté freelance — TOUJOURS actives, quelle que soit la formule
 * (brief : formule unique 19€). C'est aussi le flux "swipe". Règles de tri, dans l'ordre :
 *  1. L'urgence (calculée automatiquement) prime TOUJOURS sur le forfait du salon.
 *  2. À urgence égale, un besoin Premium est mis en avant (exception commerciale assumée).
 *  3. Jamais de logique de fidélisation à un même salon (pertinence uniquement).
 * Ce module ne connaît QUE des MissionNeed/SalonProfile : aucune requête ne peut jamais
 * exposer un profil freelance à une autre freelance.
 */
@Injectable()
export class FreelanceFeedService {
  constructor(
    private prisma: PrismaService,
    private availability: AvailabilityService,
    private reliability: ReliabilityService,
  ) {}

  async getFeed(freelanceProfileId: string) {
    const freelance = await this.prisma.freelanceProfile.findUniqueOrThrow({
      where: { id: freelanceProfileId },
      include: { specialties: true },
    });
    const specialtyIds = freelance.specialties.map((s) => s.id);
    if (specialtyIds.length === 0) return [];

    const seen = await this.prisma.interaction.findMany({
      where: { actorUserId: freelanceProfileId, action: InteractionAction.PASSED },
      select: { missionNeedId: true },
    });
    const passedIds = new Set(seen.map((s) => s.missionNeedId).filter((id): id is string => !!id));

    const needs = await this.prisma.missionNeed.findMany({
      where: {
        status: NeedStatus.OUVERT,
        specialtyId: { in: specialtyIds },
        id: { notIn: [...passedIds] },
      },
      include: { slots: true, specialty: true, salon: true },
    });

    const busyDates = await this.availability.getBusyDates(freelanceProfileId);

    const reachable = needs.filter((n) => {
      const d = distanceKm(freelance, n.salon);
      if (d > freelance.zoneMobiliteKm) return false;
      return n.slots.every((s) => !busyDates.has(s.date.toISOString().slice(0, 10)));
    });

    const withReducedVisibility = await Promise.all(
      reachable.map(async (n) => ({
        need: n,
        salonReduced: await this.reliability.hasReducedVisibility("SALON", n.salonId),
        distance: distanceKm(freelance, n.salon),
      })),
    );

    return withReducedVisibility
      .sort((a, b) => {
        const urgencyDiff = URGENCY_RANK[b.need.urgencyLevel] - URGENCY_RANK[a.need.urgencyLevel];
        if (urgencyDiff !== 0) return urgencyDiff;

        // Sanction commerciale : visibilité réduite après annulations répétées, à urgence égale.
        if (a.salonReduced !== b.salonReduced) return a.salonReduced ? 1 : -1;

        // À urgence égale, mise en avant Premium (brief : exception commerciale assumée).
        const aPremium = a.need.salon.subscriptionTier === SalonSubscriptionTier.PREMIUM;
        const bPremium = b.need.salon.subscriptionTier === SalonSubscriptionTier.PREMIUM;
        if (aPremium !== bPremium) return aPremium ? -1 : 1;

        return a.distance - b.distance;
      })
      .map(({ need, distance }) => ({ ...need, distanceKm: distance }));
  }
}
