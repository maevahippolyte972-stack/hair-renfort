import { IsObject } from "class-validator";

export class UpdateSettingDto {
  @IsObject()
  value!: Record<string, unknown>;
}
