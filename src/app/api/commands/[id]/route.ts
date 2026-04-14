import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.command.findUnique({
    where: { id },
    include: { snippet: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.snippet.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { label, content, language, order } = body;

  // WARN-8: Max length checks
  if (label !== undefined && typeof label === "string" && label.length > 200) {
    return NextResponse.json(
      { error: "Label must be at most 200 characters" },
      { status: 400 }
    );
  }
  if (
    content !== undefined &&
    typeof content === "string" &&
    content.length > 65535
  ) {
    return NextResponse.json(
      { error: "Content must be at most 65535 characters" },
      { status: 400 }
    );
  }

  const updated = await prisma.command.update({
    where: { id },
    data: {
      ...(label !== undefined && { label }),
      ...(content !== undefined && { content }),
      ...(language !== undefined && { language }),
      ...(order !== undefined && { order }),
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
  const existing = await prisma.command.findUnique({
    where: { id },
    include: { snippet: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing.snippet.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.command.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
