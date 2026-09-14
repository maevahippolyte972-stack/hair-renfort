import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { UserRole } from "@hair-renfort/db";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";

@Controller("missions/assignments")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SALON, UserRole.FREELANCE)
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post(":id/avis")
  create(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.userId, user.role as "SALON" | "FREELANCE", id, dto);
  }
}
