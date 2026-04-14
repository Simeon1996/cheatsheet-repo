import { createHighlighter, type Highlighter } from "shiki";

// Singleton — initialised once, reused for every code block on the page
let promise: Promise<Highlighter> | null = null;

const SUPPORTED_LANGS = [
  "bash", "shellscript", "python", "typescript", "javascript",
  "sql", "yaml", "json", "go", "rust", "markdown", "dockerfile",
  "css", "html", "toml", "diff", "plaintext", "text",
] as const;

// Map the language strings stored in the DB to valid shiki IDs
const LANG_ALIASES: Record<string, string> = {
  shell: "bash",
  text:  "plaintext",
  sh:    "bash",
  py:    "python",
  ts:    "typescript",
  js:    "javascript",
  yml:   "yaml",
};

export function getHighlighter(): Promise<Highlighter> {
  if (!promise) {
    promise = createHighlighter({
      themes: ["one-dark-pro"],
      langs: [...SUPPORTED_LANGS],
    });
  }
  return promise;
}

export function resolveLanguage(lang: string): string {
  const lower = lang.toLowerCase();
  return LANG_ALIASES[lower] ?? lower;
}
