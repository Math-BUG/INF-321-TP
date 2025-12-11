-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isAdmin" INTEGER NOT NULL DEFAULT 0,
    "sex" TEXT,
    "phone" TEXT,
    "birthdate" DATETIME,
    "address" TEXT,
    "musicExperience" TEXT,
    "deleted" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_users" ("address", "birthdate", "createdAt", "email", "id", "isAdmin", "musicExperience", "name", "passwordHash", "phone", "sex") SELECT "address", "birthdate", "createdAt", "email", "id", "isAdmin", "musicExperience", "name", "passwordHash", "phone", "sex" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
