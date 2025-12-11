"use server";

import prisma from "@/lib/prisma";

export type ChallengeListItem = {
  id: number;
  name: string;
  identifier: string | null;
  description: string | null;
  requirements: string | null;
  instructions: string | null;
  isStatic: number;
  createdAt: Date;
  _count?: {
    levels: number;
    parameters: number;
  };
};

export type ChallengeWithParameters = ChallengeListItem & {
  parameters: Array<{
    id: number;
    parameter: {
      id: number;
      name: string;
      identifier: string | null;
      description: string | null;
    };
  }>;
};

export type GetChallengesResult = {
  challenges: ChallengeListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type GetChallengesParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export async function getChallenges({
  page = 1,
  pageSize = 10,
  search = "",
}: GetChallengesParams = {}): Promise<GetChallengesResult> {
  try {
    const skip = (page - 1) * pageSize;

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { identifier: { contains: search } },
          ],
        }
      : {};

    const [challenges, total] = await Promise.all([
      prisma.challenge.findMany({
        where,
        include: {
          _count: {
            select: {
              levels: true,
              parameters: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.challenge.count({ where }),
    ]);

    return {
      challenges,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error("Error loading challenges:", error);
    return {
      challenges: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 0,
    };
  }
}

export async function getChallengeWithParameters(
  id: number
): Promise<ChallengeWithParameters | null> {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            levels: true,
            parameters: true,
          },
        },
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

export async function updateChallenge(
  id: number,
  data: {
    name?: string;
    description?: string;
    requirements?: string;
    instructions?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (data.name) {
      const existingChallenge = await prisma.challenge.findFirst({
        where: {
          name: data.name,
          NOT: { id },
        },
      });

      if (existingChallenge) {
        return { success: false, error: "Já existe um desafio com este nome." };
      }
    }

    await prisma.challenge.update({
      where: { id },
      data,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating challenge:", error);
    return { success: false, error: "Erro ao atualizar desafio. Tente novamente." };
  }
}
