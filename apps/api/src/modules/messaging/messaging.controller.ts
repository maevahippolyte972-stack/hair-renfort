import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@hair-renfort/db";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { MessagingService } from "./messaging.service";
import { SendMessageDto } from "./dto/send-message.dto";

@Controller("messaging")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @Post("conversations/salon/:freelanceId")
  @Roles(UserRole.SALON)
  startAsSalon(@CurrentUser() user: AuthenticatedUser, @Param("freelanceId") freelanceId: string) {
    return this.messagingService.startAsSalon(user.profileId!, freelanceId);
  }

  @Post("conversations/freelance/:salonId")
  @Roles(UserRole.FREELANCE)
  startAsFreelance(@CurrentUser() user: AuthenticatedUser, @Param("salonId") salonId: string) {
    return this.messagingService.startAsFreelance(user.profileId!, salonId);
  }

  @Get("conversations")
  @Roles(UserRole.SALON, UserRole.FREELANCE)
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.messagingService.listMine(user.role as "SALON" | "FREELANCE", user.profileId!);
  }

  @Get("conversations/:id/messages")
  @Roles(UserRole.SALON, UserRole.FREELANCE)
  messages(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.messagingService.listMessages(user.userId, user.role as "SALON" | "FREELANCE", user.profileId!, id);
  }

  @Post("conversations/:id/messages")
  @Roles(UserRole.SALON, UserRole.FREELANCE)
  send(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: SendMessageDto) {
    return this.messagingService.sendMessage(user.userId, user.role as "SALON" | "FREELANCE", user.profileId!, id, dto);
  }

  @Get("templates")
  @Roles(UserRole.SALON, UserRole.FREELANCE)
  templates(@CurrentUser() user: AuthenticatedUser) {
    return this.messagingService.listTemplates(user.role as "SALON" | "FREELANCE");
  }
}
