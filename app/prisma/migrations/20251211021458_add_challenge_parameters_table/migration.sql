-- CreateTable
CREATE TABLE "challenge_parameters" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "challengeId" INTEGER NOT NULL,
    "parameterId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "challenge_parameters_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "challenge_parameters_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "parameters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "challenge_parameters_challengeId_idx" ON "challenge_parameters"("challengeId");

-- CreateIndex
CREATE INDEX "challenge_parameters_parameterId_idx" ON "challenge_parameters"("parameterId");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_parameters_challengeId_parameterId_key" ON "challenge_parameters"("challengeId", "parameterId");
