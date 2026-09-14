-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SALON', 'FREELANCE', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'EXCLUDED');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('CGU', 'MARKETING');

-- CreateEnum
CREATE TYPE "VerificationDocumentType" AS ENUM ('DIPLOME', 'SIRET', 'RC_PRO', 'IDENTITE_GERANT', 'ADRESSE_ETABLISSEMENT');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SalonSubscriptionTier" AS ENUM ('BASE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('NORMAL', 'URGENT', 'TRES_URGENT');

-- CreateEnum
CREATE TYPE "NeedStatus" AS ENUM ('OUVERT', 'POURVU', 'ANNULE', 'EXPIRE');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PROPOSEE', 'ACCEPTEE', 'TERMINEE', 'REFUSEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "CancelledByParty" AS ENUM ('SALON', 'FREELANCE');

-- CreateEnum
CREATE TYPE "InteractionAction" AS ENUM ('LIKED', 'PASSED');

-- CreateEnum
CREATE TYPE "InteractionActorType" AS ENUM ('SALON', 'FREELANCE');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('NON_PAIEMENT', 'COMPORTEMENT_INAPPROPRIE', 'NON_RESPECT_CONDITIONS', 'FAUSSE_INFORMATION');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('RECU', 'EN_COURS_EXAMEN', 'TRAITE');

