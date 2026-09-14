import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { ReportCategory } from "@hair-renfort/db";

export class CreateReportDto {
  @IsString()
  reportedUserId!: string;

  @IsOptional()
  @IsString()
  missionAssignmentId?: string;

  @IsEnum(ReportCategory)
  category!: ReportCategory;

  @IsString()
  @MinLength(10)
  description!: string;
}
