"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { getColorClasses } from "@/lib/utils";

export interface CategoryData {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  userId: string | null;
  isPublic: boolean;
  _count?: { snippets: number };
}

interface CategorySidebarProps {
  categories: CategoryData[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  readOnly?: boolean;
}

export default function CategorySidebar({
  categories,
  selectedId,
  onSelect,
  onAdd,
  readOnly = false,
}: CategorySidebarProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : categories;

  return (
    <aside className="flex h-full w-80 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-4 py-3 space-y-2">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Categories
        </h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-md bg-zinc-900 border border-zinc-800 pl-8 pr-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        {!readOnly && (
          <button
            onClick={onAdd}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Category
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-zinc-600">
            {query.trim() ? "No matches" : "No categories yet"}
          </p>
        )}

{filtered.map((cat) => {
          const colors = getColorClasses(cat.color);
          const isSelected = cat.id === selectedId;

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                isSelected
                  ? `${colors.bg} ${colors.text} ${colors.border} border`
                  : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 border border-transparent"
              }`}
            >
              <span className="text-lg">{cat.icon || "📁"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{cat.name}</p>
                {cat._count && (
                  <p className="text-xs text-zinc-500">
                    {cat._count.snippets} snippet{cat._count.snippets !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <div
                className={`h-2 w-2 rounded-full ${colors.badge}`}
              />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
