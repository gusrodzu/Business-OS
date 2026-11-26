CREATE TABLE "MessengerDirectMessage" (
 "id" TEXT NOT NULL,
 "companyId" TEXT NOT NULL,
 "senderId" TEXT NOT NULL,
 "recipientId" TEXT NOT NULL,
 "clientId" TEXT NOT NULL,
 "text" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "MessengerDirectMessage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "MessengerDirectMessage_companyId_senderId_clientId_key" ON "MessengerDirectMessage"("companyId","senderId","clientId");
CREATE INDEX "MessengerDirectMessage_companyId_senderId_recipientId_creat_idx" ON "MessengerDirectMessage"("companyId","senderId","recipientId","createdAt");
CREATE INDEX "MessengerDirectMessage_companyId_recipientId_senderId_creat_idx" ON "MessengerDirectMessage"("companyId","recipientId","senderId","createdAt");
