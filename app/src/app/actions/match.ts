"use server";

import prisma from "../../lib/prisma";

export async function fetchLevelDetails(levelId: number) {
  const level = await prisma.level.findUnique({
    where: { id: levelId },
    select: {
      id: true,
      name: true,
      numRounds: true,
      timePerRound: true,
      challenge: {
        select: {
          identifier: true,
        }
      },
      parameterVals: {
        select: {
          parameter: {
            select: {
              identifier: true,
              name: true,
            }
          },
          value: true,
        }
      }
    }
  });

  return level;
}

export async function createMatch(userId: number, levelId: number) {
  const match = await prisma.match.create({
    data: {
      userId,
      levelId,
      totalRounds: 0,
      currentRound: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
    },
    select: {
      id: true,
      levelId: true,
      level: {
        select: {
          numRounds: true,
          timePerRound: true,
          challenge: {
            select: {
              identifier: true,
            }
          },
          parameterVals: {
            select: {
              parameter: {
                select: {
                  identifier: true,
                }
              },
              value: true,
            }
          }
        }
      }
    }
  });

  return match;
}

export async function updateMatchResults(
  matchId: number,
  totalCorrect: number,
  totalIncorrect: number,
  totalRounds: number
) {
  const match = await prisma.match.update({
    where: { id: matchId },
    data: {
      isComplete: 1,
      finishedAt: new Date(),
      totalCorrect,
      totalIncorrect,
      totalRounds,
      score: totalCorrect,
    }
  });

  return match;
}
