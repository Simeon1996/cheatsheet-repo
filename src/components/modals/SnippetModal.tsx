"use client";

import { useState, useEffect, useRef } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Upload, X } from "lucide-react";

interface SnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    imageUrl: string | null;
  }) => Promise<void>;
  initial?: {
    title: string;
    description: string | null;
    imageUrl: string | null;
  };
}

export default function SnippetModal({
  isOpen,
  onClose,
  onSave,
  initial,
}: SnippetModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description || "");
      setImageUrl(initial.imageUrl || null);
    } else {
      setTitle("");
      setDescription("");
      setImageUrl(null);
    }
  }, [initial, isOpen]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setImageUrl(data.url);
      }
    } finally {
      setUploading(false);
    }
  };

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        imageUrl,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? "Edit Snippet" : "New Snippet"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. S3 Bucket Operations"
          required
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-300">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What these commands do..."
            rows={2}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-300">
            Image (optional)
          </label>
          {imageUrl ? (
            <div className="relative inline-block">
              <img
                src={imageUrl}
                alt="Preview"
                className="h-24 rounded-lg border border-zinc-700 object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="absolute -top-2 -right-2 rounded-full bg-zinc-800 p-1 text-zinc-400 hover:text-red-400 border border-zinc-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-700 px-4 py-3 text-sm text-zinc-500 hover:border-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload image"}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
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
            {initial ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
