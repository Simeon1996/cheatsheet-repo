"use client";

import { Plus } from "lucide-react";
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
  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Categories
        </h2>
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
        {categories.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-zinc-600">
            No categories yet
          </p>
        )}

{categories.map((cat) => {
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
