"use server";

import { cookies } from "next/headers";

export async function setAuthCookie(user: {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}) {
  const cookieStore = await cookies();
  
  cookieStore.set("auth", JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { success: true };
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth");
  return { success: true };
}

export async function getAuthUser(): Promise<{
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
} | null> {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("auth");
    
    if (!authCookie || !authCookie.value) {
      return null;
    }
    
    const user = JSON.parse(authCookie.value);
    return user;
  } catch (error) {
    console.error("Error getting auth user:", error);
    return null;
  }
}
