/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `challenges` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `levels` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `parameters` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "challenges" ADD COLUMN "instructions" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "challenges_name_key" ON "challenges"("name");

-- CreateIndex
CREATE UNIQUE INDEX "levels_name_key" ON "levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "parameters_name_key" ON "parameters"("name");
