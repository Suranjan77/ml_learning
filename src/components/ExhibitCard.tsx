import Link from "next/link";
import type { ExhibitSummary } from "@/features/exhibits/types";

function GradientPreview() {
  return (
    <svg viewBox="0 0 360 150" className="h-full w-full" aria-hidden="true">
      <g fill="none" stroke="var(--color-outline-dark)" opacity="0.8">
        <ellipse cx="102" cy="70" rx="56" ry="34" /><ellipse cx="102" cy="70" rx="34" ry="20" /><ellipse cx="102" cy="70" rx="15" ry="9" />
        <ellipse cx="254" cy="82" rx="72" ry="42" /><ellipse cx="254" cy="82" rx="44" ry="26" /><ellipse cx="254" cy="82" rx="20" ry="12" />
      </g>
      <path d="M171 12 C171 48 173 102 174 140" stroke="var(--color-error)" strokeDasharray="5 5" opacity="0.55" />
      <path
        className="preview-gradient-path"
        d="M43 30 C64 33 62 55 82 55 S91 70 102 70"
        fill="none"
        stroke="var(--color-accent)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      {["43,30", "64,40", "82,55", "94,66", "102,70"].map(
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
      <circle cx="102" cy="70" r="6" fill="var(--color-accent)" />
      <circle cx="254" cy="82" r="7" fill="var(--color-primary)" />
      <text x="102" y="103" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-accent)">local</text>
      <text x="254" y="119" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-primary)">global</text>
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
        className="preview-attention-arc preview-attention-arc-strong"
        d="M180 106 C165 56 120 47 78 47"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.72"
      />
      <path
        className="preview-attention-arc preview-attention-arc-weak"
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
        className="preview-kernel-plane"
        d="M82 70 L180 28 L278 70 L180 111 Z"
        fill="var(--color-accent-container)"
        fillOpacity="0.72"
        stroke="var(--color-accent)"
        strokeDasharray="5 4"
      />
      {ring.map(([cx, cy], index) => (
        <circle
          key={index}
          cx={cx.toFixed(3)}
          cy={(cy - 28).toFixed(3)}
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

function OverfittingPreview() {
  const points = [
    [52, 96], [86, 62], [120, 84], [154, 48], [188, 70],
    [222, 44], [256, 78], [290, 52], [316, 88],
  ] as const;

  return (
    <svg viewBox="0 0 360 150" className="h-full w-full" aria-hidden="true">
      <path
        d="M40 104 C110 42 250 92 324 56"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        className="preview-overfit-curve"
        d="M40 110 L86 62 L120 92 L154 40 L188 78 L222 36 L256 86 L290 44 L324 96"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeDasharray="1 0"
        opacity="0.85"
      />
      {points.map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="4.5"
          fill="var(--color-on-surface)"
          stroke="var(--color-surface)"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

function KMeansPreview() {
  const clusters = [
    { colour: "var(--color-primary)", cx: 92, cy: 62, points: [[-26, -12], [-6, 14], [16, -16], [4, -2], [-18, 18]] },
    { colour: "var(--color-accent)", cx: 218, cy: 100, points: [[-22, 6], [-2, -14], [18, 10], [8, 22], [-12, -4]] },
    { colour: "var(--color-error)", cx: 296, cy: 46, points: [[-18, 10], [2, -10], [14, 14], [-4, 4]] },
  ] as const;

  return (
    <svg viewBox="0 0 360 150" className="h-full w-full" aria-hidden="true">
      {clusters.map(({ colour, cx, cy, points }) => (
        <g key={colour} className="preview-kmeans-cluster">
          {points.map(([dx, dy]) => (
            <circle key={`${dx}-${dy}`} cx={cx + dx} cy={cy + dy} r="4" fill={colour} opacity="0.75" />
          ))}
          <circle cx={cx} cy={cy} r="9" fill="var(--color-surface)" stroke={colour} strokeWidth="3" />
          <circle cx={cx} cy={cy} r="2.5" fill={colour} />
        </g>
      ))}
    </svg>
  );
}

function TokenSamplingPreview() {
  const bars = [
    { width: 208, label: "dusk", highlighted: true },
    { width: 132, label: "dark", highlighted: false },
    { width: 84, label: "noon", highlighted: false },
    { width: 46, label: "rain", highlighted: false },
    { width: 22, label: "socks", highlighted: false },
  ] as const;

  return (
    <svg viewBox="0 0 360 150" className="h-full w-full" aria-hidden="true">
      {bars.map(({ width, label, highlighted }, index) => {
        const y = 18 + index * 24;
        return (
          <g key={label}>
            <text
              x="52"
              y={y + 12}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              fontSize="11"
              fill="var(--color-on-surface)"
            >
              {label}
            </text>
            <rect
              className="preview-token-bar"
              x="62"
              y={y}
              width={width}
              height="16"
              fill={highlighted ? "var(--color-accent)" : "var(--color-primary)"}
              opacity={highlighted ? 1 : 0.45 + (4 - index) * 0.08}
            />
          </g>
        );
      })}
    </svg>
  );
}

function ParticleSwarmPreview() {
  const particles = [[58, 48], [92, 102], [130, 67], [172, 111], [222, 52], [270, 96], [313, 45], [245, 122], [144, 34]] as const;
  return <svg viewBox="0 0 360 150" className="h-full w-full" aria-hidden="true">
    {[30, 54, 82].map((radius) => <ellipse key={radius} cx="196" cy="78" rx={radius * 1.45} ry={radius * 0.62} fill="none" stroke="var(--color-outline-dark)" opacity="0.65" />)}
    {particles.map(([x, y], index) => <g key={index} className="preview-particle" transform={`translate(${x} ${y}) rotate(${index * 17 - 35})`}><path d="M-10 3 L0 -2 L10 3 L4 1 L0 7 L-4 1 Z" fill={index % 2 ? "var(--color-error)" : "var(--color-primary)"} /></g>)}
    <path d="M184 75 L196 68 L208 75 L201 73 L196 84 L191 73 Z" fill="var(--color-accent)" />
    <path d="M303 108 l12-7 12 7-7-2-5 10-5-10z" fill="var(--color-on-surface)" />
    <circle cx="315" cy="108" r="17" fill="none" stroke="var(--color-error)" strokeDasharray="3 3" />
  </svg>;
}

function CnnPreview() {
  const image = [0,0,1,1,0,0, 0,1,1,1,1,0, 1,1,0,0,1,1, 1,0,1,1,0,1, 1,1,1,1,1,1, 0,0,0,0,0,0];
  return <svg viewBox="0 0 360 150" className="h-full w-full" aria-hidden="true">
    {image.map((value, index) => <rect key={index} x={36 + (index % 6) * 17} y={24 + Math.floor(index / 6) * 17} width="15" height="15" fill={value ? "var(--color-primary)" : "var(--color-surface)"} stroke="var(--color-outline)" />)}
    <path d="M152 75 H190" stroke="var(--color-outline-dark)" /><path d="M190 75 l-7-4v8z" fill="var(--color-outline-dark)" />
    {Array.from({ length: 9 }, (_, index) => <rect key={index} className="preview-cnn-activation" x={202 + (index % 3) * 22} y={43 + Math.floor(index / 3) * 22} width="20" height="20" fill={index % 3 === 0 ? "var(--color-error)" : index % 3 === 2 ? "var(--color-primary)" : "var(--color-surface)"} opacity="0.75" />)}
    <path d="M278 75 H310" stroke="var(--color-outline-dark)" /><circle cx="324" cy="75" r="13" fill="var(--color-accent)" />
  </svg>;
}

function GeneticPreview() {
  const genomes = ["101101001010", "101111001010", "101111101010", "101111101110"];
  return <svg viewBox="0 0 360 150" className="h-full w-full" aria-hidden="true">
    <path d="M24 48 C75 45 82 91 132 82 S210 105 248 48 S305 28 336 64" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
    {genomes.map((genome, row) => <g key={genome} transform={`translate(40 ${62 + row * 20})`}><text fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-on-surface)">{genome}</text><rect className="preview-genetic-fitness" x="105" y="-9" width={70 + row * 32} height="11" fill={row === genomes.length - 1 ? "var(--color-accent)" : "var(--color-primary)"} opacity={0.55 + row * 0.14} /></g>)}
  </svg>;
}

function PcaPreview() {
  const points = Array.from({ length: 18 }, (_, index) => ({ x: 55 + index * 14, y: 112 - index * 3.4 + Math.sin(index * 2.2) * 15 }));
  return <svg viewBox="0 0 360 150" className="h-full w-full" aria-hidden="true"><line className="preview-pca-axis" x1="38" y1="128" x2="326" y2="35" stroke="var(--color-accent)" strokeWidth="3" />{points.map((point,index) => <g key={index}><line x1={point.x} y1={point.y} x2={point.x+3} y2={point.y-1} stroke="var(--color-error)" opacity="0.4" /><circle cx={point.x} cy={point.y} r="4" fill="var(--color-primary)" /></g>)}</svg>;
}

function BackpropPreview() {
  const inputs = [[60,45],[60,105]]; const hidden = [[180,38],[180,112]]; const output = [300,75];
  return <svg viewBox="0 0 360 150" className="h-full w-full" aria-hidden="true">{inputs.flatMap((a,i) => hidden.map((b,j) => <line key={`${i}-${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={(i+j)%2 ? "var(--color-error)" : "var(--color-primary)"} strokeWidth={2+(i+j)} opacity="0.6" />))}{hidden.map((a,i)=><line key={i} x1={a[0]} y1={a[1]} x2={output[0]} y2={output[1]} stroke="var(--color-accent)" strokeWidth={i?2:5} opacity="0.65" />)}{inputs.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="12" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="3" />)}{hidden.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="15" fill="var(--color-primary-container)" stroke="var(--color-primary)" strokeWidth="3" />)}<circle cx={output[0]} cy={output[1]} r="19" fill="var(--color-accent-container)" stroke="var(--color-accent)" strokeWidth="3" /></svg>;
}

function RegressionPreview() {
  const samples = [[48,108],[68,95],[91,91],[116,77],[141,72],[166,62],[192,58],[218,49],[245,42]] as const;
  return <svg viewBox="0 0 360 150" className="h-full w-full" aria-hidden="true">
    <g stroke="var(--color-outline)" strokeWidth="1">
      {[38,68,98,128].map((y) => <line key={y} x1="28" y1={y} x2="258" y2={y} />)}
      {[48,98,148,198,248].map((x) => <line key={x} x1={x} y1="22" x2={x} y2="132" />)}
    </g>
    <path className="preview-regression-line" d="M34 119 L254 30" fill="none" stroke="var(--color-accent)" strokeWidth="3" />
    {samples.map(([x,y], index) => <g key={x}>
      <line x1={x} y1={y} x2={x} y2={119 - (x - 34) * 0.405} stroke="var(--color-error)" strokeDasharray="2 2" opacity="0.6" />
      <circle cx={x} cy={y} r="4" fill="var(--color-primary)" />
      {index === 6 ? <circle cx={x} cy={y} r="8" fill="none" stroke="var(--color-primary)" opacity="0.45" /> : null}
    </g>)}
    <g transform="translate(282 28)">
      <path d="M0 90 C10 35 24 18 48 62 S62 106 70 22" fill="none" stroke="var(--color-error)" strokeWidth="2" />
      <path d="M8 106 L24 82 L40 88 L55 52" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
      {[8,24,40,55].map((x,index) => <circle key={x} cx={x} cy={[106,82,88,52][index]} r="3" fill="var(--color-primary)" />)}
    </g>
  </svg>;
}

function DecisionTreePreview() {
  const points = [[45,43,"a"],[71,61,"a"],[92,37,"a"],[118,83,"a"],[69,110,"a"],[154,45,"b"],[184,68,"b"],[211,38,"b"],[226,96,"b"],[168,112,"b"]] as const;
  return <svg viewBox="0 0 360 150" className="h-full w-full" aria-hidden="true">
    <rect x="25" y="20" width="220" height="110" fill="var(--color-primary-container)" opacity="0.7" />
    <rect x="132" y="20" width="113" height="110" fill="var(--color-accent-container)" opacity="0.82" />
    <rect x="25" y="91" width="107" height="39" fill="var(--color-accent-container)" opacity="0.58" />
    <line className="preview-tree-split" x1="132" x2="132" y1="20" y2="130" stroke="var(--color-accent)" strokeWidth="3" />
    <line x1="25" x2="132" y1="91" y2="91" stroke="var(--color-primary)" strokeWidth="2" />
    {points.map(([x,y,label]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" fill={label === "a" ? "var(--color-primary)" : "var(--color-error)"} stroke="var(--color-surface)" strokeWidth="1.5" />)}
    <g stroke="var(--color-outline-dark)" fill="var(--color-surface)">
      <line x1="298" y1="46" x2="275" y2="82" /><line x1="298" y1="46" x2="327" y2="82" />
      <rect x="276" y="27" width="44" height="22" /><rect x="255" y="82" width="39" height="22" fill="var(--color-primary-container)" /><rect x="310" y="82" width="39" height="22" fill="var(--color-accent-container)" />
    </g>
    <text x="298" y="42" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--color-on-surface)">x &lt; 4?</text>
    <text x="274" y="96" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--color-primary)">A</text>
    <text x="329" y="96" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--color-error)">B</text>
  </svg>;
}

export function ExhibitPreview({ slug }: { slug: string }) {
  const Preview = slug === "gradient-descent" ? GradientPreview
    : slug === "attention" ? AttentionPreview
      : slug === "overfitting" ? OverfittingPreview
        : slug === "k-means" ? KMeansPreview
          : slug === "token-sampling" ? TokenSamplingPreview
            : slug === "particle-swarm" ? ParticleSwarmPreview
              : slug === "cnn-feature-maps" ? CnnPreview
                : slug === "genetic-algorithm" ? GeneticPreview
                  : slug === "pca" ? PcaPreview
                    : slug === "backpropagation" ? BackpropPreview
                      : slug === "regression-boundary" ? RegressionPreview
                        : slug === "decision-tree" ? DecisionTreePreview
                          : slug === "kernel-trick" ? KernelPreview
                            : null;

  if (!Preview) return null;
  return (
    <div className={`exhibit-preview exhibit-preview-${slug} h-full w-full`}>
      <Preview />
    </div>
  );
}

export default function ExhibitCard({
  exhibit,
  index,
  className = "",
}: {
  exhibit: ExhibitSummary;
  index: number;
  className?: string;
}) {
  return (
    <Link
      href={`/visualisations/${exhibit.slug}`}
      className={`group grid h-full min-h-[350px] grid-rows-[auto_minmax(145px,1fr)_auto] overflow-hidden bg-surface transition-colors duration-300 hover:bg-surface-container-low focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-outline px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="font-headline text-2xl font-medium leading-none text-on-surface">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-mono text-[9px] uppercase leading-4 tracking-[0.11em] text-on-surface-variant">
            {exhibit.topic}
          </span>
        </div>
        <span className="shrink-0 text-right font-mono text-[9px] uppercase leading-4 tracking-[0.11em] text-on-surface-variant">
          {exhibit.difficulty}<br />{exhibit.renderer} · {exhibit.duration} min
        </span>
      </div>

      <div className="min-h-0 overflow-hidden border-b border-outline bg-background px-3 py-2 transition-colors group-hover:bg-primary-container/35">
        <div className="h-full w-full">
          <ExhibitPreview slug={exhibit.slug} />
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-primary">{exhibit.title}</p>
        <h2 className="mt-2 font-headline text-xl font-medium leading-tight text-on-surface transition-colors group-hover:text-primary lg:text-2xl">
          {exhibit.question}
        </h2>
        <p className="mt-2 text-sm leading-5 text-on-surface-variant">
          {exhibit.summary}
        </p>
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-outline pt-3 text-sm">
          <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-on-surface-variant">
            Direct manipulation
          </span>
          <span className="inline-flex items-center gap-2 font-medium text-primary">
            Open <span className="inline-block transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
