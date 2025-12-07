/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `parameters` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "parameters" ADD COLUMN "identifier" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "parameters_identifier_key" ON "parameters"("identifier");
