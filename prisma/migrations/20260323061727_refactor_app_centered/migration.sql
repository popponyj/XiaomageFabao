/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `accountId` on the `App` table. All the data in the column will be lost.
  - You are about to drop the column `apkPath` on the `App` table. All the data in the column will be lost.
  - You are about to drop the column `brief` on the `App` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `App` table. All the data in the column will be lost.
  - You are about to drop the column `categoryName` on the `App` table. All the data in the column will be lost.
  - You are about to drop the column `desc` on the `App` table. All the data in the column will be lost.
  - You are about to drop the column `keywords` on the `App` table. All the data in the column will be lost.
  - You are about to drop the column `privacyUrl` on the `App` table. All the data in the column will be lost.
  - You are about to drop the column `versionCode` on the `App` table. All the data in the column will be lost.
  - You are about to drop the column `versionName` on the `App` table. All the data in the column will be lost.
  - Added the required column `storeAccountId` to the `ReleaseRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeType` to the `ReleaseRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Account";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "StoreAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appId" TEXT NOT NULL,
    "storeType" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "categoryId" TEXT,
    "categoryName" TEXT,
    "keywords" TEXT,
    "desc" TEXT,
    "brief" TEXT,
    "privacyUrl" TEXT,
    "apkPath" TEXT,
    "versionName" TEXT,
    "versionCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoreAccount_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_App" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "iconPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_App" ("createdAt", "iconPath", "id", "name", "packageName", "updatedAt") SELECT "createdAt", "iconPath", "id", "name", "packageName", "updatedAt" FROM "App";
DROP TABLE "App";
ALTER TABLE "new_App" RENAME TO "App";
CREATE TABLE "new_ReleaseRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appId" TEXT NOT NULL,
    "storeAccountId" TEXT NOT NULL,
    "storeType" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "versionCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReleaseRecord_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReleaseRecord_storeAccountId_fkey" FOREIGN KEY ("storeAccountId") REFERENCES "StoreAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReleaseRecord" ("appId", "createdAt", "id", "message", "status", "versionCode", "versionName") SELECT "appId", "createdAt", "id", "message", "status", "versionCode", "versionName" FROM "ReleaseRecord";
DROP TABLE "ReleaseRecord";
ALTER TABLE "new_ReleaseRecord" RENAME TO "ReleaseRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "StoreAccount_appId_storeType_key" ON "StoreAccount"("appId", "storeType");
