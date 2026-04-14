"use client";

import { useState } from "react";
import { Check, Copy, ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";

export interface CommandData {
  id: string;
  label: string | null;
  content: string;
  language: string;
  order: number;
}

interface CommandBlockProps {
  command: CommandData;
  readOnly?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReorder?: (direction: "up" | "down") => void;
}

export default function CommandBlock({
  command,
  readOnly = false,
  isFirst = false,
  isLast = false,
  onEdit,
  onDelete,
  onReorder,
}: CommandBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono text-zinc-400">
            {command.language}
          </span>
          {command.label && (
            <span className="text-xs text-zinc-500">{command.label}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!readOnly && (
            <>
              {!isFirst && (
                <button
                  onClick={() => onReorder?.("up")}
                  className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                  title="Move up"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
              )}
              {!isLast && (
                <button
                  onClick={() => onReorder?.("down")}
                  className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                  title="Move down"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={onEdit}
                className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          <button
            onClick={handleCopy}
            className={`rounded p-1 transition-colors ${
              copied
                ? "text-green-400"
                : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            }`}
            title="Copy"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-sm">
        <code className="font-mono text-zinc-300">{command.content}</code>
      </pre>
    </div>
  );
}
