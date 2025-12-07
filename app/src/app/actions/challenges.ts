"use server"

import prisma from "../../lib/prisma"

export type Level = {
  id: number
  name: string
  difficulty?: string | null
}

export type Challenge = {
  id: number
  name: string
  description?: string | null
  requirements?: string | null
  identifier?: string | null
  instructions?: string | null
  levels: Level[]
}

export async function fetchChallenges(): Promise<Challenge[]> {
  const raw = await prisma.challenge.findMany({
    include: { levels: true },
    orderBy: { createdAt: "desc" },
  })

  return raw.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    requirements: c.requirements,
    identifier: c.identifier,
    instructions: c.instructions,
    levels: (c.levels || []).map((l: any) => ({
      id: l.id,
      name: l.name,
      difficulty: l.difficulty,
    })),
  }))
}
