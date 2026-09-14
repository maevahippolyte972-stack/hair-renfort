import { Injectable } from "@nestjs/common";
import { AccountStatus, AssignmentStatus, UserRole, VerificationStatus } from "@hair-renfort/db";
import { PrismaService } from "../../prisma/prisma.service";

/** Statistiques globales du back-office (brief, section Back-office administrateur). */
@Injectable()
export class AdminStatsService {
  constructor(private prisma: PrismaService) {}

  async globalStats() {
    const [
      salonsCount,
      freelancesCount,
      needsPublished,
      assignmentsAccepted,
      pendingVerifications,
      openReports,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.SALON } }),
      this.prisma.user.count({ where: { role: UserRole.FREELANCE } }),
      this.prisma.missionNeed.count(),
      this.prisma.missionAssignment.count({ where: { status: { in: [AssignmentStatus.ACCEPTEE, AssignmentStatus.TERMINEE] } } }),
      this.prisma.verificationDocument.count({ where: { status: VerificationStatus.PENDING } }),
      this.prisma.report.count({ where: { status: { not: "TRAITE" } } }),
    ]);

    const trialingSalons = await this.prisma.subscription.count({
      where: { status: "TRIALING", salonId: { not: null } },
    });
    const activeSalons = await this.prisma.user.count({ where: { role: UserRole.SALON, status: AccountStatus.ACTIVE } });
    const conversionRateSalon = salonsCount > 0 ? Math.round((activeSalons / salonsCount) * 1000) / 10 : 0;

    const zonesActives = await this.prisma.salonProfile.groupBy({
      by: ["ville"],
      _count: { ville: true },
      orderBy: { _count: { ville: "desc" } },
      take: 5,
    });

    return {
      inscrits: { salons: salonsCount, freelances: freelancesCount },
      missions: { besoinsPublies: needsPublished, missionsAcceptees: assignmentsAccepted },
      aTraiter: { verificationsEnAttente: pendingVerifications, signalementsOuverts: openReports },
      abonnements: { salonsEnEssai: trialingSalons, tauxConversionSalonPct: conversionRateSalon },
      zonesLesPlusActives: zonesActives.map((z) => ({ ville: z.ville, salons: z._count.ville })),
    };
  }
}
