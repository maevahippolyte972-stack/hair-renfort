import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { VerificationModule } from "./modules/verification/verification.module";
import { MissionsModule } from "./modules/missions/missions.module";
import { MatchingModule } from "./modules/matching/matching.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { FavoritesModule } from "./modules/favorites/favorites.module";
import { MessagingModule } from "./modules/messaging/messaging.module";
import { DashboardsModule } from "./modules/dashboards/dashboards.module";
import { AdminModule } from "./modules/admin/admin.module";
import { GdprModule } from "./modules/gdpr/gdpr.module";
import { ProfilesModule } from "./modules/profiles/profiles.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    VerificationModule,
    ProfilesModule,
    MissionsModule,
    MatchingModule,
    ReportsModule,
    ReviewsModule,
    FavoritesModule,
    MessagingModule,
    DashboardsModule,
    GdprModule,
    AdminModule,
    NotificationsModule,
  ],
})
export class AppModule {}
