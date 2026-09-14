import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@hair-renfort/db";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { VerifiedAccountGuard } from "../../common/guards/verified-account.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { AssignmentsService } from "./assignments.service";
import { CancelAssignmentDto } from "./dto/cancel-assignment.dto";

@Controller("missions/assignments")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private assignmentsService: AssignmentsService) {}

  @Post("needs/:needId/candidater")
  @Roles(UserRole.FREELANCE)
  @UseGuards(VerifiedAccountGuard)
  candidater(@CurrentUser() user: AuthenticatedUser, @Param("needId") needId: string) {
    return this.assignmentsService.candidater(user.profileId!, needId);
  }

  @Post("needs/:needId/passer")
  @Roles(UserRole.FREELANCE)
  passer(@CurrentUser() user: AuthenticatedUser, @Param("needId") needId: string) {
    return this.assignmentsService.passer(user.profileId!, needId);
  }

  @Get("mine")
  @Roles(UserRole.FREELANCE)
  mine(@CurrentUser() user: AuthenticatedUser) {
    return this.assignmentsService.listMineFreelance(user.profileId!);
  }

  @Post(":id/accepter")
  @Roles(UserRole.SALON)
  accepter(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.assignmentsService.accepter(user.profileId!, id);
  }

  /** Refus AVANT acceptation : libre des deux côtés, jamais sanctionné. */
  @Post(":id/refuser")
  @Roles(UserRole.SALON, UserRole.FREELANCE)
  refuser(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.assignmentsService.refuser(user.profileId!, user.role as "SALON" | "FREELANCE", id);
  }

  /** Annulation APRES acceptation : manquement, motif obligatoire, impacte la fiabilité. */
  @Post(":id/annuler")
  @Roles(UserRole.SALON, UserRole.FREELANCE)
  annuler(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: CancelAssignmentDto,
  ) {
    return this.assignmentsService.annuler(user.profileId!, user.role as "SALON" | "FREELANCE", id, dto);
  }

  @Post(":id/valider")
  @Roles(UserRole.SALON, UserRole.FREELANCE)
  valider(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.assignmentsService.valider(user.profileId!, user.role as "SALON" | "FREELANCE", id);
  }
}
