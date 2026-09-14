import { IsIn } from "class-validator";

export class SwipeDto {
  @IsIn(["LIKED", "PASSED"])
  action!: "LIKED" | "PASSED";
}
