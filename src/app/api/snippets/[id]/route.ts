import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const snippet = await prisma.snippet.findUnique({
    where: { id },
    include: {
      commands: { orderBy: { order: "asc" } },
      category: true,
    },
  });

  if (!snippet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // BUG-1: Access control — private snippets require ownership
  if (!snippet.isPublic) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== snippet.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json(snippet);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.snippet.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description } = body;

  // WARN-8: Max length checks
  if (title !== undefined && (typeof title !== "string" || title.length > 200)) {
    return NextResponse.json(
      { error: "Title must be a string of at most 200 characters" },
      { status: 400 }
    );
  }

  const updated = await prisma.snippet.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
    },
    include: {
      commands: { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.snippet.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.snippet.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
