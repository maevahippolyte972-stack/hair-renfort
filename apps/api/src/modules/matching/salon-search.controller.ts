import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { UserRole } from "@hair-renfort/db";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { SalonSearchService } from "./salon-search.service";
import { SearchFreelancesDto } from "./dto/search-freelances.dto";
import { SwipeDto } from "./dto/swipe.dto";

/** Côté salon uniquement — ne renvoie jamais que des FreelanceProfile, jamais un autre salon. */
@Controller("matching/salon")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SALON)
export class SalonSearchController {
  constructor(private salonSearchService: SalonSearchService) {}

  /** Recherche manuelle — toutes formules (Base incluse). */
  @Get("search")
  search(@CurrentUser() user: AuthenticatedUser, @Query() filters: SearchFreelancesDto) {
    return this.salonSearchService.search(user.profileId!, filters);
  }

  /** Suggestion automatique — Premium uniquement (cf. service, 403 sinon). */
  @Get("needs/:needId/suggestions")
  suggestions(@CurrentUser() user: AuthenticatedUser, @Param("needId") needId: string) {
    return this.salonSearchService.autoSuggestForNeed(user.profileId!, needId);
  }

  @Post("freelances/:freelanceId/swipe")
  swipe(
    @CurrentUser() user: AuthenticatedUser,
    @Param("freelanceId") freelanceId: string,
    @Body() dto: SwipeDto,
  ) {
    return this.salonSearchService.swipe(user.profileId!, freelanceId, dto.action);
  }
}
