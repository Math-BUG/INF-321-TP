import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { scryptSync, timingSafeEqual } from "crypto";

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Se hash armazenado parece bcrypt ($2a$ ou $2b$), usa bcrypt
  if (storedHash && storedHash.startsWith("$2")) {
    try {
      const bcryptModule = await import("bcryptjs");
      const bcrypt = (bcryptModule as any).default || bcryptModule;
      return await bcrypt.compare(password, storedHash);
    } catch (e) {
      console.error("bcrypt compare failed", e);
      return false;
    }
  }

  // Caso contrário assume formato salt:hexkey (scrypt)
  try {
    const [saltHex, keyHex] = (storedHash || "").split(":");
    if (!saltHex || !keyHex) return false;
    const salt = Buffer.from(saltHex, "hex");
    const derivedKey = scryptSync(password, salt, 64);
    const storedKey = Buffer.from(keyHex, "hex");
    if (derivedKey.length !== storedKey.length) return false;
    return timingSafeEqual(derivedKey, storedKey);
  } catch (e) {
    console.error("scrypt verify failed", e);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ error: "Faltando e-mail ou senha" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const storedHash = (user as any).password || (user as any).passwordHash || "";
    const match = await verifyPassword(password, storedHash);
    if (!match) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // NOTE: This returns the user data. In a production app you should return a session token
    return NextResponse.json({ id: user.id, name: user.name, email: (user as any).email, isAdmin: (user as any).isAdmin });
  } catch (err) {
    console.error("Login handler error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
