import { Controller, Get, UseGuards } from "@nestjs/common";
import { UserRole } from "@hair-renfort/db";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { DashboardsService } from "./dashboards.service";

/** "Mes repères" — chaque endpoint ne peut lire que le dashboard du profil authentifié. */
@Controller("dashboards")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardsController {
  constructor(private dashboardsService: DashboardsService) {}

  @Get("mine")
  @Roles(UserRole.SALON, UserRole.FREELANCE)
  mine(@CurrentUser() user: AuthenticatedUser) {
    return user.role === UserRole.SALON
      ? this.dashboardsService.salonProof(user.profileId!)
      : this.dashboardsService.freelanceProof(user.profileId!);
  }
}
