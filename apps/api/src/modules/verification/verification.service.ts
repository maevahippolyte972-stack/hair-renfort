import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AccountStatus, VerificationStatus } from "@hair-renfort/db";
import { PrismaService } from "../../prisma/prisma.service";
import { REQUIRED_DOCUMENTS } from "./verification.constants";
import { SubmitDocumentDto } from "./dto/submit-document.dto";
import { ReviewDocumentDto } from "./dto/review-document.dto";

@Injectable()
export class VerificationService {
  constructor(private prisma: PrismaService) {}

  async submitDocument(userId: string, dto: SubmitDocumentDto) {
    return this.prisma.verificationDocument.create({
      data: { userId, type: dto.type, fileUrl: dto.fileUrl },
    });
  }

  async myDocuments(userId: string) {
    return this.prisma.verificationDocument.findMany({ where: { userId } });
  }

  async listPending() {
    return this.prisma.verificationDocument.findMany({
      where: { status: VerificationStatus.PENDING },
      include: { user: { select: { id: true, email: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  /** Validation manuelle par un admin — condition d'ouverture du compte (brief, back-office). */
  async review(adminId: string, documentId: string, dto: ReviewDocumentDto) {
    const doc = await this.prisma.verificationDocument.findUnique({
      where: { id: documentId },
      include: { user: true },
    });
    if (!doc) throw new NotFoundException("Document introuvable.");
    if (dto.status === VerificationStatus.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException("Un motif de rejet est requis.");
    }

    await this.prisma.verificationDocument.update({
      where: { id: documentId },
      data: {
        status: dto.status,
        rejectionReason: dto.status === VerificationStatus.REJECTED ? dto.rejectionReason : null,
        reviewedByAdminId: adminId,
        reviewedAt: new Date(),
      },
    });

    await this.prisma.adminActionLog.create({
      data: {
        adminId,
        action: dto.status === VerificationStatus.APPROVED ? "APPROVE_VERIFICATION" : "REJECT_VERIFICATION",
        targetType: "VerificationDocument",
        targetId: documentId,
        metadata: { userId: doc.userId, documentType: doc.type },
      },
    });

    if (dto.status === VerificationStatus.APPROVED) {
      await this.maybeActivateAccount(doc.userId);
    }
  }

  /** Active le compte + pose le badge dès que TOUTES les pièces requises pour son rôle sont approuvées. */
  private async maybeActivateAccount(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const required = REQUIRED_DOCUMENTS[user.role];
    if (required.length === 0) return;

    const approved = await this.prisma.verificationDocument.findMany({
      where: { userId, status: VerificationStatus.APPROVED },
    });
    const approvedTypes = new Set(approved.map((d) => d.type));
    const allApproved = required.every((type) => approvedTypes.has(type));
    if (!allApproved) return;

    await this.prisma.user.update({
      where: { id: userId },
      data: { status: AccountStatus.ACTIVE },
    });

    if (user.role === "SALON") {
      await this.prisma.salonProfile.update({
        where: { userId },
        data: { badgeVerifie: true },
      });
    } else if (user.role === "FREELANCE") {
      await this.prisma.freelanceProfile.update({
        where: { userId },
        data: { badgeVerifie: true },
      });
    }
  }
}
