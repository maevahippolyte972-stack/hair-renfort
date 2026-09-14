import { IsEnum } from "class-validator";
import { ReportIssue } from "@hair-renfort/db";

export class HandleReportDto {
  @IsEnum(ReportIssue)
  issue!: ReportIssue;
}
