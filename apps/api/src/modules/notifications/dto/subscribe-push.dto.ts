import { IsOptional, IsString, IsUrl } from "class-validator";

export class SubscribePushDto {
  @IsUrl({ require_tld: false })
  endpoint!: string;

  @IsString()
  p256dh!: string;

  @IsString()
  auth!: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
