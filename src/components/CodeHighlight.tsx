"use client";

import { useEffect, useState } from "react";
import { getHighlighter, resolveLanguage } from "@/lib/highlighter";

interface CodeHighlightProps {
  code: string;
  language: string;
}

export default function CodeHighlight({ code, language }: CodeHighlightProps) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getHighlighter().then((hl) => {
      if (cancelled) return;

      const lang = resolveLanguage(language);
      const supported = hl.getLoadedLanguages();
      const safeLang = supported.includes(lang as never) ? lang : "plaintext";

      const result = hl.codeToHtml(code, {
        lang: safeLang,
        theme: "one-dark-pro",
      });

      setHtml(result);
    });

    return () => { cancelled = true; };
  }, [code, language]);

  // Fallback while shiki initialises (first load only)
  if (!html) {
    return (
      <pre className="overflow-x-auto px-5 py-4 text-sm leading-[1.7] font-mono text-zinc-200 whitespace-pre">
        {code}
      </pre>
    );
  }

  return (
    <div
      className="shiki-wrapper overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
