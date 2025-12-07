"use server";

import { cookies } from "next/headers";

export async function setAuthCookie(user: {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}) {
  const cookieStore = await cookies();
  
  // Store user data as JSON in a secure httpOnly cookie
  cookieStore.set("auth", JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return { success: true };
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth");
  return { success: true };
}
