"use server";

import prisma from "@/lib/prisma";

export async function deleteUserByAdmin(userId: number): Promise<{ 
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

    if (user.isAdmin === 1) {
      return { success: false, error: "Não é possível excluir um usuário administrador" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        deleted: 1,
        deletedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting user by admin:", error);
    return { success: false, error: "Erro ao excluir usuário. Tente novamente." };
  }
}
