"use server";

import prisma from "@/lib/prisma";

export type ParameterListItem = {
  id: number;
  name: string;
  description: string | null;
  identifier: string | null;
  createdAt: Date;
  _count?: {
    levelValues: number;
    challenges: number;
  };
};

export type GetParametersResult = {
  parameters: ParameterListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type GetParametersParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export async function getParameters({
  page = 1,
  pageSize = 10,
  search = "",
}: GetParametersParams = {}): Promise<GetParametersResult> {
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

    const [parameters, total] = await Promise.all([
      prisma.parameter.findMany({
        where,
        include: {
          _count: {
            select: {
              levelValues: true,
              challenges: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.parameter.count({ where }),
    ]);

    return {
      parameters,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error("Error loading parameters:", error);
    return {
      parameters: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 0,
    };
  }
}

export async function createParameter(data: {
  name: string;
  identifier?: string;
  description?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const existingParameter = await prisma.parameter.findUnique({
      where: { name: data.name },
    });

    if (existingParameter) {
      return { success: false, error: "Já existe um parâmetro com este nome." };
    }

    await prisma.parameter.create({
      data: {
        name: data.name,
        identifier: data.identifier,
        description: data.description,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating parameter:", error);
    return { success: false, error: "Erro ao criar parâmetro. Tente novamente." };
  }
}

export async function updateParameter(
  id: number,
  data: {
    name?: string;
    identifier?: string;
    description?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (data.name) {
      const existingParameter = await prisma.parameter.findFirst({
        where: {
          name: data.name,
          NOT: { id },
        },
      });

      if (existingParameter) {
        return { success: false, error: "Já existe um parâmetro com este nome." };
      }
    }

    await prisma.parameter.update({
      where: { id },
      data,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating parameter:", error);
    return { success: false, error: "Erro ao atualizar parâmetro. Tente novamente." };
  }
}

export async function deleteParameter(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const parameter = await prisma.parameter.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            levelValues: true,
            challenges: true,
          },
        },
      },
    });

    if (!parameter) {
      return { success: false, error: "Parâmetro não encontrado." };
    }

    const totalUsages = parameter._count.levelValues + parameter._count.challenges;
    if (totalUsages > 0) {
      return {
        success: false,
        error: `Este parâmetro não pode ser excluído pois está em uso em ${parameter._count.challenges} desafio(s) e ${parameter._count.levelValues} nível(is).`,
      };
    }

    await prisma.parameter.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting parameter:", error);
    return { success: false, error: "Erro ao excluir parâmetro. Tente novamente." };
  }
}
