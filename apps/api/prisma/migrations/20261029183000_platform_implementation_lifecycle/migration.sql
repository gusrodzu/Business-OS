-- Additive phase-2 platform implementation ledger. No existing tenant records are migrated
-- or modified. Execution requires the normal Prisma migration review/deploy workflow.
CREATE TYPE "ImplementationKind" AS ENUM ('PROSPECT', 'REGISTERED_TENANT');
CREATE TYPE "ImplementationStage" AS ENUM ('LEAD', 'CONFIGURATION', 'TESTING', 'ACTIVE', 'PAUSED', 'CANCELLED');

CREATE TABLE "PlatformImplementation" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "kind" "ImplementationKind" NOT NULL DEFAULT 'PROSPECT',
  "stage" "ImplementationStage" NOT NULL DEFAULT 'LEAD',
  "companyId" TEXT,
  "industryKey" TEXT,
  "scianCode" TEXT,
  "contactEmail" TEXT,
  "planKey" TEXT,
  "requestedModuleKeys" JSONB,
  "ownerUserId" TEXT,
  "targetDate" TIMESTAMP(3),
  "activatedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlatformImplementation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlatformImplementationEvent" (
  "id" TEXT NOT NULL,
  "implementationId" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "fromStage" "ImplementationStage",
  "toStage" "ImplementationStage" NOT NULL,
  "reason" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlatformImplementationEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlatformImplementation_companyId_key" ON "PlatformImplementation"("companyId");
CREATE INDEX "PlatformImplementation_stage_createdAt_idx" ON "PlatformImplementation"("stage", "createdAt");
CREATE INDEX "PlatformImplementation_kind_createdAt_idx" ON "PlatformImplementation"("kind", "createdAt");
CREATE INDEX "PlatformImplementationEvent_implementationId_createdAt_idx" ON "PlatformImplementationEvent"("implementationId", "createdAt");
CREATE INDEX "PlatformImplementationEvent_actorUserId_createdAt_idx" ON "PlatformImplementationEvent"("actorUserId", "createdAt");

ALTER TABLE "PlatformImplementation"
  ADD CONSTRAINT "PlatformImplementation_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PlatformImplementationEvent"
  ADD CONSTRAINT "PlatformImplementationEvent_implementationId_fkey"
  FOREIGN KEY ("implementationId") REFERENCES "PlatformImplementation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
