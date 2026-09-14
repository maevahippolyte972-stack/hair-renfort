import { Module } from "@nestjs/common";
import { ProfilesService } from "./profiles.service";
import { ProfilesController } from "./profiles.controller";
import { RatingService } from "../matching/rating.service";

@Module({
  providers: [ProfilesService, RatingService],
  controllers: [ProfilesController],
})
export class ProfilesModule {}
