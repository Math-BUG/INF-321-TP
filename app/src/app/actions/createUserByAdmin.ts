"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function createUserByAdmin(data: {
  name: string;
  email: string;
  password: string;
  sex?: string;
  birthdate?: Date;
  phone?: string;
  address?: string;
  musicExperience?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      if (existingUser.deleted === 1) {
        return {
          success: false,
          error: "Este e-mail não está mais disponível para uso no sistema, pois a conta associada a ele foi deletada.",
        };
      }
      return { success: false, error: "Este e-mail já está cadastrado no sistema." };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        sex: data.sex,
        birthdate: data.birthdate,
        phone: data.phone,
        address: data.address,
        musicExperience: data.musicExperience,
        isAdmin: 0,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating user by admin:", error);
    return { success: false, error: "Erro ao criar usuário. Tente novamente." };
  }
}
