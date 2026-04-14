import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const scope = req.nextUrl.searchParams.get("scope"); // "mine" | "public"

  let where: Record<string, unknown>;

  if (scope === "mine") {
    // Workspace — only the authenticated user's own categories
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    where = { userId: session.user.id };
  } else {
    // Explore (default) — public categories only
    where = { isPublic: true };
  }

  const categories = await prisma.category.findMany({
    where,
    include: {
      _count: { select: { snippets: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, icon, color, description } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // WARN-8: Max length checks
  if (name.length > 100) {
    return NextResponse.json(
      { error: "Name must be at most 100 characters" },
      { status: 400 }
    );
  }
  if (description && typeof description === "string" && description.length > 500) {
    return NextResponse.json(
      { error: "Description must be at most 500 characters" },
      { status: 400 }
    );
  }

  const category = await prisma.category.create({
    data: {
      name,
      icon: icon || null,
      color: color || null,
      description: description || null,
      userId: session.user.id,
      isPublic: false,
    },
    include: {
      _count: { select: { snippets: true } },
    },
  });

  return NextResponse.json(category, { status: 201 });
}
