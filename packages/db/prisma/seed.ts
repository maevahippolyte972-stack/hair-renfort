import { PrismaClient } from "../generated/client";
import { FREELANCE_SPECIALTIES } from "@hair-renfort/shared";

const prisma = new PrismaClient();

/**
 * Valeurs par défaut proposées (brief, "Points ouverts à trancher avant développement").
 * Modifiables depuis le back-office sans déploiement — voir PlatformSetting.
 */
async function main() {
  await prisma.platformSetting.upsert({
    where: { key: "urgency.thresholds_hours" },
    update: {},
    create: {
      key: "urgency.thresholds_hours",
      value: { urgent: 48, tresUrgent: 24 },
    },
  });

  await prisma.platformSetting.upsert({
    where: { key: "reliability.cancellation_sanction" },
    update: {},
    create: {
      key: "reliability.cancellation_sanction",
      value: {
        // Au-delà de N annulations (missions acceptées) sur une fenêtre glissante de W jours :
        // réduction de visibilité dans les suggestions/le swipe, puis suspension si récidive.
        windowDays: 90,
        visibilityReductionThreshold: 2,
        suspensionThreshold: 4,
      },
    },
  });

  await prisma.platformSetting.upsert({
    where: { key: "onboarding.founding_cohorts" },
    update: {},
    create: {
      key: "onboarding.founding_cohorts",
      value: {
        freelanceSlots: 200,
        freelanceFreeMonths: 6,
        salonSlots: 50,
        salonFreeMonths: 3,
      },
    },
  });

  for (const name of FREELANCE_SPECIALTIES) {
    await prisma.freelanceSpecialty.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
