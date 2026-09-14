import {
  IsBoolean,
  IsEmail,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

/** Inscription salon : vérifications SIRET/adresse/gérant obligatoires (brief, section Comptes & confiance). */
export class RegisterSalonDto {
  @IsEmail()
  email!: string;

  @MinLength(10)
  password!: string;

  @IsString()
  raisonSociale!: string;

  @Matches(/^\d{14}$/, { message: "Le SIRET doit comporter 14 chiffres." })
  siret!: string;

  @IsString()
  nomGerant!: string;

  @IsString()
  telephone!: string;

  @IsString()
  adresse!: string;

  @IsString()
  ville!: string;

  @IsString()
  codePostal!: string;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsOptional()
  @IsString()
  description?: string;

  /** CGU : consentement explicite obligatoire, jamais pré-coché côté front. */
  @IsBoolean()
  acceptCgu!: boolean;

  @IsOptional()
  @IsBoolean()
  acceptMarketing?: boolean;
}
