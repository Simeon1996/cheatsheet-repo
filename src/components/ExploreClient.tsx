"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CategorySidebar, { CategoryData } from "@/components/CategorySidebar";
import SnippetCard, { SnippetData } from "@/components/SnippetCard";
import SearchBar, { SearchSnippet } from "@/components/SearchBar";
import { Compass, FolderOpen, Menu, Search } from "lucide-react";
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
  const [searchResults, setSearchResults] = useState<SearchSnippet[] | null>(null);

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
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm px-4 sm:px-6 py-2">
            <SearchBar onResults={setSearchResults} categoryId={selectedCategoryId} />
          </div>

          {searchResults !== null ? (
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                  aria-label="Open categories"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <Search className="h-5 w-5 text-zinc-400 shrink-0" />
                <h1 className="text-lg font-bold text-zinc-100">
                  {searchResults.length === 0
                    ? "No results"
                    : `${searchResults.length} result${searchResults.length === 1 ? "" : "s"}`}
                </h1>
              </div>
              {searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                  <Search className="h-12 w-12 mb-4 opacity-40" />
                  <p className="text-lg font-medium">No matches found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {searchResults.map((snippet) => (
                    <div key={snippet.id}>
                      <p className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-wider">
                        {snippet.category.icon} {snippet.category.name}
                      </p>
                      <SnippetCard snippet={snippet as SnippetData} readOnly />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : selectedCategory ? (
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
