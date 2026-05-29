-- CreateTable (PostgreSQL)
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashClosing" (
    "id" TEXT NOT NULL,
    "bakery" TEXT NOT NULL DEFAULT 'Super Bom',
    "date" TIMESTAMP(3) NOT NULL,
    "shift" TEXT NOT NULL,
    "cashNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "notes" TEXT,
    "coins005" INTEGER NOT NULL DEFAULT 0,
    "coins010" INTEGER NOT NULL DEFAULT 0,
    "coins025" INTEGER NOT NULL DEFAULT 0,
    "coins050" INTEGER NOT NULL DEFAULT 0,
    "coins100" INTEGER NOT NULL DEFAULT 0,
    "bills2" INTEGER NOT NULL DEFAULT 0,
    "bills5" INTEGER NOT NULL DEFAULT 0,
    "bills10" INTEGER NOT NULL DEFAULT 0,
    "bills20" INTEGER NOT NULL DEFAULT 0,
    "bills50" INTEGER NOT NULL DEFAULT 0,
    "bills100" INTEGER NOT NULL DEFAULT 0,
    "pixValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cardDebit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cardCredit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cardTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "withdrawalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adjustmentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adjustmentDescription" TEXT,
    "totalCoins" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalBills" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCash" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEntries" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalExits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalFinal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashClosing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "closingId" TEXT,
    "description" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashClosing" ADD CONSTRAINT "CashClosing_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_closingId_fkey" FOREIGN KEY ("closingId") REFERENCES "CashClosing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
