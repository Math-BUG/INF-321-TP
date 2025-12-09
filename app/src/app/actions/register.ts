"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setAuthCookie } from "./auth";

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  sex?: string;
  phone?: string;
  birthdate?: Date;
  address?: string;
  musicExperience?: string;
};

export async function registerUser(data: RegisterData): Promise<{ 
  success: boolean; 
  error?: string;
  user?: { id: number; name: string; email: string; isAdmin: boolean };
}> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { success: false, error: "Este e-mail já está cadastrado" };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        sex: data.sex || null,
        phone: data.phone || null,
        birthdate: data.birthdate || null,
        address: data.address || null,
        musicExperience: data.musicExperience || null,
        isAdmin: 0, // Sempre 0 para auto-cadastro
      },
    });

    await setAuthCookie({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin === 1,
    });

    return { 
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin === 1,
      }
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: "Erro ao criar conta. Tente novamente." };
  }
}
