import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { UserRole } from "@hair-renfort/db";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { VerificationService } from "../verification/verification.service";
import { ReviewDocumentDto } from "../verification/dto/review-document.dto";

/** Back-office — validation manuelle des pièces (condition d'ouverture d'un compte). */
@Controller("admin/verification")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminVerificationController {
  constructor(private verificationService: VerificationService) {}

  @Get("pending")
  pending() {
    return this.verificationService.listPending();
  }

  @Patch("documents/:id")
  review(@CurrentUser() admin: AuthenticatedUser, @Param("id") id: string, @Body() dto: ReviewDocumentDto) {
    return this.verificationService.review(admin.userId, id, dto);
  }
}
