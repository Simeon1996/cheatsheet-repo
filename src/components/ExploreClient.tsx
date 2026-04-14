"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CategorySidebar, { CategoryData } from "@/components/CategorySidebar";
import SnippetCard, { SnippetData } from "@/components/SnippetCard";
import { Compass, FolderOpen, Menu } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

interface ExploreClientProps {
  initialCategories: CategoryData[];
  initialCategoryId: string | null;
  initialSnippets: SnippetData[];
}

export default function ExploreClient({
  initialCategories,
  initialCategoryId,
  initialSnippets,
}: ExploreClientProps) {
  const router = useRouter();
  const [categories] = useState<CategoryData[]>(initialCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialCategoryId
  );
  const [snippets, setSnippets] = useState<SnippetData[]>(initialSnippets);
  const [loadingSnippets, setLoadingSnippets] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectCategory = useCallback(
    async (id: string) => {
      // If already selected, do nothing
      if (id === selectedCategoryId) return;

      setSelectedCategoryId(id);
      setSidebarOpen(false);

      // Sync URL so sharing / back-forward works
      router.replace(`/explore?category=${id}`, { scroll: false });

      setLoadingSnippets(true);
      try {
        const res = await fetch(`/api/snippets?categoryId=${id}`);
        const data = await res.json();
        setSnippets(data);
      } finally {
        setLoadingSnippets(false);
      }
    },
    [selectedCategoryId, router]
  );

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="flex h-screen flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <CategorySidebar
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={selectCategory}
          onAdd={() => {}}
          readOnly
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          {selectedCategory ? (
            <div className="p-4 sm:p-6">
              {/* Mobile header row */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                  aria-label="Open categories"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <span className="text-2xl">{selectedCategory.icon || "📁"}</span>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-zinc-100 truncate">
                    {selectedCategory.name}
                  </h1>
                  {selectedCategory.description && (
                    <p className="text-sm text-zinc-400 line-clamp-2">
                      {selectedCategory.description}
                    </p>
                  )}
                </div>
              </div>

              {loadingSnippets ? (
                <div className="flex justify-center py-20">
                  <Spinner size="lg" />
                </div>
              ) : snippets.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No snippets in this category</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {snippets.map((snippet) => (
                    <SnippetCard key={snippet.id} snippet={snippet} readOnly />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
              {/* Mobile: prominent button to open sidebar */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
              >
                <Menu className="h-4 w-4" />
                Browse Categories
              </button>

              <div className="text-center text-zinc-500">
                <Compass className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-semibold text-zinc-400">
                  Explore Public Cheatsheets
                </h2>
                <p className="mt-2 text-sm max-w-sm mx-auto">
                  Browse curated public cheatsheets. Select a category from the
                  sidebar to get started.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
