import { Module } from "@nestjs/common";
import { MissionsModule } from "../missions/missions.module";
import { SalonSearchService } from "./salon-search.service";
import { SalonSearchController } from "./salon-search.controller";
import { FreelanceFeedService } from "./freelance-feed.service";
import { FreelanceFeedController } from "./freelance-feed.controller";
import { AvailabilityService } from "./availability.service";
import { RatingService } from "./rating.service";

@Module({
  imports: [MissionsModule],
  providers: [SalonSearchService, FreelanceFeedService, AvailabilityService, RatingService],
  controllers: [SalonSearchController, FreelanceFeedController],
})
export class MatchingModule {}
