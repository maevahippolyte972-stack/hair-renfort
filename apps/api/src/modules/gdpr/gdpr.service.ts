import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * RGPD : droit d'accès/portabilité (export) et droit à l'effacement (anonymisation).
 * L'anonymisation remplace les champs identifiants plutôt que de supprimer les lignes
 * de mission, pour ne pas corrompre l'historique/les preuves de l'autre partie
 * (brief, section Conformité RGPD).
 */
@Injectable()
export class GdprService {
  constructor(private prisma: PrismaService) {}

  /** Droit d'accès et de portabilité : export complet, lisible, des données de l'utilisateur. */
  async exportMyData(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        salonProfile: true,
        freelanceProfile: { include: { specialties: true, portfolio: true } },
        consents: true,
        verificationDocuments: true,
        reportsFiled: true,
      },
    });

    const data = { user, exportedAt: new Date().toISOString() };

    await this.prisma.dataExportRequest.create({
      data: { userId, fulfilledAt: new Date() },
    });

    return data;
  }

  /** Droit à l'effacement : anonymisation des champs identifiants, conservation des lignes de mission. */
  async deleteMyAccount(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { salonProfile: true, freelanceProfile: true },
    });

    const anonymizedEmail = `anonymise-${userId}@hair-renfort.invalid`;

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { email: anonymizedEmail, anonymizedAt: new Date() },
      });

      if (user.salonProfile) {
        await tx.salonProfile.update({
          where: { userId },
          data: {
            raisonSociale: "Salon anonymisé",
            nomGerant: "Anonymisé",
            telephone: "",
            adresse: "",
            description: null,
          },
        });
      }

      if (user.freelanceProfile) {
        await tx.freelanceProfile.update({
          where: { userId },
          data: { prenom: "Anonymisée", nom: "", telephone: "", bio: null },
        });
      }

      // Pièces justificatives supprimées du référencement (le fichier lui-même est purgé
      // du bucket objet par le job d'infrastructure correspondant, hors scope applicatif ici).
      await tx.verificationDocument.deleteMany({ where: { userId } });
    });
  }
}
