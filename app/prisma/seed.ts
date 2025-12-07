import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || ':memory:' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "adminpass";
  const hashed = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Admin",
      passwordHash: hashed,
      isAdmin: 1,
      sex: "N/A",
    },
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash: hashed,
      isAdmin: 1,
      sex: "N/A",
    },
  });

  console.log("Seeded admin:", adminEmail);

  // Create a non-admin test user (bcrypt)
  const testEmail = process.env.TEST_EMAIL || "test@example.com";
  const testPassword = process.env.TEST_PASSWORD || "Password123";
  const testHashed = await bcrypt.hash(testPassword, 10);

  await prisma.user.upsert({
    where: { email: testEmail },
    update: {
      name: "Test User",
      passwordHash: testHashed,
      isAdmin: 0,
      sex: "N/A",
    },
    create: {
      name: "Test User",
      email: testEmail,
      passwordHash: testHashed,
      isAdmin: 0,
      sex: "N/A",
    },
  });

  console.log("Seeded test user:", testEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
