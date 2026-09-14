import { UserRole, VerificationDocumentType } from "@hair-renfort/db";

/** Pièces requises avant badge "Vérifiée" / "Salon vérifié" (brief, section Comptes & confiance). */
export const REQUIRED_DOCUMENTS: Record<UserRole, VerificationDocumentType[]> = {
  [UserRole.FREELANCE]: [
    VerificationDocumentType.DIPLOME,
    VerificationDocumentType.SIRET,
    VerificationDocumentType.RC_PRO,
  ],
  [UserRole.SALON]: [
    VerificationDocumentType.SIRET,
    VerificationDocumentType.ADRESSE_ETABLISSEMENT,
    VerificationDocumentType.IDENTITE_GERANT,
  ],
  [UserRole.ADMIN]: [],
};
