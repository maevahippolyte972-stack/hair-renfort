import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { PushService } from "./push.service";
import { SubscribePushDto } from "./dto/subscribe-push.dto";

/** Alertes "nouvelle mission" sur le téléphone — abonnement Web Push, activable/désactivable librement. */
@Controller("notifications/push")
export class NotificationsController {
  constructor(private pushService: PushService) {}

  @Get("cle-publique")
  publicKey() {
    return this.pushService.getPublicKey();
  }

  @Get("etat")
  @UseGuards(JwtAuthGuard)
  state(@CurrentUser() user: AuthenticatedUser) {
    return this.pushService.getState(user.userId);
  }

  @Post("abonner")
  @UseGuards(JwtAuthGuard)
  subscribe(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubscribePushDto) {
    return this.pushService.subscribe(user.userId, dto);
  }

  @Post("desabonner")
  @UseGuards(JwtAuthGuard)
  unsubscribe(@CurrentUser() user: AuthenticatedUser) {
    return this.pushService.unsubscribeAll(user.userId);
  }
}
