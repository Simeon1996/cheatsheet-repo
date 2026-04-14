import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { label, content, language, snippetId } = body;

  if (!content || !snippetId) {
    return NextResponse.json(
      { error: "Content and snippetId are required" },
      { status: 400 }
    );
  }

  // WARN-8: Max length checks
  if (typeof content !== "string" || content.length > 65535) {
    return NextResponse.json(
      { error: "Content must be a string of at most 65535 characters" },
      { status: 400 }
    );
  }
  if (label && typeof label === "string" && label.length > 200) {
    return NextResponse.json(
      { error: "Label must be at most 200 characters" },
      { status: 400 }
    );
  }

  const snippet = await prisma.snippet.findUnique({
    where: { id: snippetId },
    include: { commands: true },
  });

  if (!snippet) {
    return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
  }

  if (snippet.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const maxOrder = snippet.commands.reduce(
    (max, cmd) => Math.max(max, cmd.order),
    -1
  );

  const command = await prisma.command.create({
    data: {
      label: label || null,
      content,
      language: language || "bash",
      order: maxOrder + 1,
      snippetId,
    },
  });

  return NextResponse.json(command, { status: 201 });
}
