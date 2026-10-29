-- Optional, non-destructive unique request key for Super Admin prospect creation.
ALTER TABLE "PlatformImplementation" ADD COLUMN "requestKey" TEXT;
CREATE UNIQUE INDEX "PlatformImplementation_requestKey_key" ON "PlatformImplementation"("requestKey");
