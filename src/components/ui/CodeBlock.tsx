"use client";

import { useMemo, useState } from "react";

interface CodeBlockProps {
  code: string;
  fileName?: string;
  language?: string;
}

function inferLanguage(code: string, language?: string) {
  if (language) {
    return language;
  }

  const normalized = code.toLowerCase();

  if (
    normalized.includes("import torch") ||
    normalized.includes("nn.module") ||
    normalized.includes("def __init__") ||
    normalized.includes("from sklearn")
  ) {
    return "Python";
  }

  if (
    normalized.includes("interface ") ||
    normalized.includes("type ") ||
    normalized.includes("export default") ||
    normalized.includes("const ")
  ) {
    return "TypeScript";
  }

  if (
    normalized.includes("function ") ||
    normalized.includes("console.log") ||
    normalized.includes("=>")
  ) {
    return "JavaScript";
  }

  return "Code";
}

function inferFileName(
  code: string,
  fileName?: string,
  detectedLanguage?: string,
) {
  if (fileName) {
    return fileName;
  }

  const normalized = code.toLowerCase();

  if (
    normalized.includes("import torch") ||
    normalized.includes("from sklearn") ||
    normalized.includes("def ")
  ) {
    return "model_fitting.py";
  }

  if (detectedLanguage === "TypeScript") {
    return "example.ts";
  }

  if (detectedLanguage === "JavaScript") {
    return "example.js";
  }

  return "example.txt";
}

export default function CodeBlock({
  code,
  fileName,
  language,
}: CodeBlockProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const detectedLanguage = useMemo(
    () => inferLanguage(code, language),
    [code, language],
  );

  const displayFileName = useMemo(
    () => inferFileName(code, fileName, detectedLanguage),
    [code, fileName, detectedLanguage],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
      window.setTimeout(() => {
        setCopyState("idle");
      }, 1800);
    } catch {
      setCopyState("error");
      window.setTimeout(() => {
        setCopyState("idle");
      }, 2200);
    }
  };

  const buttonLabel =
    copyState === "copied"
      ? "Copied"
      : copyState === "error"
        ? "Copy failed"
        : "Copy";

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
      <div className="flex flex-col gap-3 border-b border-outline-variant/50 bg-surface-container-low px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <div className="truncate text-xs font-mono text-on-surface-variant">
            {displayFileName}
          </div>
          <div className="mt-0.5 text-[10px] font-mono uppercase tracking-wider text-outline">
            {detectedLanguage}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-live="polite"
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
            copyState === "copied"
              ? "bg-primary text-on-primary"
              : copyState === "error"
                ? "bg-error/15 text-error"
                : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
          }`}
        >
          {buttonLabel}
        </button>
      </div>

      <div className="overflow-x-auto px-4 py-5 sm:px-6 sm:py-6">
        <pre className="font-mono text-[13px] leading-8 text-on-surface sm:text-sm">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
