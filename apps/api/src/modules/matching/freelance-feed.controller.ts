import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@hair-renfort/db";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { VerifiedAccountGuard } from "../../common/guards/verified-account.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { FreelanceFeedService } from "./freelance-feed.service";
import { AssignmentsService } from "../missions/assignments.service";
import { SwipeDto } from "./dto/swipe.dto";

/** Côté freelance uniquement — ne renvoie jamais que des besoins/salons, jamais une autre freelance. */
@Controller("matching/freelance")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.FREELANCE)
export class FreelanceFeedController {
  constructor(
    private feedService: FreelanceFeedService,
    private assignmentsService: AssignmentsService,
  ) {}

  @Get("feed")
  feed(@CurrentUser() user: AuthenticatedUser) {
    return this.feedService.getFeed(user.profileId!);
  }

  /** "Swipe droite" = candidature (VerifiedAccountGuard) ; "swipe gauche" = simple enregistrement. */
  @Post("needs/:needId/swipe")
  @UseGuards(VerifiedAccountGuard)
  swipe(@CurrentUser() user: AuthenticatedUser, @Param("needId") needId: string, @Body() dto: SwipeDto) {
    return dto.action === "LIKED"
      ? this.assignmentsService.candidater(user.profileId!, needId)
      : this.assignmentsService.passer(user.profileId!, needId);
  }
}
