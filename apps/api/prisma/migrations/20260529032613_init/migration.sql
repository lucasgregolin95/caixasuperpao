-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CashClosing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bakery" TEXT NOT NULL DEFAULT 'Super Bom',
    "date" DATETIME NOT NULL,
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
    "pixValue" REAL NOT NULL DEFAULT 0,
    "cardDebit" REAL NOT NULL DEFAULT 0,
    "cardCredit" REAL NOT NULL DEFAULT 0,
    "cardTotal" REAL NOT NULL DEFAULT 0,
    "withdrawalValue" REAL NOT NULL DEFAULT 0,
    "adjustmentValue" REAL NOT NULL DEFAULT 0,
    "adjustmentDescription" TEXT,
    "totalCoins" REAL NOT NULL DEFAULT 0,
    "totalBills" REAL NOT NULL DEFAULT 0,
    "totalCash" REAL NOT NULL DEFAULT 0,
    "totalEntries" REAL NOT NULL DEFAULT 0,
    "totalExits" REAL NOT NULL DEFAULT 0,
    "totalFinal" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CashClosing_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "closingId" TEXT,
    "description" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_closingId_fkey" FOREIGN KEY ("closingId") REFERENCES "CashClosing" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");
