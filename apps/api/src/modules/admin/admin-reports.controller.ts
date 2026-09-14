import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ReportStatus, UserRole } from "@hair-renfort/db";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { ReportsService } from "../reports/reports.service";
import { HandleReportDto } from "../reports/dto/handle-report.dto";

/** Back-office — file de traitement des signalements (brief : jamais un simple email). */
@Controller("admin/reports")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get()
  list(@Query("status") status?: ReportStatus) {
    return this.reportsService.listQueue(status);
  }

  @Patch(":id/en-cours")
  markInReview(@CurrentUser() admin: AuthenticatedUser, @Param("id") id: string) {
    return this.reportsService.markInReview(admin.userId, id);
  }

  @Patch(":id/resoudre")
  resolve(@CurrentUser() admin: AuthenticatedUser, @Param("id") id: string, @Body() dto: HandleReportDto) {
    return this.reportsService.resolve(admin.userId, id, dto);
  }
}
