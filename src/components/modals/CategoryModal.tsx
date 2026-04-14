"use client";

import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { CATEGORY_COLORS, getColorClasses, cn } from "@/lib/utils";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    icon: string;
    color: string;
    description: string;
  }) => Promise<void>;
  initial?: {
    name: string;
    icon: string | null;
    color: string | null;
    description: string | null;
  };
}

const EMOJI_OPTIONS = [
  "📁", "🐳", "☁️", "🔧", "🐍", "📦", "🗄️", "🌐",
  "🔒", "🚀", "⚡", "🎯", "📊", "🛠️", "💻", "🖥️",
];

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  initial,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📁");
  const [color, setColor] = useState("blue");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setIcon(initial.icon || "📁");
      setColor(initial.color || "blue");
      setDescription(initial.description || "");
    } else {
      setName("");
      setIcon("📁");
      setColor("blue");
      setDescription("");
    }
  }, [initial, isOpen]);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onSave({ name: name.trim(), icon, color, description: description.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? "Edit Category" : "New Category"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Kubernetes"
          required
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-300">Icon</label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={cn(
                  "h-9 w-9 rounded-lg text-lg flex items-center justify-center transition-colors border",
                  icon === emoji
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-300">Color</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((c) => {
              const colors = getColorClasses(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    colors.badge,
                    color === c
                      ? "ring-2 ring-offset-2 ring-offset-zinc-900 ring-white scale-110"
                      : "opacity-60 hover:opacity-100"
                  )}
                />
              );
            })}
          </div>
        </div>

        <Input
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description..."
        />

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initial ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
