import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@hair-renfort/db";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { VerifiedAccountGuard } from "../../common/guards/verified-account.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { NeedsService } from "./needs.service";
import { AssignmentsService } from "./assignments.service";
import { CreateNeedDto } from "./dto/create-need.dto";

/** Côté salon uniquement : publication et gestion de ses propres besoins. */
@Controller("missions/needs")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SALON)
export class NeedsController {
  constructor(
    private needsService: NeedsService,
    private assignmentsService: AssignmentsService,
  ) {}

  @Post()
  @UseGuards(VerifiedAccountGuard)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateNeedDto) {
    return this.needsService.create(user.profileId!, dto);
  }

  @Get("mine")
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.needsService.listMine(user.profileId!);
  }

  @Patch(":id/annuler")
  cancel(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.needsService.cancel(user.profileId!, id);
  }

  @Get(":id/candidatures")
  candidatures(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.assignmentsService.listCandidaturesForNeed(user.profileId!, id);
  }
}
