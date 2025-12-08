import "dotenv/config";
import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const levels = await prisma.level.findMany({
    include: {
      parameterVals: {
        include: {
          parameter: true
        }
      }
    }
  });
  
  levels.forEach(level => {
    console.log(`\n${level.name}:`);
    level.parameterVals.forEach(pv => {
      console.log(`  - ${pv.parameter.name} (${pv.parameter.identifier}): ${pv.value}`);
    });
  });
  
  await prisma.$disconnect();
}

main();
