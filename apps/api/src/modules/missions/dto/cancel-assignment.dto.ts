import { IsString, MinLength } from "class-validator";

/** Annulation d'une mission déjà ACCEPTEE : manquement contractuel, motif obligatoire,
 * tracé et impactant le taux de fiabilité (brief, section Annulations & fiabilité). */
export class CancelAssignmentDto {
  @IsString()
  @MinLength(3)
  reason!: string;
}
