"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { clearAuthCookie } from "./auth";

export async function deleteAccount(userId: number, password: string): Promise<{ 
  success: boolean; 
  error?: string;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deleted === 1) {
      return { success: false, error: "Usuário não encontrado" };
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return { success: false, error: "Senha incorreta" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        deleted: 1,
        deletedAt: new Date(),
      },
    });

    await clearAuthCookie();

    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, error: "Erro ao excluir conta. Tente novamente." };
  }
}
