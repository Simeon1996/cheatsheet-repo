"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ParsedAction {
  categoryName: string;
  title: string;
  description?: string;
  commands: { label?: string; content: string; language?: string }[];
}

interface AssistantWidgetProps {
  onActionCreate?: (action: ParsedAction) => Promise<void>;
}

export default function AssistantWidget({ onActionCreate }: AssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const parseActions = (text: string): { cleanText: string; actions: ParsedAction[] } => {
    const actions: ParsedAction[] = [];
    const cleanText = text.replace(
      /\[ACTION:create_snippet\]([\s\S]*?)\[\/ACTION\]/g,
      (_match, jsonStr) => {
        try {
          const parsed = JSON.parse(jsonStr.trim());
          actions.push(parsed);
          return "";
        } catch {
          return "";
        }
      }
    ).trim();
    return { cleanText, actions };
  };

  const handleApplyAction = async (action: ParsedAction) => {
    if (onActionCreate) {
      try {
        await onActionCreate(action);
        toast.success(`Created snippet "${action.title}"`);
      } catch {
        toast.error("Failed to create snippet");
      }
    } else {
      toast.error("Navigate to workspace to apply actions");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();
      const assistantContent = data.content || "Sorry, I could not generate a response.";
      setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg: Message, idx: number) => {
    if (msg.role === "user") {
      return (
        <div key={idx} className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-500 px-3.5 py-2 text-sm text-white">
            {msg.content}
          </div>
        </div>
      );
    }

    const { cleanText, actions } = parseActions(msg.content);

    return (
      <div key={idx} className="flex justify-start">
        <div className="max-w-[85%] space-y-2">
          {cleanText && (
            <div className="rounded-2xl rounded-bl-sm bg-zinc-800 px-3.5 py-2 text-sm text-zinc-200 whitespace-pre-wrap">
              {cleanText}
            </div>
          )}
          {actions.map((action, aIdx) => (
            <div
              key={aIdx}
              className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-medium text-indigo-400">
                  Snippet: {action.title}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-2">
                Category: {action.categoryName} | {action.commands.length} command(s)
              </p>
              <button
                onClick={() => handleApplyAction(action)}
                className="rounded-lg bg-indigo-500 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-600 transition-colors"
              >
                Apply to Workspace
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 transition-all hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-semibold text-zinc-100">AI Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="h-8 w-8 text-indigo-400/50 mb-3" />
                <p className="text-sm text-zinc-400">
                  Ask me to create cheatsheets, suggest commands, or organize your snippets.
                </p>
              </div>
            )}
            {messages.map((msg, idx) => renderMessage(msg, idx))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-zinc-800 px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-zinc-800 p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about commands..."
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