-- CreateEnum
CREATE TYPE "ReportIssue" AS ENUM ('SANS_SUITE', 'AVERTISSEMENT', 'SUSPENSION', 'EXCLUSION');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('SALON_BASE', 'SALON_PREMIUM', 'FREELANCE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "anonymizedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ConsentType" NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataExportRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),
    "fileUrl" TEXT,

    CONSTRAINT "DataExportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "VerificationDocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedByAdminId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalonProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "raisonSociale" TEXT NOT NULL,
    "siret" TEXT NOT NULL,
    "nomGerant" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "codePostal" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "badgeVerifie" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionTier" "SalonSubscriptionTier" NOT NULL DEFAULT 'BASE',
    "isFoundingCohort" BOOLEAN NOT NULL DEFAULT false,
    "freeAccessUntil" TIMESTAMP(3),
    "reliabilityScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalonProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelanceSpecialty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "FreelanceSpecialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelanceProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "siret" TEXT NOT NULL,
    "bio" TEXT,
    "villeBase" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "zoneMobiliteKm" INTEGER NOT NULL DEFAULT 15,
    "badgeVerifie" BOOLEAN NOT NULL DEFAULT false,
    "tarifsAffiches" JSONB NOT NULL,
    "isFoundingCohort" BOOLEAN NOT NULL DEFAULT false,
    "freeAccessUntil" TIMESTAMP(3),
    "reliabilityScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreelanceProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioItem" (
    "id" TEXT NOT NULL,
    "freelanceProfileId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "freelanceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionNeed" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "NeedStatus" NOT NULL DEFAULT 'OUVERT',
    "urgencyLevel" "UrgencyLevel" NOT NULL DEFAULT 'NORMAL',
    "urgencyLastComputedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissionNeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionSlot" (
    "id" TEXT NOT NULL,
    "missionNeedId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "heureDebut" TEXT NOT NULL,
    "heureFin" TEXT NOT NULL,

    CONSTRAINT "MissionSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionAssignment" (
    "id" TEXT NOT NULL,
    "missionNeedId" TEXT NOT NULL,
    "freelanceId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PROPOSEE',
    "tarifAffiche" JSONB,
    "proposedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "refusedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" "CancelledByParty",
    "cancelReason" TEXT,
    "validatedBySalonAt" TIMESTAMP(3),
    "validatedByFreelanceAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissionAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReliabilityEvent" (
    "id" TEXT NOT NULL,
    "missionAssignmentId" TEXT NOT NULL,
    "salonId" TEXT,
    "freelanceId" TEXT,
    "party" "CancelledByParty" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReliabilityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "missionAssignmentId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "ponctualite" INTEGER NOT NULL,
    "technique" INTEGER NOT NULL,
    "relationnel" INTEGER NOT NULL,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL,
    "actorType" "InteractionActorType" NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "missionNeedId" TEXT,
    "targetFreelanceId" TEXT,
    "targetSalonId" TEXT,
    "action" "InteractionAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "freelanceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "templateId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "forRole" "UserRole" NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedId" TEXT NOT NULL,
    "missionAssignmentId" TEXT,
    "category" "ReportCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'RECU',
    "issue" "ReportIssue",
    "handledByAdminId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "salonId" TEXT,
    "freelanceId" TEXT,
    "plan" "SubscriptionPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractGeneration" (
    "id" TEXT NOT NULL,
    "missionAssignmentId" TEXT,
    "requestedByUserId" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "paidUnit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActionLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedByAdminId" TEXT,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "_FreelanceSpecialties" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");

-- CreateIndex
CREATE INDEX "ConsentRecord_userId_idx" ON "ConsentRecord"("userId");

-- CreateIndex
CREATE INDEX "VerificationDocument_userId_type_idx" ON "VerificationDocument"("userId", "type");

-- CreateIndex
CREATE INDEX "VerificationDocument_status_idx" ON "VerificationDocument"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SalonProfile_userId_key" ON "SalonProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SalonProfile_siret_key" ON "SalonProfile"("siret");

-- CreateIndex
CREATE INDEX "SalonProfile_ville_idx" ON "SalonProfile"("ville");

-- CreateIndex
CREATE INDEX "SalonProfile_latitude_longitude_idx" ON "SalonProfile"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "FreelanceSpecialty_name_key" ON "FreelanceSpecialty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FreelanceProfile_userId_key" ON "FreelanceProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FreelanceProfile_siret_key" ON "FreelanceProfile"("siret");

-- CreateIndex
CREATE INDEX "FreelanceProfile_villeBase_idx" ON "FreelanceProfile"("villeBase");

-- CreateIndex
CREATE INDEX "FreelanceProfile_latitude_longitude_idx" ON "FreelanceProfile"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_salonId_freelanceId_key" ON "Favorite"("salonId", "freelanceId");

-- CreateIndex
CREATE INDEX "MissionNeed_status_urgencyLevel_idx" ON "MissionNeed"("status", "urgencyLevel");

-- CreateIndex
CREATE INDEX "MissionNeed_specialtyId_idx" ON "MissionNeed"("specialtyId");

-- CreateIndex
CREATE INDEX "MissionSlot_missionNeedId_idx" ON "MissionSlot"("missionNeedId");

-- CreateIndex
CREATE INDEX "MissionSlot_date_idx" ON "MissionSlot"("date");

-- CreateIndex
CREATE INDEX "MissionAssignment_freelanceId_status_idx" ON "MissionAssignment"("freelanceId", "status");

-- CreateIndex
CREATE INDEX "MissionAssignment_missionNeedId_idx" ON "MissionAssignment"("missionNeedId");

-- CreateIndex
CREATE INDEX "ReliabilityEvent_salonId_idx" ON "ReliabilityEvent"("salonId");

-- CreateIndex
CREATE INDEX "ReliabilityEvent_freelanceId_idx" ON "ReliabilityEvent"("freelanceId");

-- CreateIndex
CREATE INDEX "Review_targetUserId_idx" ON "Review"("targetUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_missionAssignmentId_authorUserId_key" ON "Review"("missionAssignmentId", "authorUserId");

-- CreateIndex
CREATE INDEX "Interaction_actorUserId_idx" ON "Interaction"("actorUserId");

-- CreateIndex
CREATE INDEX "Interaction_targetFreelanceId_idx" ON "Interaction"("targetFreelanceId");

-- CreateIndex
CREATE INDEX "Interaction_targetSalonId_idx" ON "Interaction"("targetSalonId");

-- CreateIndex
CREATE INDEX "SearchLog_userId_idx" ON "SearchLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_salonId_freelanceId_key" ON "Conversation"("salonId", "freelanceId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Report_reportedId_idx" ON "Report"("reportedId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_salonId_key" ON "Subscription"("salonId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_freelanceId_key" ON "Subscription"("freelanceId");

-- CreateIndex
CREATE INDEX "AdminActionLog_adminId_idx" ON "AdminActionLog"("adminId");

-- CreateIndex
CREATE INDEX "AdminActionLog_targetType_targetId_idx" ON "AdminActionLog"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "_FreelanceSpecialties_AB_unique" ON "_FreelanceSpecialties"("A", "B");

-- CreateIndex
CREATE INDEX "_FreelanceSpecialties_B_index" ON "_FreelanceSpecialties"("B");

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExportRequest" ADD CONSTRAINT "DataExportRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationDocument" ADD CONSTRAINT "VerificationDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalonProfile" ADD CONSTRAINT "SalonProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelanceProfile" ADD CONSTRAINT "FreelanceProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioItem" ADD CONSTRAINT "PortfolioItem_freelanceProfileId_fkey" FOREIGN KEY ("freelanceProfileId") REFERENCES "FreelanceProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_freelanceId_fkey" FOREIGN KEY ("freelanceId") REFERENCES "FreelanceProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionNeed" ADD CONSTRAINT "MissionNeed_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionNeed" ADD CONSTRAINT "MissionNeed_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "FreelanceSpecialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionSlot" ADD CONSTRAINT "MissionSlot_missionNeedId_fkey" FOREIGN KEY ("missionNeedId") REFERENCES "MissionNeed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionAssignment" ADD CONSTRAINT "MissionAssignment_missionNeedId_fkey" FOREIGN KEY ("missionNeedId") REFERENCES "MissionNeed"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionAssignment" ADD CONSTRAINT "MissionAssignment_freelanceId_fkey" FOREIGN KEY ("freelanceId") REFERENCES "FreelanceProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReliabilityEvent" ADD CONSTRAINT "ReliabilityEvent_missionAssignmentId_fkey" FOREIGN KEY ("missionAssignmentId") REFERENCES "MissionAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReliabilityEvent" ADD CONSTRAINT "ReliabilityEvent_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReliabilityEvent" ADD CONSTRAINT "ReliabilityEvent_freelanceId_fkey" FOREIGN KEY ("freelanceId") REFERENCES "FreelanceProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_missionAssignmentId_fkey" FOREIGN KEY ("missionAssignmentId") REFERENCES "MissionAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_missionNeedId_fkey" FOREIGN KEY ("missionNeedId") REFERENCES "MissionNeed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchLog" ADD CONSTRAINT "SearchLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedId_fkey" FOREIGN KEY ("reportedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_missionAssignmentId_fkey" FOREIGN KEY ("missionAssignmentId") REFERENCES "MissionAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "SalonProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_freelanceId_fkey" FOREIGN KEY ("freelanceId") REFERENCES "FreelanceProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FreelanceSpecialties" ADD CONSTRAINT "_FreelanceSpecialties_A_fkey" FOREIGN KEY ("A") REFERENCES "FreelanceProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FreelanceSpecialties" ADD CONSTRAINT "_FreelanceSpecialties_B_fkey" FOREIGN KEY ("B") REFERENCES "FreelanceSpecialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
