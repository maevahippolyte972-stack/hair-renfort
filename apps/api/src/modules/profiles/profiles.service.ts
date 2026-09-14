import { NotFoundException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RatingService } from "../matching/rating.service";

/**
 * Chaque méthode ne renvoie qu'un seul type de profil vers un seul type d'appelant :
 * getSalonPublicProfile n'est jamais appelable que depuis un contexte FREELANCE (voir
 * ProfilesController), et inversement. Il n'existe aucune méthode "getAnyProfile".
 */
@Injectable()
export class ProfilesService {
  constructor(
    private prisma: PrismaService,
    private rating: RatingService,
  ) {}

  async getMySalonProfile(salonProfileId: string) {
    return this.prisma.salonProfile.findUniqueOrThrow({ where: { id: salonProfileId }, include: { subscription: true } });
  }

  async getMyFreelanceProfile(freelanceProfileId: string) {
    return this.prisma.freelanceProfile.findUniqueOrThrow({
      where: { id: freelanceProfileId },
      include: { specialties: true, portfolio: true, subscription: true },
    });
  }

  /** Vue publique d'un salon, accessible uniquement à une freelance authentifiée. */
  async getSalonPublicProfile(salonId: string) {
    const salon = await this.prisma.salonProfile.findUnique({ where: { id: salonId } });
    if (!salon) throw new NotFoundException("Salon introuvable.");
    const rating = await this.rating.getAverageRating(salon.userId);
    return {
      id: salon.id,
      raisonSociale: salon.raisonSociale,
      ville: salon.ville,
      description: salon.description,
      badgeVerifie: salon.badgeVerifie,
      reliabilityScore: salon.reliabilityScore,
      rating,
    };
  }

  /** Vue publique d'une freelance, accessible uniquement à un salon authentifié. */
  async getFreelancePublicProfile(freelanceId: string) {
    const freelance = await this.prisma.freelanceProfile.findUnique({
      where: { id: freelanceId },
      include: { specialties: true, portfolio: true },
    });
    if (!freelance) throw new NotFoundException("Freelance introuvable.");
    const rating = await this.rating.getAverageRating(freelance.userId);
    return {
      id: freelance.id,
      prenom: freelance.prenom,
      nom: freelance.nom,
      villeBase: freelance.villeBase,
      zoneMobiliteKm: freelance.zoneMobiliteKm,
      bio: freelance.bio,
      badgeVerifie: freelance.badgeVerifie,
      reliabilityScore: freelance.reliabilityScore,
      tarifsAffiches: freelance.tarifsAffiches,
      specialties: freelance.specialties,
      portfolio: freelance.portfolio,
      rating,
    };
  }
}
