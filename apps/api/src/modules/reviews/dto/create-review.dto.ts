import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  ponctualite!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  technique!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  relationnel!: number;

  @IsOptional()
  @IsString()
  commentaire?: string;
}
