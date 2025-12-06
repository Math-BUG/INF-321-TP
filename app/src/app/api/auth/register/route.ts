import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";

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

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        sex: sex || "",
        phone: phone || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        address: address || null,
        previousExperience: previousExperience ?? false,
      },
    });

    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
