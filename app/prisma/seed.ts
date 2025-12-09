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
    const challenge = await prisma.challenge.upsert({
        where: { name: "Diferenciação de Notas Musicais" },
        update: {
            description: "Desafie-se a distinguir entre diferentes notas musicais!",
            requirements: "Não é necessário nenhum conhecimento prévio!",
            instructions: "Ouça a nota alvo e selecione a opção correta entre as alternativas.",
            isStatic: 1,
            identifier: "notes-differentiation",
        },
        create: {
            name: "Diferenciação de Notas Musicais",
            identifier: "notes-differentiation",
            description: "Desafie-se a distinguir entre diferentes notas musicais!",
            requirements: "Não é necessário nenhum conhecimento prévio!",
            instructions: "Ouça a nota alvo e selecione a opção correta entre as alternativas.",
            isStatic: 1
        },
    });

    const parameters = await seedNotesDifferentiationParameters();
    await seedNotesDifferentiationLevels(challenge.id, parameters);
}

async function seedNotesDifferentiationParameters() {
    const optionsNumberParam = await prisma.parameter.upsert({
        where: { name: "Número de opções" },
      update: { description: "Define o número de opções (notas musicais) a serem comparadas.", identifier: "numero-de-opcoes" },
      create: { name: "Número de opções", description: "Define o número de opções (notas musicais) a serem comparadas.", identifier: "numero-de-opcoes" },
    });
    const optionsReplayParam = await prisma.parameter.upsert({
        where: { name: "Replay de opções" },
      update: { description: "Permite que o usuário ouça as notas de cada opção novamente.", identifier: "replay-de-opcoes" },
      create: { name: "Replay de opções", description: "Permite que o usuário ouça as notas de cada opção novamente.", identifier: "replay-de-opcoes" },
    });
    const targetReplayParam = await prisma.parameter.upsert({
        where: { name: "Replay de nota alvo" },
      update: { description: "Permite que o usuário ouça a nota alvo novamente.", identifier: "replay-nota-alvo" },
      create: { name: "Replay de nota alvo", description: "Permite que o usuário ouça a nota alvo novamente.", identifier: "replay-nota-alvo" },
    });
    
    let canPauseParam = await prisma.parameter.findFirst({
        where: { identifier: "pode-pausar" }
    });
    
    if (!canPauseParam) {
        canPauseParam = await prisma.parameter.create({
            data: { 
                name: "Pode pausar", 
                description: "Permite que o usuário pause a rodada durante o tempo corrido.", 
                identifier: "pode-pausar" 
            }
        });
    }

    return {
        optionsNumberParamId: optionsNumberParam.id,
        optionsReplayParamId: optionsReplayParam.id,
        targetReplayParamId: targetReplayParam.id,
        canPauseParamId: canPauseParam.id,
    };
}

async function seedNotesDifferentiationLevels(challengeId: number, parameters: any) {
    const {
        optionsNumberParamId, optionsReplayParamId,
        targetReplayParamId, canPauseParamId
    } = parameters;
    const existingBeginner = await prisma.level.findFirst({ where: { name: "Iniciante", challengeId } });
    if (!existingBeginner) {
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
                },
                {
                    parameterId: canPauseParamId,
                    value: 'true',
                }
            ]
        }
      }});
    }
    const existingInter = await prisma.level.findFirst({ where: { name: "Intermediário", challengeId } });
    if (!existingInter) {
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
                },
                {
                    parameterId: canPauseParamId,
                    value: 'false',
                }
            ]
        }
      }});
    }
    const existingAdv = await prisma.level.findFirst({ where: { name: "Avançado", challengeId } });
    if (!existingAdv) {
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
                },
                {
                    parameterId: canPauseParamId,
                    value: 'false',
                }
            ]
        }
      }});
    }
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
