"use client";

import { useState } from "react";
import { Check, Copy, ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import CodeHighlight from "./CodeHighlight";

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

const LANGUAGE_COLORS: Record<string, { dot: string; label: string }> = {
  bash:       { dot: "bg-emerald-400",  label: "text-emerald-400"  },
  shell:      { dot: "bg-emerald-400",  label: "text-emerald-400"  },
  python:     { dot: "bg-blue-400",     label: "text-blue-400"     },
  typescript: { dot: "bg-sky-400",      label: "text-sky-400"      },
  javascript: { dot: "bg-yellow-400",   label: "text-yellow-400"   },
  sql:        { dot: "bg-orange-400",   label: "text-orange-400"   },
  yaml:       { dot: "bg-purple-400",   label: "text-purple-400"   },
  json:       { dot: "bg-amber-400",    label: "text-amber-400"    },
  go:         { dot: "bg-cyan-400",     label: "text-cyan-400"     },
  rust:       { dot: "bg-red-400",      label: "text-red-400"      },
  text:       { dot: "bg-zinc-500",     label: "text-zinc-400"     },
};

function getLangStyle(lang: string) {
  return LANGUAGE_COLORS[lang.toLowerCase()] ?? { dot: "bg-indigo-400", label: "text-indigo-400" };
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
  const langStyle = getLangStyle(command.language);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-zinc-700/70 bg-zinc-950 overflow-hidden shadow-md shadow-black/40">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-900 border-b border-zinc-700/70">
        <div className="flex items-center gap-2.5">
          {/* language dot + name */}
          <span className={`h-2 w-2 rounded-full shrink-0 ${langStyle.dot}`} />
          <span className={`text-xs font-semibold font-mono uppercase tracking-wide ${langStyle.label}`}>
            {command.language}
          </span>
          {command.label && (
            <>
              <span className="text-zinc-700 text-xs">·</span>
              <span className="text-xs font-medium text-zinc-300">{command.label}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {!readOnly && (
            <>
              {!isFirst && (
                <button
                  onClick={() => onReorder?.("up")}
                  className="rounded p-1 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                  title="Move up"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
              )}
              {!isLast && (
                <button
                  onClick={() => onReorder?.("down")}
                  className="rounded p-1 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                  title="Move down"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={onEdit}
                className="rounded p-1 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="rounded p-1 text-zinc-600 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          <button
            onClick={handleCopy}
            className={`rounded p-1 transition-colors ml-1 ${
              copied
                ? "text-green-400"
                : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
            title={copied ? "Copied!" : "Copy"}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Code */}
      <CodeHighlight code={command.content} language={command.language} />
    </div>
  );
}
