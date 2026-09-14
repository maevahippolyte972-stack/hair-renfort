import { Module } from "@nestjs/common";
import { VerificationModule } from "../verification/verification.module";
import { ReportsModule } from "../reports/reports.module";
import { AdminVerificationController } from "./admin-verification.controller";
import { AdminReportsController } from "./admin-reports.controller";
import { AdminStatsController } from "./admin-stats.controller";
import { AdminStatsService } from "./admin-stats.service";
import { AdminSettingsController } from "./admin-settings.controller";

@Module({
  imports: [VerificationModule, ReportsModule],
  providers: [AdminStatsService],
  controllers: [
    AdminVerificationController,
    AdminReportsController,
    AdminStatsController,
    AdminSettingsController,
  ],
})
export class AdminModule {}
