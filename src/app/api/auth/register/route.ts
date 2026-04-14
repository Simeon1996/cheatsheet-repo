import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const MAX_NAME_LENGTH = 100;
const MIN_PASSWORD_LENGTH = 12;

export async function POST(req: NextRequest) {
  // SEC-5: Rate limit registration — 5 requests per IP per 15 minutes
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`register:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many registration attempts. Try again later." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { name, email, password } = body;

  // WARN-2: Type-check name and email
  if (
    !name ||
    !email ||
    !password ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.json(
      { error: "Name, email, and password are required and must be strings" },
      { status: 400 }
    );
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  // WARN-8: Max length on name
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      { error: `Name must be at most ${MAX_NAME_LENGTH} characters` },
      { status: 400 }
    );
  }

  // WARN-2: Basic email format validation
  const atIndex = trimmedEmail.indexOf("@");
  if (
    atIndex < 1 ||
    trimmedEmail.indexOf(".", atIndex) === -1 ||
    trimmedEmail.length > 254
  ) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  // WARN-7: Minimum password length raised to 12
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: trimmedEmail },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const hashedPassword = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: trimmedName,
      email: trimmedEmail,
      hashedPassword,
    },
  });

  return NextResponse.json(
    { id: user.id, name: user.name, email: user.email },
    { status: 201 }
  );
}
