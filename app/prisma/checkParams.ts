import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || ':memory:' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const params = await prisma.parameter.findMany();
  console.log(JSON.stringify(params, null, 2));
  await prisma.$disconnect();
}

main();
