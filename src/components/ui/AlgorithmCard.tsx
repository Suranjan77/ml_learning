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
    border: "border-outline-variant/60 hover:border-primary/40",
    formulaBg: "bg-primary/8",
    formulaBorder: "border-primary/20",
    formulaText: "text-primary/80",
    linkText: "text-primary",
    dot: "bg-primary",
  },
  secondary: {
    border: "border-outline-variant/60 hover:border-secondary/40",
    formulaBg: "bg-secondary/8",
    formulaBorder: "border-secondary/20",
    formulaText: "text-secondary/80",
    linkText: "text-secondary",
    dot: "bg-secondary",
  },
  tertiary: {
    border: "border-outline-variant/60 hover:border-tertiary/40",
    formulaBg: "bg-tertiary/8",
    formulaBorder: "border-tertiary/20",
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
        "group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-xl border bg-surface-container-high p-6 transition-colors",
        "hover:bg-surface-container-highest",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        colors.border,
      )}
    >
      <div className="flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={clsx(
                "h-2 w-2 shrink-0 rounded-full",
                colors.dot,
              )}
            />
            <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              Algorithm
            </p>
          </div>

          <div
            className={clsx(
              "max-w-[68%] truncate rounded-full border px-3 py-1 text-[11px] font-mono tracking-wide",
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
          <h3 className="mb-3 text-balance font-headline text-2xl font-semibold tracking-tight text-on-surface">
            {title}
          </h3>

          <p className="text-sm leading-7 text-on-surface-variant sm:text-[15px]">
            {description}
          </p>
        </div>

        <div className="mt-6 border-t border-outline-variant/50 pt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
                Open lesson
              </p>
              <p className="mt-1 truncate text-sm text-on-surface-variant">
                Intuition, logic, code, strengths
              </p>
            </div>

            <span
              className={clsx(
                "shrink-0 text-sm font-semibold",
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
