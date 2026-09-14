import { IsDateString, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";

/** Filtres de recherche manuelle côté salon — disponible à toutes les formules (Base incluse). */
export class SearchFreelancesDto {
  @IsOptional()
  @IsString()
  specialtyName?: string;

  @IsOptional()
  @IsDateString()
  availableOn?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxDistanceKm?: number;
}
