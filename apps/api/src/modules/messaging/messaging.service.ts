import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SendMessageDto } from "./dto/send-message.dto";

/** Messagerie intégrée — conversation strictement bornée à un couple (salon, freelance). */
@Injectable()
export class MessagingService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateConversation(salonId: string, freelanceId: string) {
    const existing = await this.prisma.conversation.findUnique({
      where: { salonId_freelanceId: { salonId, freelanceId } },
    });
    if (existing) return existing;
    return this.prisma.conversation.create({ data: { salonId, freelanceId } });
  }

  async startAsSalon(salonProfileId: string, freelanceProfileId: string) {
    return this.getOrCreateConversation(salonProfileId, freelanceProfileId);
  }

  async startAsFreelance(freelanceProfileId: string, salonProfileId: string) {
    return this.getOrCreateConversation(salonProfileId, freelanceProfileId);
  }

  /**
   * Conversation n'a pas de relation Prisma directe vers SalonProfile/FreelanceProfile
   * (volontaire : la messagerie ne doit jamais servir de point d'entrée pour parcourir
   * "tous les salons" ou "toutes les freelances"). Le nom du contact est donc résolu ici,
   * un par un, uniquement pour les conversations où l'appelant est déjà participant.
   */
  async listMine(actorType: "SALON" | "FREELANCE", profileId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: actorType === "SALON" ? { salonId: profileId } : { freelanceId: profileId },
      orderBy: { createdAt: "desc" },
    });

    return Promise.all(
      conversations.map(async (c) => {
        const counterpart =
          actorType === "SALON"
            ? await this.prisma.freelanceProfile.findUnique({
                where: { id: c.freelanceId },
                select: { prenom: true, nom: true },
              })
            : await this.prisma.salonProfile.findUnique({
                where: { id: c.salonId },
                select: { raisonSociale: true },
              });
        return {
          ...c,
          counterpartName: counterpart
            ? "raisonSociale" in counterpart
              ? counterpart.raisonSociale
              : `${counterpart.prenom} ${counterpart.nom}`
            : "Profil supprimé",
        };
      }),
    );
  }

  async sendMessage(
    senderUserId: string,
    actorType: "SALON" | "FREELANCE",
    profileId: string,
    conversationId: string,
    dto: SendMessageDto,
  ) {
    const conversation = await this.assertParticipant(actorType, profileId, conversationId);
    return this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: senderUserId,
        content: dto.content,
        templateId: dto.templateId,
      },
    });
  }

  async listMessages(
    viewerUserId: string,
    actorType: "SALON" | "FREELANCE",
    profileId: string,
    conversationId: string,
  ) {
    const conversation = await this.assertParticipant(actorType, profileId, conversationId);
    const messages = await this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
    });
    // Statut de lecture : seuls les messages reçus (pas envoyés par le lecteur) passent à "lu".
    await this.prisma.message.updateMany({
      where: { conversationId: conversation.id, senderId: { not: viewerUserId }, readAt: null },
      data: { readAt: new Date() },
    });
    return messages;
  }

  async listTemplates(forRole: "SALON" | "FREELANCE") {
    return this.prisma.messageTemplate.findMany({ where: { forRole } });
  }

  private async assertParticipant(actorType: "SALON" | "FREELANCE", profileId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException("Conversation introuvable.");
    const owns = actorType === "SALON" ? conversation.salonId === profileId : conversation.freelanceId === profileId;
    if (!owns) throw new ForbiddenException();
    return conversation;
  }
}
