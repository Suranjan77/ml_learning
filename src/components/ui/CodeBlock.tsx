"use client";

import { useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

const brutalistTheme: any = {
  'code[class*="language-"]': {
    color: '#FFFFFF',
    fontFamily: 'var(--font-mono), monospace',
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    lineHeight: '1.7',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: '#FFFFFF',
    fontFamily: 'var(--font-mono), monospace',
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    lineHeight: '1.7',
    MozTabSize: '4',
    OTabSize: '4',
    tabSize: '4',
    WebkitHyphens: 'none',
    MozHyphens: 'none',
    msHyphens: 'none',
    hyphens: 'none',
    padding: '0',
    margin: '0',
    overflow: 'auto',
    background: 'transparent',
  },
  'comment': { color: '#888888', fontStyle: 'italic' },
  'prolog': { color: '#888888' },
  'doctype': { color: '#888888' },
  'cdata': { color: '#888888' },
  'punctuation': { color: '#FFFFFF' },
  'namespace': { opacity: '.7' },
  'property': { color: '#FF3366' },
  'keyword': { color: '#FF3366', fontWeight: 'bold' },
  'tag': { color: '#FF3366' },
  'class-name': { color: '#00FFFF', textDecoration: 'underline' },
  'boolean': { color: '#00FFFF', fontWeight: 'bold' },
  'constant': { color: '#00FFFF' },
  'symbol': { color: '#FF3366' },
  'deleted': { color: '#FF3366' },
  'number': { color: '#FFEA00' },
  'selector': { color: '#00E676' },
  'attr-name': { color: '#00E676' },
  'string': { color: '#00E676' },
  'char': { color: '#00E676' },
  'builtin': { color: '#00FFFF' },
  'inserted': { color: '#00E676' },
  'variable': { color: '#FFFFFF' },
  'operator': { color: '#FFFFFF' },
  'entity': { color: '#FFEA00', cursor: 'help' },
  'url': { color: '#00FFFF' },
  '.language-css .token.string': { color: '#00FFFF' },
  '.style .token.string': { color: '#00FFFF' },
  'atrule': { color: '#00FFFF' },
  'attr-value': { color: '#00FFFF' },
  'function': { color: '#00FFFF', fontWeight: 'bold' },
  'regex': { color: '#00FFFF' },
  'important': { color: '#FF3366', fontWeight: 'bold' },
  'bold': { fontWeight: 'bold' },
  'italic': { fontStyle: 'italic' },
};

interface CodeBlockProps {
  code: string;
  fileName?: string;
  language?: string;
}

function inferLanguage(code: string, language?: string) {
  if (language) return language;

  const normalized = code.toLowerCase();
  
  if (
    normalized.includes("import torch") ||
    normalized.includes("import numpy") ||
    normalized.includes("import pandas") ||
    normalized.includes("import scipy") ||
    normalized.includes("from scipy") ||
    normalized.includes("nn.module") ||
    normalized.includes("def __init__") ||
    normalized.includes("from sklearn") ||
    normalized.includes("def ")
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

function inferFileName(code: string, fileName?: string, detectedLanguage?: string) {
  if (fileName) return fileName;

  const normalized = code.toLowerCase();

  if (normalized.includes("import torch") || normalized.includes("from sklearn") || normalized.includes("import numpy") || normalized.includes("def ")) {
    return "model_fitting.py";
  }

  if (detectedLanguage === "TypeScript") return "example.ts";
  if (detectedLanguage === "JavaScript") return "example.js";

  return "example.txt";
}

export default function CodeBlock({
  code,
  fileName,
  language,
}: CodeBlockProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const detectedLanguage = useMemo(
    () => inferLanguage(code, language),
    [code, language]
  );

  const displayFileName = useMemo(
    () => inferFileName(code, fileName, detectedLanguage),
    [code, fileName, detectedLanguage]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 2200);
    }
  };

  const buttonLabel = copyState === "copied" ? "COPIED!" : copyState === "error" ? "FAILED" : "COPY CODE";

  return (
    <div className="overflow-hidden border-2 border-outline bg-[#0D0D0D] shadow-[4px_4px_0px_0px_var(--color-outline)] mb-6">
      <div className="flex flex-col gap-3 border-b-2 border-outline bg-[#1E1E1E] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0 flex items-center gap-3">
          <div className="bg-white text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] border border-black shadow-[2px_2px_0px_0px_#FF3366]">
            {detectedLanguage}
          </div>
          <div className="truncate text-sm font-bold font-mono text-white">
            {displayFileName}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-live="polite"
          className={`inline-flex items-center justify-center border-2 border-outline px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-transform active:translate-y-1 ${
            copyState === "copied"
              ? "bg-[#00E676] text-black border-black"
              : copyState === "error"
                ? "bg-[#FF3366] text-black border-black"
                : "bg-black text-white hover:bg-white hover:text-black"
          }`}
        >
          {buttonLabel}
        </button>
      </div>

      <div className="overflow-x-auto px-4 py-5 sm:px-6 relative">
        <SyntaxHighlighter
          language={detectedLanguage.toLowerCase()}
          style={brutalistTheme}
          showLineNumbers={true}
          lineNumberStyle={{ minWidth: "3em", paddingRight: "1em", color: "#555", textAlign: "right" }}
          customStyle={{
            background: "transparent",
            padding: 0,
            margin: 0,
            fontSize: "13px",
            lineHeight: "1.7",
          }}
          codeTagProps={{
            style: { fontFamily: "var(--font-mono), monospace" },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
