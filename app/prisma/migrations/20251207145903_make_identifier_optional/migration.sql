/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `challenges` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "challenges" ADD COLUMN "identifier" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "challenges_identifier_key" ON "challenges"("identifier");
