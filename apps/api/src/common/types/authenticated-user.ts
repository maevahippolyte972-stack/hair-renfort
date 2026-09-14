import { AccountStatus, UserRole } from "@hair-renfort/db";

/** Payload attaché à `request.user` par JwtStrategy après validation du token. */
export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
  status: AccountStatus;
  /** id du SalonProfile ou FreelanceProfile associé (jamais les deux). */
  profileId: string | null;
}
