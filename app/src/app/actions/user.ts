"use server";

import prisma from "@/lib/prisma";


export type UserProfile = {
  id: number;
  name: string;
  email: string;
  sex: string | null;
  phone: string | null;
  birthdate: Date | null;
  address: string | null;
  musicExperience: string | null;
  createdAt: Date;
};

export type MatchHistory = {
  id: number;
  startedAt: Date;
  finishedAt: Date | null;
  totalRounds: number | null;
  totalCorrect: number | null;
  totalIncorrect: number | null;
  level: {
    id: number;
    name: string;
    difficulty?: string;
    challenge: {
      id: number;
      name: string;
      identifier: string | null;
    };
  };
};

export type PerformanceData = {
  challengeId: number;
  challengeName: string;
  challengeIdentifier: string | null;
  levels: {
    levelId: number;
    levelName: string;
    matches: {
      matchId: number;
      finishedAt: Date;
      totalCorrect: number;
      totalRounds: number;
    }[];
  }[];
};

export async function fetchUserProfile(userId: number): Promise<UserProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        sex: true,
        phone: true,
        birthdate: true,
        address: true,
        musicExperience: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function fetchUserMatchHistory(userId: number): Promise<MatchHistory[]> {
  try {
    const matches = await prisma.match.findMany({
      where: {
        userId,
        isComplete: 1,
      },
      include: {
        level: {
          include: {
            challenge: {
              select: {
                id: true,
                name: true,
                identifier: true,
              },
            },
          },
        },
      },
      orderBy: {
        finishedAt: "desc",
      },
    });

    return matches.map((match) => ({
      id: match.id,
      startedAt: match.startedAt,
      finishedAt: match.finishedAt,
      totalRounds: match.totalRounds,
      totalCorrect: match.totalCorrect,
      totalIncorrect: match.totalIncorrect,
      level: {
        id: match.level.id,
        name: match.level.name,
        difficulty: extractDifficulty(match.level.name),
        challenge: match.level.challenge,
      },
    }));
  } catch (error) {
    console.error("Error fetching match history:", error);
    return [];
  }
}

export async function fetchPerformanceData(userId: number): Promise<PerformanceData[]> {
  try {
    const matches = await prisma.match.findMany({
      where: {
        userId,
        isComplete: 1,
      },
      include: {
        level: {
          include: {
            challenge: true,
          },
        },
      },
      orderBy: {
        finishedAt: "asc",
      },
    });

    const groupedData = new Map<number, PerformanceData>();

    matches.forEach((match) => {
      const challengeId = match.level.challenge.id;
      const challengeName = match.level.challenge.name;
      const challengeIdentifier = match.level.challenge.identifier;
      const levelId = match.level.id;
      const levelName = match.level.name;

      if (!groupedData.has(challengeId)) {
        groupedData.set(challengeId, {
          challengeId,
          challengeName,
          challengeIdentifier,
          levels: [],
        });
      }

      const challengeData = groupedData.get(challengeId)!;
      let levelData = challengeData.levels.find((l) => l.levelId === levelId);

      if (!levelData) {
        levelData = {
          levelId,
          levelName,
          matches: [],
        };
        challengeData.levels.push(levelData);
      }

      if (match.finishedAt && match.totalCorrect !== null && match.totalRounds !== null) {
        levelData.matches.push({
          matchId: match.id,
          finishedAt: match.finishedAt,
          totalCorrect: match.totalCorrect,
          totalRounds: match.totalRounds,
        });
      }
    });

    return Array.from(groupedData.values());
  } catch (error) {
    console.error("Error fetching performance data:", error);
    return [];
  }
}

export async function updateUserProfile(
  userId: number,
  data: {
    name?: string;
    email?: string;
    sex?: string;
    birthdate?: Date;
    phone?: string;
    address?: string;
    musicExperience?: string;
  }
): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data,
    });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
}

function extractDifficulty(levelName: string): string | undefined {
  const match = levelName.match(/\b(Iniciante|Intermediário|Avançado)\b/i);
  return match ? match[1] : undefined;
}
