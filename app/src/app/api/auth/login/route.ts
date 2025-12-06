import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";

export async function POST(req: Request) {
    console.log("HERE");
  try {
    console.log(req.body);
    const body = await req.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // NOTE: This returns the user data. In a production app you should return a session token
    return NextResponse.json({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
