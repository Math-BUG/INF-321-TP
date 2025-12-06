/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "challenges" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "requirements" TEXT,
    "isStatic" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "parameters" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "challengeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "parameters_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "levels" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "challengeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "numRounds" INTEGER NOT NULL,
    "timePerRound" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "levels_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "level_parameter_values" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "levelId" INTEGER NOT NULL,
    "parameterId" INTEGER NOT NULL,
    "value" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "level_parameter_values_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "level_parameter_values_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "parameters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "matches" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "levelId" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "isComplete" INTEGER NOT NULL DEFAULT 0,
    "totalRounds" INTEGER,
    "currentRound" INTEGER,
    "score" INTEGER,
    "totalCorrect" INTEGER,
    "totalIncorrect" INTEGER,
    "stateJson" TEXT,
    CONSTRAINT "matches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "matches_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rounds" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matchId" INTEGER NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "prompt" TEXT,
    "optionsJson" TEXT,
    "correctOption" INTEGER,
    "chosenOption" INTEGER,
    "timeTaken" INTEGER,
    "isCorrect" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rounds_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "parameters_challengeId_idx" ON "parameters"("challengeId");

-- CreateIndex
CREATE INDEX "levels_challengeId_idx" ON "levels"("challengeId");

-- CreateIndex
CREATE INDEX "level_parameter_values_levelId_idx" ON "level_parameter_values"("levelId");

-- CreateIndex
CREATE INDEX "level_parameter_values_parameterId_idx" ON "level_parameter_values"("parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "level_parameter_values_levelId_parameterId_key" ON "level_parameter_values"("levelId", "parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "matches_userId_idx" ON "matches"("userId");

-- CreateIndex
CREATE INDEX "matches_levelId_idx" ON "matches"("levelId");

-- CreateIndex
CREATE INDEX "rounds_matchId_idx" ON "rounds"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "rounds_matchId_roundNumber_key" ON "rounds"("matchId", "roundNumber");
