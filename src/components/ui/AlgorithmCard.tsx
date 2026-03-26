import Link from "next/link";
import { clsx } from "clsx";

interface AlgorithmCardProps {
  title: string;
  description: string;
  formula: string;
  icon: string;
  slug: string;
  color: "primary" | "secondary" | "tertiary";
}

const colorMap = {
  primary: {
    border: "border-primary/12 hover:border-primary/24",
    glow: "from-primary/10 via-primary/4 to-transparent",
    formulaBg: "bg-primary/8",
    formulaBorder: "border-primary/16",
    formulaText: "text-primary/80",
    linkText: "text-primary",
    dot: "bg-primary",
  },
  secondary: {
    border: "border-secondary/12 hover:border-secondary/24",
    glow: "from-secondary/10 via-secondary/4 to-transparent",
    formulaBg: "bg-secondary/8",
    formulaBorder: "border-secondary/16",
    formulaText: "text-secondary/80",
    linkText: "text-secondary",
    dot: "bg-secondary",
  },
  tertiary: {
    border: "border-tertiary/12 hover:border-tertiary/24",
    glow: "from-tertiary/10 via-tertiary/4 to-transparent",
    formulaBg: "bg-tertiary/8",
    formulaBorder: "border-tertiary/16",
    formulaText: "text-tertiary/80",
    linkText: "text-tertiary",
    dot: "bg-tertiary",
  },
} as const;

export default function AlgorithmCard({
  title,
  description,
  formula,
  slug,
  color,
}: AlgorithmCardProps) {
  const colors = colorMap[color];

  return (
    <Link
      href={`/algorithms/${slug}`}
      className={clsx(
        "group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-2xl border bg-surface-container-high/55 p-6 shadow-[0_14px_32px_rgba(0,0,0,0.16)] backdrop-blur transition-all duration-200",
        "hover:-translate-y-0.5 hover:bg-surface-container-high/75 hover:shadow-[0_18px_38px_rgba(0,0,0,0.2)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0",
        colors.border,
      )}
    >
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          colors.glow,
        )}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={clsx(
                "h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_14px_rgba(255,255,255,0.18)]",
                colors.dot,
              )}
            />
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">
              Algorithm
            </p>
          </div>

          <div
            className={clsx(
              "max-w-[68%] truncate rounded-full border px-3 py-1 text-[11px] font-mono tracking-[0.08em]",
              colors.formulaBg,
              colors.formulaBorder,
              colors.formulaText,
            )}
            title={formula}
          >
            {formula}
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <h3 className="mb-3 text-balance font-headline text-2xl font-semibold tracking-tight text-slate-50">
            {title}
          </h3>

          <p className="text-sm leading-7 text-on-surface-variant sm:text-[15px]">
            {description}
          </p>
        </div>

        <div className="mt-6 border-t border-white/8 pt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                Open lesson
              </p>
              <p className="mt-1 truncate text-sm text-slate-400">
                Intuition, logic, code, strengths
              </p>
            </div>

            <span
              className={clsx(
                "shrink-0 text-sm font-semibold transition-transform duration-200 group-hover:translate-x-0.5",
                colors.linkText,
              )}
            >
              Learn more →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
