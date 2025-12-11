"use server";

import prisma from "@/lib/prisma";

export type LevelListItem = {
  id: number;
  name: string;
  challengeId: number;
  numRounds: number;
  timePerRound: number;
  createdAt: Date;
  challenge: {
    id: number;
    name: string;
    identifier: string | null;
  };
  _count?: {
    matches: number;
  };
};

export type LevelWithParameters = LevelListItem & {
  parameterVals: Array<{
    id: number;
    value: string | null;
    parameter: {
      id: number;
      name: string;
      identifier: string | null;
      description: string | null;
    };
  }>;
};

export type ChallengeOption = {
  id: number;
  name: string;
  identifier: string | null;
};

export type ChallengeWithParameters = {
  id: number;
  name: string;
  parameters: Array<{
    parameter: {
      id: number;
      name: string;
      identifier: string | null;
      description: string | null;
    };
  }>;
};

export async function getChallengeOptions(): Promise<ChallengeOption[]> {
  try {
    const challenges = await prisma.challenge.findMany({
      select: {
        id: true,
        name: true,
        identifier: true,
      },
      orderBy: { name: "asc" },
    });
    return challenges;
  } catch (error) {
    console.error("Error loading challenge options:", error);
    return [];
  }
}

export async function getChallengeWithParameters(
  challengeId: number
): Promise<ChallengeWithParameters | null> {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: {
        id: true,
        name: true,
        parameters: {
          include: {
            parameter: true,
          },
          orderBy: {
            parameter: {
              name: "asc",
            },
          },
        },
      },
    });
    return challenge;
  } catch (error) {
    console.error("Error loading challenge with parameters:", error);
    return null;
  }
}

export async function getLevelsByChallengeId(
  challengeId: number
): Promise<LevelListItem[]> {
  try {
    const levels = await prisma.level.findMany({
      where: { challengeId },
      include: {
        challenge: {
          select: {
            id: true,
            name: true,
            identifier: true,
          },
        },
        _count: {
          select: {
            matches: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return levels;
  } catch (error) {
    console.error("Error loading levels:", error);
    return [];
  }
}

export async function getLevelWithParameters(
  id: number
): Promise<LevelWithParameters | null> {
  try {
    const level = await prisma.level.findUnique({
      where: { id },
      include: {
        challenge: {
          select: {
            id: true,
            name: true,
            identifier: true,
          },
        },
        _count: {
          select: {
            matches: true,
          },
        },
        parameterVals: {
          include: {
            parameter: true,
          },
          orderBy: {
            parameter: {
              name: "asc",
            },
          },
        },
      },
    });
    return level;
  } catch (error) {
    console.error("Error loading level with parameters:", error);
    return null;
  }
}

export async function createLevel(data: {
  name: string;
  challengeId: number;
  numRounds: number;
  timePerRound: number;
  parameterValues: Array<{ parameterId: number; value: string }>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const existingLevel = await prisma.level.findFirst({
      where: {
        name: data.name,
        challengeId: data.challengeId,
      },
    });

    if (existingLevel) {
      return {
        success: false,
        error: "Já existe um nível com este nome para este desafio.",
      };
    }

    await prisma.level.create({
      data: {
        name: data.name,
        challengeId: data.challengeId,
        numRounds: data.numRounds,
        timePerRound: data.timePerRound,
        parameterVals: {
          create: data.parameterValues.map((pv) => ({
            parameterId: pv.parameterId,
            value: pv.value,
          })),
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating level:", error);
    return { success: false, error: "Erro ao criar nível. Tente novamente." };
  }
}

export async function updateLevel(
  id: number,
  data: {
    name?: string;
    numRounds?: number;
    timePerRound?: number;
    parameterValues?: Array<{ parameterId: number; value: string }>;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const level = await prisma.level.findUnique({
      where: { id },
    });

    if (!level) {
      return { success: false, error: "Nível não encontrado." };
    }

    if (data.name) {
      const existingLevel = await prisma.level.findFirst({
        where: {
          name: data.name,
          challengeId: level.challengeId,
          NOT: { id },
        },
      });

      if (existingLevel) {
        return {
          success: false,
          error: "Já existe um nível com este nome para este desafio.",
        };
      }
    }

    await prisma.level.update({
      where: { id },
      data: {
        name: data.name,
        numRounds: data.numRounds,
        timePerRound: data.timePerRound,
      },
    });

    if (data.parameterValues) {
      for (const pv of data.parameterValues) {
        await prisma.levelParameterValue.upsert({
          where: {
            levelId_parameterId: {
              levelId: id,
              parameterId: pv.parameterId,
            },
          },
          update: {
            value: pv.value,
          },
          create: {
            levelId: id,
            parameterId: pv.parameterId,
            value: pv.value,
          },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating level:", error);
    return { success: false, error: "Erro ao atualizar nível. Tente novamente." };
  }
}

export async function deleteLevel(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const level = await prisma.level.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            matches: true,
          },
        },
      },
    });

    if (!level) {
      return { success: false, error: "Nível não encontrado." };
    }

    if (level._count.matches > 0) {
      return {
        success: false,
        error: `Este nível não pode ser excluído pois está vinculado a ${level._count.matches} partida(s).`,
      };
    }

    await prisma.level.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting level:", error);
    return { success: false, error: "Erro ao excluir nível. Tente novamente." };
  }
}
