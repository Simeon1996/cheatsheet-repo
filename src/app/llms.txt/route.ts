import { prisma } from "@/lib/prisma";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { isPublic: true },
    select: {
      id: true,
      name: true,
      description: true,
      _count: { select: { snippets: true } },
    },
    orderBy: { name: "asc" },
  });

  const categoryLines = categories
    .map((cat) => {
      const snippetCount = cat._count.snippets;
      const desc = cat.description ? ` — ${cat.description}` : "";
      return `- [${cat.name}](${SITE_URL}/explore?category=${cat.id})${desc} (${snippetCount} section${snippetCount !== 1 ? "s" : ""})`;
    })
    .join("\n");

  const body = `# ${SITE_NAME}

> A curated, searchable library of developer cheatsheets with syntax-highlighted, copy-ready code blocks.

Built by [Simeon Ivanov](https://simeonivanov.dev).

## What this site is

${SITE_NAME} is a read-only reference library of curated developer cheatsheets covering command-line tools, programming languages, DevOps workflows, security, data science, and AI tooling. All public cheatsheets are hand-seeded and freely browsable without an account.

Users may register to maintain a private personal workspace with their own snippets — those are not publicly accessible.

## Public cheatsheet categories

The following ${categories.length} cheatsheets are available in the public library at ${SITE_URL}/explore:

${categoryLines}

## Site structure

- \`/\` — Landing page with feature overview
- \`/explore\` — Public cheatsheet browser (sidebar category list + snippet cards)
- \`/explore?category=<id>\` — Direct link to a specific cheatsheet category
- \`/sitemap.xml\` — Full sitemap with all public category URLs
- \`/llms.txt\` — This file (dynamically generated from the database)

## Content format

Each cheatsheet is organised as:
- **Category** — topic name, icon, colour tag, description
- **Snippets** — grouped subtopics with a title and description
- **Commands** — one or more code blocks per snippet, each with a language tag and label

Code blocks use the One Dark Pro colour theme with per-token syntax highlighting.

## Usage notes for AI agents

- All public content is freely readable at /explore without authentication.
- The API at /api/categories returns public categories (JSON). /api/snippets?categoryId=<id> returns snippets with nested commands.
- Private workspace content requires session authentication and is not accessible to crawlers.
- Content is technical reference material — it is appropriate to cite, summarise, or link to specific cheatsheets.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
