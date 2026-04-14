"use client";

import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

const LANGUAGES = ["bash", "python", "javascript", "typescript", "sql", "yaml", "json", "go", "rust", "dockerfile", "hcl"];

interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    label: string;
    content: string;
    language: string;
  }) => Promise<void>;
  initial?: {
    label: string | null;
    content: string;
    language: string;
  };
}

export default function CommandModal({
  isOpen,
  onClose,
  onSave,
  initial,
}: CommandModalProps) {
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("bash");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setLabel(initial.label || "");
      setContent(initial.content);
      setLanguage(initial.language);
    } else {
      setLabel("");
      setContent("");
      setLanguage("bash");
    }
  }, [initial, isOpen]);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onSave({
        label: label.trim(),
        content: content.trim(),
        language,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? "Edit Command" : "New Command"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Label (optional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. List all pods"
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-300">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-300">Command / Code</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="kubectl get pods -n default"
            rows={4}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-mono text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initial ? "Update" : "Add"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
