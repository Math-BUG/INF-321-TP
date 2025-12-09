import "dotenv/config";
import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || ':memory:' });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find the pause parameter
  const pauseParam = await prisma.parameter.findFirst({
    where: { identifier: "pode-pausar" }
  });

  if (!pauseParam) {
    console.log("Pause parameter not found!");
    return;
  }

  console.log(`Found pause parameter with ID: ${pauseParam.id}`);

  // Find the challenge
  const challenge = await prisma.challenge.findFirst({
    where: { identifier: "notes-differentiation" }
  });

  if (!challenge) {
    console.log("Challenge not found!");
    return;
  }

  const levels = await prisma.level.findMany({
    where: { challengeId: challenge.id }
  });

  console.log(`Found ${levels.length} levels`);

  for (const level of levels) {
    const existing = await prisma.parameterValue.findFirst({
      where: {
        levelId: level.id,
        parameterId: pauseParam.id
      }
    });

    if (existing) {
      console.log(`Level "${level.name}" already has pause parameter`);
      continue;
    }

    const value = level.name.includes("Iniciante") ? "true" : "false";

    await prisma.parameterValue.create({
      data: {
        levelId: level.id,
        parameterId: pauseParam.id,
        value: value
      }
    });

    console.log(`Added pause parameter to "${level.name}" with value: ${value}`);
  }

  console.log("Done!");
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
