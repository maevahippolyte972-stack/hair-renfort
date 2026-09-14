import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@hair-renfort/db";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { FavoritesService } from "./favorites.service";

@Controller("favorites")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SALON)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.favoritesService.listMine(user.profileId!);
  }

  @Post(":freelanceId")
  add(@CurrentUser() user: AuthenticatedUser, @Param("freelanceId") freelanceId: string) {
    return this.favoritesService.add(user.profileId!, freelanceId);
  }

  @Delete(":freelanceId")
  remove(@CurrentUser() user: AuthenticatedUser, @Param("freelanceId") freelanceId: string) {
    return this.favoritesService.remove(user.profileId!, freelanceId);
  }
}
