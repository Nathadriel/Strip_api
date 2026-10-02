import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Email requis et mot de passe d'au moins 8 caractères." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, hashedPassword } });

  return NextResponse.json({ message: "Compte créé." }, { status: 201 });
}
