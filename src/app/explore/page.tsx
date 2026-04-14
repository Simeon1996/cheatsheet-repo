"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import CategorySidebar, { CategoryData } from "@/components/CategorySidebar";
import SnippetCard, { SnippetData } from "@/components/SnippetCard";
import { Compass, FolderOpen, Menu } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

export default function ExplorePage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [snippets, setSnippets] = useState<SnippetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSnippets, setLoadingSnippets] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    const publicCats = data.filter((c: CategoryData) => c.isPublic);
    setCategories(publicCats);
    setLoading(false);
  }, []);

  const fetchSnippets = useCallback(async (categoryId: string) => {
    setLoadingSnippets(true);
    try {
      const res = await fetch(`/api/snippets?categoryId=${categoryId}`);
      const data = await res.json();
      setSnippets(data);
    } finally {
      setLoadingSnippets(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchSnippets(selectedCategoryId);
    }
  }, [selectedCategoryId, fetchSnippets]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="flex h-screen flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <CategorySidebar
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          onAdd={() => {}}
          readOnly
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner size="lg" />
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
                    <SnippetCard
                      key={snippet.id}
                      snippet={snippet}
                      readOnly
                    />
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
                  Browse curated public cheatsheets. Select a category from
                  the sidebar to get started.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
