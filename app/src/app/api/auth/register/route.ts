import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { scryptSync, randomBytes } from "crypto";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${key}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, sex, phone, birthDate, address, previousExperience } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashed = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashed,
        sex: sex || "",
        phone: phone || null,
        birthdate: birthDate ? new Date(birthDate) : null,
        address: address || null,
        musicExperience: typeof previousExperience === 'string' ? previousExperience : (previousExperience ? 'yes' : 'no'),
      },
    });

    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error('Register handler error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
