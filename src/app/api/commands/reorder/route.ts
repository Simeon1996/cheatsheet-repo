import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * BUG-5: Atomic command reorder — swaps two command orders in a transaction.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id1, order1, id2, order2 } = body;

  if (!id1 || !id2 || order1 === undefined || order2 === undefined) {
    return NextResponse.json(
      { error: "id1, order1, id2, and order2 are required" },
      { status: 400 }
    );
  }

  // Verify both commands exist and belong to the same snippet owned by the user
  const [cmd1, cmd2] = await Promise.all([
    prisma.command.findUnique({
      where: { id: id1 },
      include: { snippet: true },
    }),
    prisma.command.findUnique({
      where: { id: id2 },
      include: { snippet: true },
    }),
  ]);

  if (!cmd1 || !cmd2) {
    return NextResponse.json(
      { error: "One or both commands not found" },
      { status: 404 }
    );
  }

  if (cmd1.snippetId !== cmd2.snippetId) {
    return NextResponse.json(
      { error: "Commands must belong to the same snippet" },
      { status: 400 }
    );
  }

  if (cmd1.snippet.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.$transaction([
    prisma.command.update({ where: { id: id1 }, data: { order: order1 } }),
    prisma.command.update({ where: { id: id2 }, data: { order: order2 } }),
  ]);

  return NextResponse.json({ success: true });
}
