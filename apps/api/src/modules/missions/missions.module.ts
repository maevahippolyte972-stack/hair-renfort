import { Module } from "@nestjs/common";
import { NeedsService } from "./needs.service";
import { NeedsController } from "./needs.controller";
import { AssignmentsService } from "./assignments.service";
import { AssignmentsController } from "./assignments.controller";
import { UrgencyService } from "./urgency.service";
import { ReliabilityService } from "./reliability.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  providers: [NeedsService, AssignmentsService, UrgencyService, ReliabilityService],
  controllers: [NeedsController, AssignmentsController],
  exports: [UrgencyService, ReliabilityService, AssignmentsService],
})
export class MissionsModule {}
