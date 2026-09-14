import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { AccountStatus } from "@hair-renfort/db";
import type { AuthenticatedUser } from "../types/authenticated-user";

/**
 * Brief: "Aucun compte (salon ou freelance) ne peut publier ni candidater tant que
 * sa vérification n'est pas validée." Appliqué sur tout endpoint de publication de
 * besoin ou de candidature/acceptation de mission.
 */
@Injectable()
export class VerifiedAccountGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;
    if (!user) throw new ForbiddenException("Authentification requise.");

    if (user.status === AccountStatus.PENDING_VERIFICATION) {
      throw new ForbiddenException(
        "Ce compte doit d'abord être vérifié (badge en attente de validation) avant de publier ou de candidater.",
      );
    }
    if (user.status === AccountStatus.SUSPENDED || user.status === AccountStatus.EXCLUDED) {
      throw new ForbiddenException("Ce compte est actuellement suspendu.");
    }
    return true;
  }
}
