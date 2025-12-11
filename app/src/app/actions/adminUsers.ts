"use server";

import prisma from "@/lib/prisma";

export type UserListItem = {
  id: number;
  name: string;
  email: string;
  sex: string | null;
  phone: string | null;
  birthdate: Date | null;
  address: string | null;
  musicExperience: string | null;
  isAdmin: number;
  deleted: number;
  createdAt: Date;
};

export type GetUsersParams = {
  page: number;
  pageSize: number;
  search?: string;
};

export type GetUsersResult = {
  users: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getUsers(params: GetUsersParams): Promise<GetUsersResult> {
  const { page = 1, pageSize = 10, search = "" } = params;
  const skip = (page - 1) * pageSize;

  const where: any = {
    isAdmin: 0,
    deleted: 0,
  };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        sex: true,
        phone: true,
        birthdate: true,
        address: true,
        musicExperience: true,
        isAdmin: true,
        deleted: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    users,
    total,
    page,
    pageSize,
    totalPages,
  };
}
