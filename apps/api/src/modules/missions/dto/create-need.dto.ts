import { ArrayMinSize, IsArray, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class SlotDto {
  @IsString()
  date!: string; // ISO date

  @IsString()
  heureDebut!: string;

  @IsString()
  heureFin!: string;
}

/**
 * Publication d'un besoin — volontairement SANS champ tarif (seule la freelance affiche
 * un prix) et SANS champ "urgent" (calculé automatiquement, voir UrgencyService).
 * Supporte un ou plusieurs créneaux (ponctuel, multi-dates, récurrent).
 */
export class CreateNeedDto {
  @IsString()
  specialtyName!: string;

  @IsString()
  description!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SlotDto)
  slots!: SlotDto[];
}
