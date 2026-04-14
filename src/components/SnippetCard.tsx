"use client";

import { Pencil, Trash2, Plus } from "lucide-react";
import CommandBlock, { CommandData } from "./CommandBlock";
import Button from "./ui/Button";

export interface SnippetData {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  isPublic: boolean;
  commands: CommandData[];
}

interface SnippetCardProps {
  snippet: SnippetData;
  readOnly?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddCommand?: () => void;
  onEditCommand?: (command: CommandData) => void;
  onDeleteCommand?: (commandId: string) => void;
  onReorderCommand?: (commandId: string, direction: "up" | "down") => void;
}

export default function SnippetCard({
  snippet,
  readOnly = false,
  onEdit,
  onDelete,
  onAddCommand,
  onEditCommand,
  onDeleteCommand,
  onReorderCommand,
}: SnippetCardProps) {
  const sortedCommands = [...snippet.commands].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-900 overflow-hidden shadow-lg shadow-black/30">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-zinc-800">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-zinc-100 tracking-tight">
            {snippet.title}
          </h3>
          {snippet.description && (
            <p className="mt-1.5 text-sm text-zinc-300 leading-relaxed">
              {snippet.description}
            </p>
          )}
        </div>
        {!readOnly && (
          <div className="flex items-center gap-1 ml-3 shrink-0">
            <button
              onClick={onEdit}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
              title="Edit snippet"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors"
              title="Delete snippet"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {snippet.imageUrl && (
        <div className="px-5 py-3">
          <img
            src={snippet.imageUrl}
            alt={snippet.title}
            className="rounded-lg border border-zinc-800 max-h-48 object-cover"
          />
        </div>
      )}

      {/* Commands */}
      <div className="px-5 py-4 space-y-3">
        {sortedCommands.map((cmd, idx) => (
          <CommandBlock
            key={cmd.id}
            command={cmd}
            readOnly={readOnly}
            isFirst={idx === 0}
            isLast={idx === sortedCommands.length - 1}
            onEdit={() => onEditCommand?.(cmd)}
            onDelete={() => onDeleteCommand?.(cmd.id)}
            onReorder={(dir) => onReorderCommand?.(cmd.id, dir)}
          />
        ))}

        {!readOnly && (
          <Button variant="ghost" size="sm" onClick={onAddCommand} className="w-full mt-1">
            <Plus className="h-3.5 w-3.5" />
            Add Command
          </Button>
        )}
      </div>
    </div>
  );
}
