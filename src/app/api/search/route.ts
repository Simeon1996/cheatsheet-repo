import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const categoryId = req.nextUrl.searchParams.get("categoryId") ?? undefined;

  const session = await getServerSession(authOptions);

  const snippets = await prisma.snippet.findMany({
    where: {
      AND: [
        session
          ? { OR: [{ userId: session.user.id }, { isPublic: true }] }
          : { isPublic: true },
        ...(categoryId ? [{ categoryId }] : []),
        {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            {
              commands: {
                some: { label: { contains: q, mode: "insensitive" } },
              },
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      isPublic: true,
      userId: true,
      category: { select: { id: true, name: true, icon: true } },
      commands: {
        select: { id: true, label: true, content: true, language: true, order: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return NextResponse.json(snippets);
}
