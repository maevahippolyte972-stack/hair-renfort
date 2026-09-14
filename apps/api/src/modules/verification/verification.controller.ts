import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@hair-renfort/db";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { VerificationService } from "./verification.service";
import { SubmitDocumentDto } from "./dto/submit-document.dto";

@Controller("verification")
@UseGuards(JwtAuthGuard, RolesGuard)
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @Post("documents")
  @Roles(UserRole.SALON, UserRole.FREELANCE)
  submit(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubmitDocumentDto) {
    return this.verificationService.submitDocument(user.userId, dto);
  }

  @Get("documents/mine")
  @Roles(UserRole.SALON, UserRole.FREELANCE)
  mine(@CurrentUser() user: AuthenticatedUser) {
    return this.verificationService.myDocuments(user.userId);
  }
}
