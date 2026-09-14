import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { UserRole } from "@hair-renfort/db";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { ProfilesService } from "./profiles.service";

@Controller("profiles")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Get("me")
  @Roles(UserRole.SALON, UserRole.FREELANCE)
  me(@CurrentUser() user: AuthenticatedUser) {
    return user.role === UserRole.SALON
      ? this.profilesService.getMySalonProfile(user.profileId!)
      : this.profilesService.getMyFreelanceProfile(user.profileId!);
  }

  /** Un salon ne peut consulter qu'un profil freelance, jamais un autre salon. */
  @Get("freelances/:id")
  @Roles(UserRole.SALON)
  freelancePublic(@Param("id") id: string) {
    return this.profilesService.getFreelancePublicProfile(id);
  }

  /** Une freelance ne peut consulter qu'un profil salon, jamais une autre freelance. */
  @Get("salons/:id")
  @Roles(UserRole.FREELANCE)
  salonPublic(@Param("id") id: string) {
    return this.profilesService.getSalonPublicProfile(id);
  }
}
