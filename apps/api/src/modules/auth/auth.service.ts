import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import {
  AccountStatus,
  ConsentType,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
} from "@hair-renfort/db";
import { TRIAL_DAYS } from "@hair-renfort/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { RegisterSalonDto } from "./dto/register-salon.dto";
import { RegisterFreelanceDto } from "./dto/register-freelance.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  private async assertCguAccepted(acceptCgu: boolean) {
    if (!acceptCgu) {
      throw new BadRequestException("L'acceptation des CGU est obligatoire pour créer un compte.");
    }
  }

  private async getFoundingCohortSettings() {
    const setting = await this.prisma.platformSetting.findUnique({
      where: { key: "onboarding.founding_cohorts" },
    });
    return (setting?.value as {
      freelanceSlots: number;
      freelanceFreeMonths: number;
      salonSlots: number;
      salonFreeMonths: number;
    }) ?? { freelanceSlots: 200, freelanceFreeMonths: 6, salonSlots: 50, salonFreeMonths: 3 };
  }

  async registerSalon(dto: RegisterSalonDto) {
    await this.assertCguAccepted(dto.acceptCgu);

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("Un compte existe déjà avec cet email.");

    const siretTaken = await this.prisma.salonProfile.findUnique({ where: { siret: dto.siret } });
    if (siretTaken) throw new ConflictException("Un salon est déjà enregistré avec ce SIRET.");

    const cohort = await this.getFoundingCohortSettings();
    const salonCount = await this.prisma.salonProfile.count();
    const isFoundingCohort = salonCount < cohort.salonSlots;
    const freeAccessUntil = isFoundingCohort
      ? addMonths(new Date(), cohort.salonFreeMonths)
      : null;

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: UserRole.SALON,
        status: AccountStatus.PENDING_VERIFICATION,
        consents: {
          create: [
            { type: ConsentType.CGU },
            ...(dto.acceptMarketing ? [{ type: ConsentType.MARKETING }] : []),
          ],
        },
        salonProfile: {
          create: {
            raisonSociale: dto.raisonSociale,
            siret: dto.siret,
            nomGerant: dto.nomGerant,
            telephone: dto.telephone,
            adresse: dto.adresse,
            ville: dto.ville,
            codePostal: dto.codePostal,
            latitude: dto.latitude,
            longitude: dto.longitude,
            description: dto.description,
            isFoundingCohort,
            freeAccessUntil,
            // Pendant la période de gratuité d'amorçage, accès complet y compris Premium
            // (brief : "tester une version dégradée ne montrerait pas la valeur de ce
            // qui sera vendu ensuite"). Redevient BASE par défaut à l'issue de la période.
            subscriptionTier: isFoundingCohort ? "PREMIUM" : "BASE",
            subscription: {
              create: {
                plan: isFoundingCohort ? SubscriptionPlan.SALON_PREMIUM : SubscriptionPlan.SALON_BASE,
                status: SubscriptionStatus.TRIALING,
                trialEndsAt: freeAccessUntil ?? addDays(new Date(), TRIAL_DAYS),
              },
            },
          },
        },
      },
      include: { salonProfile: true },
    });

    return this.issueToken(user.id, UserRole.SALON, user.salonProfile!.id);
  }

  async registerFreelance(dto: RegisterFreelanceDto) {
    await this.assertCguAccepted(dto.acceptCgu);

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("Un compte existe déjà avec cet email.");

    const siretTaken = await this.prisma.freelanceProfile.findUnique({ where: { siret: dto.siret } });
    if (siretTaken) throw new ConflictException("Une freelance est déjà enregistrée avec ce SIRET.");

    const specialties = await this.prisma.freelanceSpecialty.findMany({
      where: { name: { in: dto.specialtyNames } },
    });
    if (specialties.length !== dto.specialtyNames.length) {
      throw new BadRequestException("Une ou plusieurs spécialités sont inconnues.");
    }

    const cohort = await this.getFoundingCohortSettings();
    const freelanceCount = await this.prisma.freelanceProfile.count();
    const isFoundingCohort = freelanceCount < cohort.freelanceSlots;
    const freeAccessUntil = isFoundingCohort
      ? addMonths(new Date(), cohort.freelanceFreeMonths)
      : null;

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: UserRole.FREELANCE,
        status: AccountStatus.PENDING_VERIFICATION,
        consents: {
          create: [
            { type: ConsentType.CGU },
            ...(dto.acceptMarketing ? [{ type: ConsentType.MARKETING }] : []),
          ],
        },
        freelanceProfile: {
          create: {
            prenom: dto.prenom,
            nom: dto.nom,
            telephone: dto.telephone,
            siret: dto.siret,
            villeBase: dto.villeBase,
            latitude: dto.latitude,
            longitude: dto.longitude,
            zoneMobiliteKm: dto.zoneMobiliteKm ?? 15,
            anneesExperience: dto.anneesExperience,
            tarifsAffiches: dto.tarifsAffiches as unknown as object,
            isFoundingCohort,
            freeAccessUntil,
            specialties: { connect: specialties.map((s) => ({ id: s.id })) },
            subscription: {
              create: {
                plan: SubscriptionPlan.FREELANCE,
                status: SubscriptionStatus.TRIALING,
                trialEndsAt: freeAccessUntil ?? addDays(new Date(), TRIAL_DAYS),
              },
            },
          },
        },
      },
      include: { freelanceProfile: true },
    });

    return this.issueToken(user.id, UserRole.FREELANCE, user.freelanceProfile!.id);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { salonProfile: true, freelanceProfile: true },
    });
    if (!user) throw new UnauthorizedException("Identifiants invalides.");

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException("Identifiants invalides.");

    const profileId = user.salonProfile?.id ?? user.freelanceProfile?.id ?? null;
    return this.issueToken(user.id, user.role, profileId);
  }

  private issueToken(userId: string, role: UserRole, profileId: string | null) {
    const accessToken = this.jwt.sign({ sub: userId });
    return { accessToken, role, profileId };
  }
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
