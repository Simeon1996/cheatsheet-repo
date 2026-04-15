"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CategorySidebar, { CategoryData } from "@/components/CategorySidebar";
import SnippetCard, { SnippetData } from "@/components/SnippetCard";
import { CommandData } from "@/components/CommandBlock";
import AssistantWidget from "@/components/AssistantWidget";
import CategoryModal from "@/components/modals/CategoryModal";
import SnippetModal from "@/components/modals/SnippetModal";
import CommandModal from "@/components/modals/CommandModal";
import SearchBar, { SearchSnippet } from "@/components/SearchBar";
import Button from "@/components/ui/Button";
import { Plus, FolderOpen, Pencil, Trash2, Menu, Search } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import { getColorClasses } from "@/lib/utils";
import toast from "react-hot-toast";

export default function WorkspacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [snippets, setSnippets] = useState<SnippetData[]>([]);
  const [loadingSnippets, setLoadingSnippets] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);

  const [snippetModalOpen, setSnippetModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<SnippetData | null>(null);

  const [commandModalOpen, setCommandModalOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<CommandData | null>(null);
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null);

  const [searchResults, setSearchResults] = useState<SearchSnippet[] | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // BUG-6: Check res.ok and handle errors
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories?scope=mine");
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    }
  }, []);

  const fetchSnippets = useCallback(async (categoryId: string) => {
    setLoadingSnippets(true);
    try {
      const res = await fetch(`/api/snippets?categoryId=${categoryId}`);
      if (!res.ok) throw new Error("Failed to load snippets");
      const data = await res.json();
      setSnippets(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load snippets");
      setSnippets([]);
    } finally {
      setLoadingSnippets(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchCategories();
  }, [session, fetchCategories]);

  useEffect(() => {
    if (selectedCategoryId) fetchSnippets(selectedCategoryId);
  }, [selectedCategoryId, fetchSnippets]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Category CRUD
  const handleSaveCategory = async (data: {
    name: string;
    icon: string;
    color: string;
    description: string;
  }) => {
    if (editingCategory) {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Category updated");
    } else {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      const newCat = await res.json();
      setSelectedCategoryId(newCat.id);
      toast.success("Category created");
    }
    setEditingCategory(null);
    fetchCategories();
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    if (!confirm(`Delete "${selectedCategory.name}" and all its snippets?`)) return;

    const res = await fetch(`/api/categories/${selectedCategory.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setSelectedCategoryId(null);
      setSnippets([]);
      fetchCategories();
      toast.success("Category deleted");
    }
  };

  // Snippet CRUD
  const handleSaveSnippet = async (data: {
    title: string;
    description: string;
    imageUrl: string | null;
  }) => {
    if (editingSnippet) {
      const res = await fetch(`/api/snippets/${editingSnippet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Snippet updated");
    } else {
      const res = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, categoryId: selectedCategoryId }),
      });
      if (!res.ok) throw new Error("Failed to create");
      toast.success("Snippet created");
    }
    setEditingSnippet(null);
    if (selectedCategoryId) fetchSnippets(selectedCategoryId);
  };

  const handleDeleteSnippet = async (snippetId: string) => {
    if (!confirm("Delete this snippet?")) return;
    const res = await fetch(`/api/snippets/${snippetId}`, { method: "DELETE" });
    if (res.ok) {
      if (selectedCategoryId) fetchSnippets(selectedCategoryId);
      toast.success("Snippet deleted");
    }
  };

  // Command CRUD
  const handleSaveCommand = async (data: {
    label: string;
    content: string;
    language: string;
  }) => {
    if (editingCommand) {
      const res = await fetch(`/api/commands/${editingCommand.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Command updated");
    } else if (activeSnippetId) {
      const res = await fetch("/api/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, snippetId: activeSnippetId }),
      });
      if (!res.ok) throw new Error("Failed to create");
      toast.success("Command added");
    }
    setEditingCommand(null);
    setActiveSnippetId(null);
    if (selectedCategoryId) fetchSnippets(selectedCategoryId);
  };

  const handleDeleteCommand = async (commandId: string) => {
    if (!confirm("Delete this command?")) return;
    const res = await fetch(`/api/commands/${commandId}`, { method: "DELETE" });
    if (res.ok) {
      if (selectedCategoryId) fetchSnippets(selectedCategoryId);
      toast.success("Command deleted");
    }
  };

  const handleReorderCommand = async (commandId: string, direction: "up" | "down") => {
    const snippet = snippets.find((s) =>
      s.commands.some((c) => c.id === commandId)
    );
    if (!snippet) return;

    const sorted = [...snippet.commands].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((c) => c.id === commandId);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    // BUG-5: Use atomic reorder endpoint instead of two parallel PUTs
    const res = await fetch("/api/commands/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id1: sorted[idx].id,
        order1: sorted[swapIdx].order,
        id2: sorted[swapIdx].id,
        order2: sorted[idx].order,
      }),
    });
    if (!res.ok) {
      toast.error("Failed to reorder commands");
      return;
    }

    if (selectedCategoryId) fetchSnippets(selectedCategoryId);
  };

  // AI Action handler
  const handleAIAction = async (action: {
    categoryName: string;
    title: string;
    description?: string;
    commands: { label?: string; content: string; language?: string }[];
  }) => {
    let targetCategoryId = selectedCategoryId;

    // Find or create the category
    const existingCat = categories.find(
      (c) => c.name.toLowerCase() === action.categoryName.toLowerCase()
    );

    if (existingCat) {
      targetCategoryId = existingCat.id;
    } else {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: action.categoryName,
          icon: "🤖",
          color: "purple",
          description: `AI-generated category`,
        }),
      });
      if (!res.ok) throw new Error("Failed to create category");
      const newCat = await res.json();
      targetCategoryId = newCat.id;
      await fetchCategories();
    }

    if (!targetCategoryId) throw new Error("No category");

    const res = await fetch("/api/snippets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: action.title,
        description: action.description || null,
        categoryId: targetCategoryId,
        commands: action.commands,
      }),
    });

    if (!res.ok) throw new Error("Failed to create snippet");

    setSelectedCategoryId(targetCategoryId);
    fetchSnippets(targetCategoryId);
    fetchCategories();
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </main>
      </div>
    );
  }

  const userCategories = categories.filter(
    (c) => c.userId === session?.user.id
  );

  return (
    <div className="flex h-screen flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <CategorySidebar
          categories={userCategories}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          onAdd={() => {
            setEditingCategory(null);
            setCategoryModalOpen(true);
          }}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm px-4 sm:px-6 py-2">
            <SearchBar onResults={setSearchResults} />
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
                      <SnippetCard
                        snippet={snippet}
                        onEdit={() => {
                          setEditingSnippet(snippet as SnippetData);
                          setSnippetModalOpen(true);
                        }}
                        onDelete={() => handleDeleteSnippet(snippet.id)}
                        onAddCommand={() => {
                          setEditingCommand(null);
                          setActiveSnippetId(snippet.id);
                          setCommandModalOpen(true);
                        }}
                        onEditCommand={(cmd) => {
                          setEditingCommand(cmd);
                          setActiveSnippetId(snippet.id);
                          setCommandModalOpen(true);
                        }}
                        onDeleteCommand={handleDeleteCommand}
                        onReorderCommand={handleReorderCommand}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : selectedCategory ? (
            <div className="p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                    aria-label="Open categories"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <span className="text-2xl shrink-0">{selectedCategory.icon || "📁"}</span>
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
                  <div
                    className={`shrink-0 h-2.5 w-2.5 rounded-full ${
                      getColorClasses(selectedCategory.color).badge
                    }`}
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingCategory(selectedCategory);
                      setCategoryModalOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeleteCategory}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingSnippet(null);
                      setSnippetModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Snippet</span>
                  </Button>
                </div>
              </div>

              {loadingSnippets ? (
                <div className="flex justify-center py-20">
                  <Spinner size="lg" />
                </div>
              ) : snippets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                  <FolderOpen className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">No snippets yet</p>
                  <p className="text-sm mt-1">
                    Add your first snippet to this category
                  </p>
                  <Button
                    className="mt-4"
                    size="sm"
                    onClick={() => {
                      setEditingSnippet(null);
                      setSnippetModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Snippet
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {snippets.map((snippet) => (
                    <SnippetCard
                      key={snippet.id}
                      snippet={snippet}
                      onEdit={() => {
                        setEditingSnippet(snippet);
                        setSnippetModalOpen(true);
                      }}
                      onDelete={() => handleDeleteSnippet(snippet.id)}
                      onAddCommand={() => {
                        setEditingCommand(null);
                        setActiveSnippetId(snippet.id);
                        setCommandModalOpen(true);
                      }}
                      onEditCommand={(cmd) => {
                        setEditingCommand(cmd);
                        setActiveSnippetId(snippet.id);
                        setCommandModalOpen(true);
                      }}
                      onDeleteCommand={handleDeleteCommand}
                      onReorderCommand={handleReorderCommand}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
              >
                <Menu className="h-4 w-4" />
                Browse Categories
              </button>
              <div className="text-center text-zinc-500">
                <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-semibold text-zinc-400">
                  Select a category
                </h2>
                <p className="mt-2 text-sm">
                  Choose a category from the sidebar or create a new one
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        initial={editingCategory || undefined}
      />

      <SnippetModal
        isOpen={snippetModalOpen}
        onClose={() => {
          setSnippetModalOpen(false);
          setEditingSnippet(null);
        }}
        onSave={handleSaveSnippet}
        initial={editingSnippet || undefined}
      />

      <CommandModal
        isOpen={commandModalOpen}
        onClose={() => {
          setCommandModalOpen(false);
          setEditingCommand(null);
          setActiveSnippetId(null);
        }}
        onSave={handleSaveCommand}
        initial={editingCommand || undefined}
      />

      <AssistantWidget onActionCreate={handleAIAction} />
    </div>
  );
}
