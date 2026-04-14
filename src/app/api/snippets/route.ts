import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// BUG-4: imageUrl validation pattern
const IMAGE_URL_PATTERN = /^\/uploads\/[a-f0-9-]+\.(jpg|jpeg|png|gif|webp)$/;

function isValidImageUrl(url: unknown): boolean {
  if (url === null || url === undefined) return true;
  if (typeof url !== "string") return false;
  return IMAGE_URL_PATTERN.test(url);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const categoryId = req.nextUrl.searchParams.get("categoryId");

  const where: Record<string, unknown> = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (!session) {
    where.isPublic = true;
  } else {
    where.OR = [{ userId: session.user.id }, { isPublic: true }];
  }

  const snippets = await prisma.snippet.findMany({
    where,
    include: {
      commands: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(snippets);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, imageUrl, categoryId, commands } = body;

  if (!title || !categoryId) {
    return NextResponse.json(
      { error: "Title and categoryId are required" },
      { status: 400 }
    );
  }

  // WARN-8: Max length checks
  if (typeof title !== "string" || title.length > 200) {
    return NextResponse.json(
      { error: "Title must be a string of at most 200 characters" },
      { status: 400 }
    );
  }

  // BUG-4: Validate imageUrl
  if (!isValidImageUrl(imageUrl)) {
    return NextResponse.json(
      { error: "Invalid imageUrl format" },
      { status: 400 }
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  if (category.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const snippet = await prisma.snippet.create({
    data: {
      title,
      description: description || null,
      imageUrl: imageUrl || null,
      categoryId,
      userId: session.user.id,
      isPublic: false,
      commands: commands
        ? {
            create: commands.map(
              (
                cmd: { label?: string; content: string; language?: string },
                idx: number
              ) => ({
                label: cmd.label || null,
                content: cmd.content,
                language: cmd.language || "bash",
                order: idx,
              })
            ),
          }
        : undefined,
    },
    include: {
      commands: { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json(snippet, { status: 201 });
}
