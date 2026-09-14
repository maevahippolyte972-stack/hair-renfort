import { Controller, Delete, Get, UseGuards } from "@nestjs/common";
import { UserRole } from "@hair-renfort/db";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { GdprService } from "./gdpr.service";

@Controller("gdpr")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SALON, UserRole.FREELANCE)
export class GdprController {
  constructor(private gdprService: GdprService) {}

  @Get("export")
  export(@CurrentUser() user: AuthenticatedUser) {
    return this.gdprService.exportMyData(user.userId);
  }

  @Delete("account")
  deleteAccount(@CurrentUser() user: AuthenticatedUser) {
    return this.gdprService.deleteMyAccount(user.userId);
  }
}
