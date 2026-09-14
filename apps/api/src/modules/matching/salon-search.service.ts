import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AssignmentStatus, InteractionAction, InteractionActorType, SalonSubscriptionTier } from "@hair-renfort/db";
import { PrismaService } from "../../prisma/prisma.service";
import { distanceKm } from "../../common/utils/geo";
import { AvailabilityService } from "./availability.service";
import { RatingService } from "./rating.service";
import { ReliabilityService } from "../missions/reliability.service";
import { SearchFreelancesDto } from "./dto/search-freelances.dto";

const SUGGESTIONS_LIMIT = 10;

/**
 * Recherche côté salon. Deux modes, strictement séparés dans le code (jamais un salon ne
 * peut interroger un autre salon — ce module ne connaît QUE des FreelanceProfile) :
 *  - `search` : manuelle, filtres, disponible à TOUTES les formules (brief, Base = 50€).
 *  - `autoSuggestForNeed` : automatique, réservée au palier PREMIUM (99€), c'est le cœur
 *    de sa valeur ajoutée — la plateforme "mâche" la recherche.
 */
@Injectable()
export class SalonSearchService {
  constructor(
    private prisma: PrismaService,
    private availability: AvailabilityService,
    private rating: RatingService,
    private reliability: ReliabilityService,
  ) {}

  async search(salonProfileId: string, filters: SearchFreelancesDto) {
    const salon = await this.prisma.salonProfile.findUniqueOrThrow({ where: { id: salonProfileId } });

    const where: Record<string, unknown> = {};
    if (filters.specialtyName) {
      where.specialties = { some: { name: filters.specialtyName } };
    }

    let freelances = await this.prisma.freelanceProfile.findMany({
      where,
      include: { specialties: true },
    });

    if (filters.availableOn) {
      const date = new Date(filters.availableOn);
      const availableIds = await this.availability.filterAvailable(
        freelances.map((f) => f.id),
        [date],
      );
      freelances = freelances.filter((f) => availableIds.has(f.id));
    }

    const ratings = await this.rating.getAverageRatingsBulk(freelances.map((f) => f.userId));

    let enriched = freelances.map((f) => ({
      ...f,
      distanceKm: distanceKm(salon, f),
      rating: ratings.get(f.userId) ?? null,
    }));

    if (filters.maxDistanceKm !== undefined) {
      const maxD = filters.maxDistanceKm;
      enriched = enriched.filter((f) => f.distanceKm <= maxD);
    }
    if (filters.minRating !== undefined) {
      const minR = filters.minRating;
      enriched = enriched.filter((f) => f.rating !== null && f.rating >= minR);
    }

    // Filtre de mobilité : la freelance doit être prête à se déplacer jusqu'au salon.
    enriched = enriched.filter((f) => f.distanceKm <= f.zoneMobiliteKm);

    return enriched.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  async autoSuggestForNeed(salonProfileId: string, needId: string) {
    const salon = await this.prisma.salonProfile.findUniqueOrThrow({ where: { id: salonProfileId } });
    if (salon.subscriptionTier !== SalonSubscriptionTier.PREMIUM) {
      throw new ForbiddenException(
        "La suggestion automatique fait partie de la formule Premium. En Base, la recherche se fait via les filtres manuels.",
      );
    }

    const need = await this.prisma.missionNeed.findUnique({
      where: { id: needId },
      include: { slots: true, specialty: true },
    });
    if (!need) throw new NotFoundException("Besoin introuvable.");
    if (need.salonId !== salonProfileId) throw new ForbiddenException();

    const candidates = await this.prisma.freelanceProfile.findMany({
      where: { specialties: { some: { id: need.specialtyId } } },
      include: { specialties: true },
    });

    const dates = need.slots.map((s) => s.date);
    const availableIds = await this.availability.filterAvailable(
      candidates.map((c) => c.id),
      dates,
    );

    const ratings = await this.rating.getAverageRatingsBulk(candidates.map((c) => c.userId));

    const alreadyAssignedIds = new Set(
      (await this.prisma.missionAssignment.findMany({
        where: { missionNeedId: needId, status: { not: AssignmentStatus.REFUSEE } },
        select: { freelanceId: true },
      })).map((a) => a.freelanceId),
    );

    const ranked = candidates
      .filter((c) => availableIds.has(c.id) && !alreadyAssignedIds.has(c.id))
      .map((c) => ({
        ...c,
        distanceKm: distanceKm(salon, c),
        rating: ratings.get(c.userId) ?? null,
      }))
      .filter((c) => c.distanceKm <= c.zoneMobiliteKm)
      // Pertinence du matching uniquement (brief : jamais la fidélisation d'un même binôme).
      .sort((a, b) => {
        const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
        if (Math.abs(ratingDiff) > 0.01) return ratingDiff;
        const reliabilityDiff = b.reliabilityScore - a.reliabilityScore;
        if (Math.abs(reliabilityDiff) > 0.01) return reliabilityDiff;
        return a.distanceKm - b.distanceKm;
      })
      .slice(0, SUGGESTIONS_LIMIT);

    return ranked;
  }

  /**
   * Swipe côté salon sur un profil freelance issu de la recherche manuelle (brief :
   * "façon swipe... dans les deux sens"). "J'aime" ajoute directement aux favoris
   * ("Retravailler ensemble" fonctionne aussi comme raccourci de première prise de
   * contact) ; les deux actions sont enregistrées pour la V2 (suggestion active).
   */
  async swipe(salonProfileId: string, freelanceId: string, action: "LIKED" | "PASSED") {
    const freelance = await this.prisma.freelanceProfile.findUnique({ where: { id: freelanceId } });
    if (!freelance) throw new NotFoundException("Freelance introuvable.");

    await this.prisma.interaction.create({
      data: {
        actorType: InteractionActorType.SALON,
        actorUserId: salonProfileId,
        targetFreelanceId: freelanceId,
        action: action === "LIKED" ? InteractionAction.LIKED : InteractionAction.PASSED,
      },
    });

    if (action === "LIKED") {
      await this.prisma.favorite.upsert({
        where: { salonId_freelanceId: { salonId: salonProfileId, freelanceId } },
        update: {},
        create: { salonId: salonProfileId, freelanceId },
      });
    }
  }
}
