import * as argon2 from "argon2";
import { PrismaClient } from "../generated/client";

const prisma = new PrismaClient();

const PASSWORD = "motdepasse123";

/**
 * Jeu de données de démonstration — un salon Premium, deux freelances, une mission
 * menée jusqu'au bout (candidature → acceptation → double validation → avis croisés)
 * pour que les tableaux de bord ("Mes repères") aient un historique réel à afficher
 * dès l'ouverture du Codespace. Reproductible : sans effet si déjà exécuté (upsert).
 */
async function main() {
  const passwordHash = await argon2.hash(PASSWORD);

  const salonUser = await prisma.user.upsert({
    where: { email: "contact@atelier17.fr" },
    update: {},
    create: {
      email: "contact@atelier17.fr",
      passwordHash,
      role: "SALON",
      status: "ACTIVE",
      salonProfile: {
        create: {
          raisonSociale: "L'Atelier 17",
          siret: "12345678900011",
          nomGerant: "Claire Dubois",
          telephone: "0601020304",
          adresse: "17 rue de Charonne",
          ville: "Paris",
          codePostal: "75011",
          latitude: 48.857,
          longitude: 2.38,
          description: "Salon indépendant dans le 11e, ambiance atelier.",
          badgeVerifie: true,
          subscriptionTier: "PREMIUM",
        },
      },
    },
    include: { salonProfile: true },
  });
  const salon = salonUser.salonProfile ?? (await prisma.salonProfile.findUniqueOrThrow({ where: { userId: salonUser.id } }));

  await prisma.user.upsert({
    where: { email: "admin@hair-renfort.app" },
    update: {},
    create: {
      email: "admin@hair-renfort.app",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const [balayage, coloration, coupeFemme, lissage, cheveuxTextures, extensions] = await Promise.all([
    prisma.freelanceSpecialty.findUniqueOrThrow({ where: { name: "Balayage" } }),
    prisma.freelanceSpecialty.findUniqueOrThrow({ where: { name: "Coloration" } }),
    prisma.freelanceSpecialty.findUniqueOrThrow({ where: { name: "Coupe femme" } }),
    prisma.freelanceSpecialty.findUniqueOrThrow({ where: { name: "Lissage" } }),
    prisma.freelanceSpecialty.findUniqueOrThrow({ where: { name: "Cheveux texturés" } }),
    prisma.freelanceSpecialty.findUniqueOrThrow({ where: { name: "Extensions" } }),
  ]);

  const inayaUser = await prisma.user.upsert({
    where: { email: "inaya@example.com" },
    update: {},
    create: {
      email: "inaya@example.com",
      passwordHash,
      role: "FREELANCE",
      status: "ACTIVE",
      freelanceProfile: {
        create: {
          prenom: "Inaya",
          nom: "Bensaid",
          telephone: "0611223344",
          siret: "98765432100019",
          villeBase: "Paris",
          latitude: 48.862,
          longitude: 2.349,
          zoneMobiliteKm: 15,
          anneesExperience: 8,
          badgeVerifie: true,
          tarifsAffiches: [{ prestation: "Journée", montant: 280, unite: "jour" }],
          specialties: { connect: [{ id: coupeFemme.id }, { id: coloration.id }, { id: balayage.id }] },
        },
      },
    },
    include: { freelanceProfile: true },
  });
  const inaya = inayaUser.freelanceProfile ?? (await prisma.freelanceProfile.findUniqueOrThrow({ where: { userId: inayaUser.id } }));

  const leaUser = await prisma.user.upsert({
    where: { email: "lea@example.com" },
    update: {},
    create: {
      email: "lea@example.com",
      passwordHash,
      role: "FREELANCE",
      status: "ACTIVE",
      freelanceProfile: {
        create: {
          prenom: "Léa",
          nom: "Moreau",
          telephone: "0655667788",
          siret: "11122233300015",
          villeBase: "Paris",
          latitude: 48.85,
          longitude: 2.37,
          zoneMobiliteKm: 20,
          anneesExperience: 5,
          badgeVerifie: true,
          tarifsAffiches: [{ prestation: "Coloration", montant: 90, unite: "prestation" }],
          specialties: { connect: [{ id: coloration.id }, { id: lissage.id }] },
        },
      },
    },
    include: { freelanceProfile: true },
  });

  const fatouUser = await prisma.user.upsert({
    where: { email: "fatou@example.com" },
    update: {},
    create: {
      email: "fatou@example.com",
      passwordHash,
      role: "FREELANCE",
      status: "ACTIVE",
      freelanceProfile: {
        create: {
          prenom: "Fatou",
          nom: "Diallo",
          telephone: "0699887766",
          siret: "22233344400012",
          villeBase: "Paris",
          latitude: 48.87,
          longitude: 2.33,
          zoneMobiliteKm: 18,
          anneesExperience: 10,
          badgeVerifie: true,
          tarifsAffiches: [{ prestation: "Journée", montant: 260, unite: "jour" }],
          specialties: { connect: [{ id: cheveuxTextures.id }, { id: coupeFemme.id }, { id: extensions.id }] },
        },
      },
    },
  });

  // Besoin urgent (créneau proche) + besoin normal, pour illustrer le calcul automatique.
  const urgentDate = new Date(Date.now() + 18 * 60 * 60 * 1000);
  const normalDate = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);

  const urgentNeed = await prisma.missionNeed.findFirst({ where: { salonId: salon.id, description: { contains: "dernière minute" } } });
  const missionNeed =
    urgentNeed ??
    (await prisma.missionNeed.create({
      data: {
        salonId: salon.id,
        specialtyId: coloration.id,
        description: "Remplacement dernière minute, collègue absente demain.",
        urgencyLevel: "TRES_URGENT",
        status: "POURVU",
        slots: { create: [{ date: urgentDate, heureDebut: "09:00", heureFin: "18:00" }] },
      },
    }));

  const secondNeed = await prisma.missionNeed.findFirst({ where: { salonId: salon.id, description: { contains: "samedi chargé" } } });
  if (!secondNeed) {
    await prisma.missionNeed.create({
      data: {
        salonId: salon.id,
        specialtyId: balayage.id,
        description: "Renfort pour un samedi chargé, ambiance conviviale.",
        urgencyLevel: "NORMAL",
        slots: { create: [{ date: normalDate, heureDebut: "09:00", heureFin: "18:00" }] },
      },
    });
  }

  let assignment = await prisma.missionAssignment.findFirst({
    where: { missionNeedId: missionNeed.id, freelanceId: inaya.id },
  });
  if (!assignment) {
    assignment = await prisma.missionAssignment.create({
      data: {
        missionNeedId: missionNeed.id,
        freelanceId: inaya.id,
        status: "TERMINEE",
        proposedAt: new Date(),
        acceptedAt: new Date(),
        validatedBySalonAt: new Date(),
        validatedByFreelanceAt: new Date(),
      },
    });

    await prisma.review.createMany({
      data: [
        {
          missionAssignmentId: assignment.id,
          authorUserId: salonUser.id,
          targetUserId: inayaUser.id,
          ponctualite: 5,
          technique: 5,
          relationnel: 4,
          commentaire: "Très professionnelle, ponctuelle.",
        },
        {
          missionAssignmentId: assignment.id,
          authorUserId: inayaUser.id,
          targetUserId: salonUser.id,
          ponctualite: 5,
          technique: 5,
          relationnel: 5,
          commentaire: "Super ambiance, accueil parfait.",
        },
      ],
      skipDuplicates: true,
    });
  }

  const conversation = await prisma.conversation.upsert({
    where: { salonId_freelanceId: { salonId: salon.id, freelanceId: (await prisma.freelanceProfile.findUniqueOrThrow({ where: { userId: leaUser.id } })).id } },
    update: {},
    create: {
      salonId: salon.id,
      freelanceId: (await prisma.freelanceProfile.findUniqueOrThrow({ where: { userId: leaUser.id } })).id,
    },
  });
  const existingMessages = await prisma.message.count({ where: { conversationId: conversation.id } });
  if (existingMessages === 0) {
    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          senderId: leaUser.id,
          content: "Bonjour, je suis disponible pour le balayage du samedi si besoin !",
        },
        {
          conversationId: conversation.id,
          senderId: salonUser.id,
          content: "Avec plaisir, je vous confirme ça demain matin.",
        },
      ],
    });
  }

  // Un justificatif en attente + un signalement ouvert, pour que le back-office admin
  // ait quelque chose à traiter dès l'ouverture (compte admin@hair-renfort.app).
  const pendingDoc = await prisma.verificationDocument.findFirst({
    where: { userId: fatouUser.id, type: "RC_PRO" },
  });
  if (!pendingDoc) {
    await prisma.verificationDocument.create({
      data: { userId: fatouUser.id, type: "RC_PRO", fileUrl: "https://example.com/justificatifs/fatou-rc-pro.pdf" },
    });
  }

  const existingReport = await prisma.report.findFirst({ where: { reporterId: salonUser.id, reportedId: inayaUser.id } });
  if (!existingReport) {
    await prisma.report.create({
      data: {
        reporterId: salonUser.id,
        reportedId: inayaUser.id,
        category: "NON_RESPECT_CONDITIONS",
        description: "Retard important non signalé sur le créneau du matin, cliente en attente 40 minutes.",
      },
    });
  }

  console.log("Comptes de démonstration prêts (mot de passe : motdepasse123) :");
  console.log("  Admin      admin@hair-renfort.app");
  console.log("  Salon      contact@atelier17.fr");
  console.log("  Freelance  inaya@example.com");
  console.log("  Freelance  lea@example.com");
  console.log("  Freelance  fatou@example.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
