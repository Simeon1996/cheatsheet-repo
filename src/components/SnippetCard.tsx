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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="flex items-start justify-between px-5 pt-5 pb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-zinc-100">{snippet.title}</h3>
          {snippet.description && (
            <p className="mt-1 text-sm text-zinc-400">{snippet.description}</p>
          )}
        </div>
        {!readOnly && (
          <div className="flex items-center gap-1 ml-3">
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
        <div className="px-5 py-2">
          <img
            src={snippet.imageUrl}
            alt={snippet.title}
            className="rounded-lg border border-zinc-800 max-h-48 object-cover"
          />
        </div>
      )}

      <div className="px-5 pb-5 space-y-2">
        <div className="border-t border-zinc-800 pt-3 space-y-2">
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
        </div>

        {!readOnly && (
          <Button variant="ghost" size="sm" onClick={onAddCommand} className="w-full mt-2">
            <Plus className="h-3.5 w-3.5" />
            Add Command
          </Button>
        )}
      </div>
    </div>
  );
}
