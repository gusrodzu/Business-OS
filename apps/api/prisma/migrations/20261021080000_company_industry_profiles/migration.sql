CREATE TABLE "CompanyIndustryProfile" (
 "id" TEXT NOT NULL,
 "companyId" TEXT NOT NULL,
 "activityKey" TEXT NOT NULL,
 "isPrimary" BOOLEAN NOT NULL DEFAULT false,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "CompanyIndustryProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CompanyIndustryProfile_companyId_activityKey_key" ON "CompanyIndustryProfile"("companyId","activityKey");
CREATE INDEX "CompanyIndustryProfile_companyId_idx" ON "CompanyIndustryProfile"("companyId");
ALTER TABLE "CompanyIndustryProfile" ADD CONSTRAINT "CompanyIndustryProfile_companyId_fkey"
 FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
