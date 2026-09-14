import { SetMetadata } from "@nestjs/common";
import { UserRole } from "@hair-renfort/db";

export const ROLES_KEY = "roles";
/**
 * Déclare le(s) rôle(s) autorisé(s) sur un endpoint. Combiné à RolesGuard, c'est la
 * première barrière qui empêche par construction un appel "freelance -> liste des
 * freelances" ou "salon -> liste des salons" (voir ARCHITECTURE.md, section 2).
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
