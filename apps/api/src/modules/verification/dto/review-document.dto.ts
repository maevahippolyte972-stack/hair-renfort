import { IsEnum, IsOptional, IsString } from "class-validator";
import { VerificationStatus } from "@hair-renfort/db";

export class ReviewDocumentDto {
  @IsEnum(VerificationStatus)
  status!: VerificationStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
