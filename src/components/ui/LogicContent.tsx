import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface LogicContentProps {
  content: string;
}

function formatLogicContent(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/([^\n])\n(\$\$)/g, "$1\n\n$2")
    .replace(/(\$\$)\n([^\n])/g, "$1\n\n$2")
    .replace(/([^\n])\n(- |\* |\d+\. )/g, "$1\n\n$2")
    .replace(/([^\n])\n(#{1,6}\s)/g, "$1\n\n$2")
    .trim();
}

export default function LogicContent({ content }: LogicContentProps) {
  const formatted = formatLogicContent(content);

  return (
    <div className="logic-markdown text-on-surface-variant">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-8 mb-4 font-headline text-3xl font-bold tracking-tight text-on-surface first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-7 mb-3 font-headline text-2xl font-semibold tracking-tight text-on-surface first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 mb-3 font-headline text-xl font-semibold tracking-tight text-on-surface first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-5 mb-2 font-headline text-lg font-semibold text-on-surface first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-4 leading-8 text-[15px] text-on-surface-variant">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 ml-5 list-disc space-y-2 marker:text-primary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 ml-5 list-decimal space-y-2 marker:text-primary">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1 leading-7 text-on-surface-variant">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-on-surface">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-on-surface">{children}</em>
          ),
          hr: () => <hr className="my-8 border-white/10" />,
          blockquote: ({ children }) => (
            <blockquote className="my-6 rounded-r-xl border-l-4 border-primary/50 bg-primary/5 px-4 py-3 text-on-surface">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[0.92em] text-primary">
              {children}
            </code>
          ),
        }}
      >
        {formatted}
      </ReactMarkdown>
    </div>
  );
}
