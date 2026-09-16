import { Module } from "@nestjs/common";
import { PushService } from "./push.service";
import { NotificationsController } from "./notifications.controller";

@Module({
  providers: [PushService],
  controllers: [NotificationsController],
  exports: [PushService],
})
export class NotificationsModule {}
