-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_parameters" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "identifier" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_parameters" ("description", "id", "identifier", "name") SELECT "description", "id", "identifier", "name" FROM "parameters";
DROP TABLE "parameters";
ALTER TABLE "new_parameters" RENAME TO "parameters";
CREATE UNIQUE INDEX "parameters_name_key" ON "parameters"("name");
CREATE UNIQUE INDEX "parameters_identifier_key" ON "parameters"("identifier");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
