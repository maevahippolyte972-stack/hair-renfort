import { IsEnum, IsString } from "class-validator";
import { VerificationDocumentType } from "@hair-renfort/db";

export class SubmitDocumentDto {
  @IsEnum(VerificationDocumentType)
  type!: VerificationDocumentType;

  /**
   * URL du fichier déjà déposé dans le bucket objet UE (upload signé géré en amont,
   * hors scope de ce DTO). L'API ne reçoit jamais le binaire directement.
   */
  @IsString()
  fileUrl!: string;
}
