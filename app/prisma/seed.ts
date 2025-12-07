import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || ':memory:' });
const prisma = new PrismaClient({ adapter });

async function main() {
    await seedUsers();
    await seedChallenges();
}

async function seedChallenges() {
    await seedNotesDifferentiationChallenge();
    await seedIntervalRecognitionChallenge();
}
async function seedNotesDifferentiationChallenge() {
    const challenge = await prisma.challenge.create({
        data: {
            name: "Diferenciação de Notas Musicais",
            description: "Desafie-se a distinguir entre diferentes notas musicais!",
            requirements: "Não é necessário nenhum conhecimento prévio!",
            isStatic: 1
        },
    });

    const parameters = await seedNotesDifferentiationParameters(challenge.id);
    await seedNotesDifferentiationLevels(challenge.id, parameters);
}

async function seedNotesDifferentiationParameters(challengeId: number) {
    const optionsNumberParam = await prisma.parameter.create({data: 
        {
            name: "Número de opções",
            description: "Define o número de opções (notas musicais) a serem comparadas.",
            challengeId: challengeId,
        },
    });
    const optionsReplayParam = await prisma.parameter.create({data:
        {
            name: "Replay de opções",
            description: "Permite que o usuário ouça as notas de cada opção novamente.",
            challengeId: challengeId,
        }
    });
    const targetReplayParam = await prisma.parameter.create({data:
        {
            name: "Replay de nota alvo",
            description: "Permite que o usuário ouça a nota alvo novamente.",
            challengeId: challengeId,
        }
    });

    return {
        optionsNumberParamId: optionsNumberParam.id,
        optionsReplayParamId: optionsReplayParam.id,
        targetReplayParamId: targetReplayParam.id,
    };
}

async function seedNotesDifferentiationLevels(challengeId: number, parameters: any) {
    const {
        optionsNumberParamId, optionsReplayParamId,
        targetReplayParamId
    } = parameters;
    await prisma.level.create({data: {
        name: "Iniciante",
        challengeId: challengeId,
        numRounds: 10,
        timePerRound: 30,
        parameterVals: {
            create: [
                {
                    parameterId: optionsNumberParamId,
                    value: '2',
                },
                {
                    parameterId: optionsReplayParamId,
                    value: 'true',
                },
                {
                    parameterId: targetReplayParamId,
                    value: 'true',
                }
            ]
        }
    }});
    await prisma.level.create({data: {
        name: "Intermediário",
        challengeId: challengeId,
        numRounds: 10,
        timePerRound: 15,
        parameterVals: {
            create: [
                {
                    parameterId: optionsNumberParamId,
                    value: '3',
                },
                {
                    parameterId: optionsReplayParamId,
                    value: 'false',
                },
                {
                    parameterId: targetReplayParamId,
                    value: 'true',
                }
            ]
        }
    }});
    await prisma.level.create({data: {
        name: "Avançado",
        challengeId: challengeId,
        numRounds: 10,
        timePerRound: 10,
        parameterVals: {
            create: [
                {
                    parameterId: optionsNumberParamId,
                    value: '4',
                },
                {
                    parameterId: optionsReplayParamId,
                    value: 'false',
                },
                {
                    parameterId: targetReplayParamId,
                    value: 'false',
                }
            ]
        }
    }});
}

async function seedIntervalRecognitionChallenge() {
}

async function seedUsers() {
    await seedAdminUser();
    await seedDefaultUser();
}

async function seedAdminUser() {
    
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
}

async function seedDefaultUser() {
    

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
