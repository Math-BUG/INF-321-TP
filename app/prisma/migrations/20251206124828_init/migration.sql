-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "sex" TEXT NOT NULL,
    "phone" TEXT,
    "birthDate" DATETIME,
    "address" TEXT,
    "previousExperience" BOOLEAN
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
