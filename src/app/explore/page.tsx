import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ExploreClient from "@/components/ExploreClient";
import type { CategoryData } from "@/components/CategorySidebar";
import type { SnippetData } from "@/components/SnippetCard";

type Props = { searchParams: Promise<{ category?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category } = await searchParams;

  if (category) {
    const cat = await prisma.category.findFirst({
      where: { id: category, isPublic: true },
      select: { name: true, description: true },
    });
    if (cat) {
      const title = `${cat.name} Cheatsheet`;
      const description =
        cat.description ??
        `Quick-reference ${cat.name} cheatsheet with syntax-highlighted, copy-ready code blocks.`;
      return {
        title,
        description,
        openGraph: { title, description },
        twitter: { title, description },
        alternates: { canonical: `/explore?category=${category}` },
      };
    }
  }

  return {
    title: "Explore Cheatsheets",
    description:
      "Browse curated developer cheatsheets for Bash, Git, Docker, Kubernetes, Python, SQL, Regex, and more — all with syntax-highlighted, copy-ready code blocks.",
    alternates: { canonical: "/explore" },
  };
}

export default async function ExplorePage({ searchParams }: Props) {
  const { category } = await searchParams;

  const [categoriesRaw, initialSnippetsRaw] = await Promise.all([
    prisma.category.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        description: true,
        userId: true,
        isPublic: true,
        _count: { select: { snippets: true } },
      },
      orderBy: { name: "asc" },
    }),
    category
      ? prisma.snippet.findMany({
          where: { categoryId: category, category: { isPublic: true } },
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            isPublic: true,
            commands: {
              select: {
                id: true,
                label: true,
                content: true,
                language: true,
                order: true,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <ExploreClient
      initialCategories={categoriesRaw as CategoryData[]}
      initialCategoryId={category ?? null}
      initialSnippets={initialSnippetsRaw as SnippetData[]}
    />
  );
}
