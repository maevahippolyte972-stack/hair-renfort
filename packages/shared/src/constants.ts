/**
 * Constantes métier partagées entre l'API et le web.
 * Les seuils réels servis à l'application viennent de PlatformSetting (back-office),
 * ces valeurs ne sont que les défauts de secours / de seed (brief : "à définir avec
 * la fondatrice avant développement").
 */

export const DEFAULT_URGENCY_THRESHOLDS_HOURS = {
  urgent: 48,
  tresUrgent: 24,
} as const;

export const DEFAULT_RELIABILITY_SANCTION = {
  windowDays: 90,
  visibilityReductionThreshold: 2,
  suspensionThreshold: 4,
} as const;

export const FOUNDING_COHORTS = {
  freelanceSlots: 200,
  freelanceFreeMonths: 6,
  salonSlots: 50,
  salonFreeMonths: 3,
} as const;

export const TRIAL_DAYS = 30;

export const SUBSCRIPTION_PRICES_EUR = {
  SALON_BASE: 50,
  SALON_PREMIUM: 99,
  FREELANCE: 19,
} as const;

export const REPORT_CATEGORIES = [
  "NON_PAIEMENT",
  "COMPORTEMENT_INAPPROPRIE",
  "NON_RESPECT_CONDITIONS",
  "FAUSSE_INFORMATION",
] as const;

export const BRAND_COLORS = {
  ivoireChaud: "#F5F1E8",
  noirChaud: "#1C1712",
  laiton: "#A8793E",
  bordeaux: "#6B2737",
  vertConfirmation: "#4C6B4F",
} as const;
