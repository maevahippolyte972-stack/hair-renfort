import { Controller, Get, UseGuards } from "@nestjs/common";
import { UserRole } from "@hair-renfort/db";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { AdminStatsService } from "./admin-stats.service";

@Controller("admin/stats")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminStatsController {
  constructor(private adminStatsService: AdminStatsService) {}

  @Get()
  stats() {
    return this.adminStatsService.globalStats();
  }
}
