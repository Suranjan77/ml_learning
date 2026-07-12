import Link from "next/link";
import type { ExhibitDefinition } from "@/features/exhibits/types";

function GradientPreview() {
  return (
    <svg viewBox="0 0 360 150" className="h-full w-full" aria-hidden="true">
      <g fill="none" stroke="var(--color-outline-dark)">
        <ellipse cx="184" cy="76" rx="128" ry="55" />
        <ellipse cx="184" cy="76" rx="94" ry="40" />
        <ellipse cx="184" cy="76" rx="58" ry="25" />
      </g>
      <path
        d="M70 42 C98 45 104 76 130 71 S154 101 181 84 S207 80 224 76"
        fill="none"
        stroke="var(--color-accent)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      {["70,42", "105,65", "130,71", "158,92", "181,84", "224,76"].map(
        (point, index) => {
          const [cx, cy] = point.split(",");
          return (
            <circle
              key={point}
              cx={cx}
              cy={cy}
              r={index === 0 ? 6 : 3.5}
              fill="var(--color-accent)"
            />
          );
        },
      )}
      <circle cx="184" cy="76" r="6" fill="var(--color-primary)" />
    </svg>
  );
}

function AttentionPreview() {
  const tokens = [
    { label: "animal", x: 38 },
    { label: "street", x: 244 },
    { label: "it", x: 151 },
  ];

  return (
    <svg viewBox="0 0 360 150" className="h-full w-full" aria-hidden="true">
      <path
        d="M180 106 C165 56 120 47 78 47"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.72"
      />
      <path
        d="M180 106 C203 69 247 62 284 47"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
      {tokens.map(({ label, x }, index) => (
        <g key={label}>
          <rect
            x={x}
            y={index === 2 ? 93 : 29}
            width={index === 2 ? 58 : 78}
            height="34"
            fill={index === 2 ? "var(--color-primary)" : "var(--color-surface)"}
            stroke={index === 2 ? "var(--color-primary)" : "var(--color-outline-dark)"}
          />
          <text
            x={x + (index === 2 ? 29 : 39)}
            y={(index === 2 ? 93 : 29) + 22}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="11"
            fill={index === 2 ? "var(--color-on-primary)" : "var(--color-on-surface)"}
          >
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function KernelPreview() {
  const inner = [
    [175, 95],
    [190, 91],
    [181, 107],
    [164, 105],
  ];
  const ring = Array.from({ length: 10 }, (_, index) => {
    const angle = (index / 10) * Math.PI * 2;
    return [180 + Math.cos(angle) * 104, 78 + Math.sin(angle) * 42] as const;
  });

  return (
    <svg viewBox="0 0 360 150" className="h-full w-full" aria-hidden="true">
      <path
        d="M54 89 L180 31 L306 89 L180 139 Z"
        fill="var(--color-primary-container)"
        stroke="var(--color-outline-dark)"
      />
      <path
        d="M82 70 L180 28 L278 70 L180 111 Z"
        fill="var(--color-accent-container)"
        fillOpacity="0.72"
        stroke="var(--color-accent)"
        strokeDasharray="5 4"
      />
      {ring.map(([cx, cy], index) => (
        <circle
          key={index}
          cx={cx}
          cy={cy - 28}
          r="5"
          fill="var(--color-error)"
          stroke="var(--color-surface)"
          strokeWidth="2"
        />
      ))}
      {inner.map(([cx, cy], index) => (
        <circle
          key={index}
          cx={cx}
          cy={cy}
          r="5"
          fill="var(--color-primary)"
          stroke="var(--color-surface)"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

function ExhibitPreview({ slug }: { slug: string }) {
  if (slug === "gradient-descent") return <GradientPreview />;
  if (slug === "attention") return <AttentionPreview />;
  return <KernelPreview />;
}

export default function ExhibitCard({
  exhibit,
  index,
}: {
  exhibit: ExhibitDefinition;
  index: number;
}) {
  return (
    <Link
      href={`/visualisations/${exhibit.slug}`}
      className="group grid h-full min-h-[310px] grid-rows-[auto_minmax(120px,1fr)_auto] overflow-hidden bg-surface transition-colors hover:bg-surface-container-low focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:min-h-0"
    >
      <div className="flex items-center justify-between gap-4 border-b border-outline px-4 py-3 font-mono text-[10px] uppercase tracking-label text-on-surface-variant sm:px-5">
        <span className="truncate">
          {String(index + 1).padStart(2, "0")} · {exhibit.topic}
        </span>
        <span className="shrink-0">{exhibit.duration} min</span>
      </div>

      <div className="min-h-0 overflow-hidden bg-background px-3 py-2 transition-colors group-hover:bg-primary-container/35">
        <ExhibitPreview slug={exhibit.slug} />
      </div>

      <div className="border-t border-outline p-4 sm:p-5">
        <h2 className="line-clamp-2 font-headline text-xl font-medium leading-tight text-on-surface transition-colors group-hover:text-primary lg:text-2xl">
          {exhibit.question}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-on-surface-variant">
          {exhibit.summary}
        </p>
        <div className="mt-4 flex items-center justify-between gap-4 text-sm">
          <span className="font-mono text-[10px] uppercase tracking-label text-on-surface-variant">
            {exhibit.difficulty}
          </span>
          <span className="font-medium text-primary">Open visualisation →</span>
        </div>
      </div>
    </Link>
  );
}
