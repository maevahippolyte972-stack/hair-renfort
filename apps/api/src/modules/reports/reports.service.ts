import { Injectable, NotFoundException } from "@nestjs/common";
import { AccountStatus, ReportIssue, ReportStatus } from "@hair-renfort/db";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateReportDto } from "./dto/create-report.dto";
import { HandleReportDto } from "./dto/handle-report.dto";

/**
 * Signalement en un clic -> file de traitement réelle (brief : "pas un simple envoi
 * d'email"). Chaque signalement est horodaté, catégorisé, rattaché aux deux profils.
 */
@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(reporterId: string, dto: CreateReportDto) {
    const report = await this.prisma.report.create({
      data: {
        reporterId,
        reportedId: dto.reportedUserId,
        missionAssignmentId: dto.missionAssignmentId,
        category: dto.category,
        description: dto.description,
      },
    });
    // Confirmation de réception immédiate à l'auteur du signalement (brief, section Signalements).
    return report;
  }

  /** Compteur de signalements répétés sur un même profil, visible côté back-office (détection de patterns). */
  async countForUser(userId: string) {
    return this.prisma.report.count({ where: { reportedId: userId } });
  }

  async listQueue(status?: ReportStatus) {
    return this.prisma.report.findMany({
      where: status ? { status } : undefined,
      include: {
        reporter: { select: { id: true, email: true, role: true } },
        reported: { select: { id: true, email: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async markInReview(adminId: string, reportId: string) {
    await this.assertExists(reportId);
    await this.prisma.report.update({
      where: { id: reportId },
      data: { status: ReportStatus.EN_COURS_EXAMEN },
    });
    await this.logAction(adminId, "REPORT_IN_REVIEW", reportId);
  }

  async resolve(adminId: string, reportId: string, dto: HandleReportDto) {
    const report = await this.assertExists(reportId);

    await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.TRAITE,
        issue: dto.issue,
        handledByAdminId: adminId,
        resolvedAt: new Date(),
      },
    });

    if (dto.issue === ReportIssue.SUSPENSION) {
      await this.prisma.user.update({ where: { id: report.reportedId }, data: { status: AccountStatus.SUSPENDED } });
    } else if (dto.issue === ReportIssue.EXCLUSION) {
      await this.prisma.user.update({ where: { id: report.reportedId }, data: { status: AccountStatus.EXCLUDED } });
    }

    await this.logAction(adminId, "REPORT_RESOLVED", reportId, { issue: dto.issue });
    // Notification à la clôture envoyée à l'auteur du signalement (brief) — hors scope de ce service.
  }

  private async assertExists(reportId: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException("Signalement introuvable.");
    return report;
  }

  private async logAction(adminId: string, action: string, reportId: string, metadata?: object) {
    await this.prisma.adminActionLog.create({
      data: { adminId, action, targetType: "Report", targetId: reportId, metadata },
    });
  }
}
