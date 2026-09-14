import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
} from "class-validator";

export class TarifAfficheDto {
  @IsString()
  prestation!: string;

  @IsInt()
  montant!: number;

  @IsString()
  unite!: string;
}

/** Inscription freelance : diplôme, SIRET, RC Pro requis pour le badge "Vérifiée". */
export class RegisterFreelanceDto {
  @IsEmail()
  email!: string;

  @MinLength(10)
  password!: string;

  @IsString()
  prenom!: string;

  @IsString()
  nom!: string;

  @IsString()
  telephone!: string;

  @Matches(/^\d{14}$/, { message: "Le SIRET doit comporter 14 chiffres." })
  siret!: string;

  @IsString()
  villeBase!: string;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  zoneMobiliteKm?: number;

  @IsArray()
  @ArrayMinSize(1, { message: "Au moins une spécialité est requise." })
  @IsString({ each: true })
  specialtyNames!: string[];

  /** Seule la freelance fixe et affiche son tarif (règle structurante, non négociable). */
  @IsArray()
  @ArrayMinSize(1)
  tarifsAffiches!: TarifAfficheDto[];

  @IsBoolean()
  acceptCgu!: boolean;

  @IsOptional()
  @IsBoolean()
  acceptMarketing?: boolean;
}
