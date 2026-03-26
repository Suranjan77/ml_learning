import React from "react";

interface Props {
  algorithmId: string;
}

interface LegendItem {
  label: string;
  color: string;
}

interface VisualizationShellProps {
  title: string;
  subtitle: string;
  insight: string;
  legend?: LegendItem[];
  children: React.ReactNode;
}

function VisualizationShell({
  title,
  subtitle,
  insight,
  legend,
  children,
}: VisualizationShellProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
      <div className="absolute inset-0 opacity-30">
        <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>

      <div className="relative z-10 flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-slate-500">
            Intuition Diagram
          </p>
          <h4 className="mt-1 font-headline text-lg font-semibold tracking-tight text-slate-100">
            {title}
          </h4>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
            {subtitle}
          </p>
        </div>

        {legend && legend.length > 0 ? (
          <div className="hidden flex-wrap items-center gap-3 md:flex">
            {legend.map((item) => (
              <div
                key={item.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative z-10 flex-1 px-4 py-4 sm:px-5">{children}</div>

      <div className="relative z-10 border-t border-white/10 bg-white/[0.02] px-5 py-3 text-sm leading-6 text-slate-400">
        <span className="font-semibold text-slate-200">Key idea:</span>{" "}
        {insight}
      </div>
    </div>
  );
}

function AxisLabels() {
  return (
    <>
      <text
        x="20"
        y="22"
        fill="#64748b"
        fontSize="10"
        fontFamily="var(--font-mono)"
      >
        y
      </text>
      <text
        x="294"
        y="198"
        fill="#64748b"
        fontSize="10"
        fontFamily="var(--font-mono)"
      >
        x
      </text>
    </>
  );
}

function ScatterAxes() {
  return (
    <>
      <line
        x1="40"
        y1="24"
        x2="40"
        y2="190"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
      />
      <line
        x1="40"
        y1="190"
        x2="296"
        y2="190"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
      />
      {[72, 104, 136, 168, 200, 232, 264].map((x) => (
        <line
          key={`vx-${x}`}
          x1={x}
          y1="24"
          x2={x}
          y2="190"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}
      {[58, 92, 126, 160].map((y) => (
        <line
          key={`hy-${y}`}
          x1="40"
          y1={y}
          x2="296"
          y2={y}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}
      <AxisLabels />
    </>
  );
}

function LinearRegressionVisualization() {
  const points = [
    { x: 68, y: 152 },
    { x: 96, y: 144 },
    { x: 120, y: 122 },
    { x: 146, y: 118 },
    { x: 176, y: 98 },
    { x: 210, y: 92 },
    { x: 236, y: 78 },
    { x: 262, y: 62 },
  ];

  const predictY = (x: number) => 178 - 0.45 * x;

  return (
    <VisualizationShell
      title="Fit a trend line through noisy observations"
      subtitle="Linear regression summarizes a relationship with one line that best explains the average direction of the data."
      insight="The residuals show what the model misses; training tries to make those vertical errors as small as possible."
      legend={[
        { label: "Observed samples", color: "#7bd0ff" },
        { label: "Best-fit line", color: "#adc6ff" },
        { label: "Residual error", color: "#ffb4ab" },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <ScatterAxes />

        <line
          x1="52"
          y1={predictY(52)}
          x2="286"
          y2={predictY(286)}
          stroke="var(--color-primary)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <line
          x1="52"
          y1={predictY(52) - 10}
          x2="286"
          y2={predictY(286) - 10}
          stroke="rgba(173,198,255,0.24)"
          strokeWidth="2"
          strokeDasharray="6 6"
        />

        {points.map((point, index) => {
          const lineY = predictY(point.x);
          return (
            <g key={index}>
              <line
                x1={point.x}
                y1={point.y}
                x2={point.x}
                y2={lineY}
                stroke="var(--color-error)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.8"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="var(--color-tertiary)"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1"
              />
            </g>
          );
        })}

        <rect
          x="196"
          y="36"
          width="88"
          height="36"
          rx="10"
          fill="rgba(11,19,38,0.86)"
          stroke="rgba(255,255,255,0.08)"
        />
        <text
          x="208"
          y="52"
          fill="#cbd5e1"
          fontSize="11"
          fontFamily="var(--font-mono)"
        >
          y = mx + b
        </text>
        <text
          x="208"
          y="67"
          fill="#64748b"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          slope + intercept
        </text>
      </svg>
    </VisualizationShell>
  );
}

function LogisticRegressionVisualization() {
  const groupA = [
    [74, 154],
    [92, 138],
    [110, 150],
    [126, 126],
    [142, 136],
  ];
  const groupB = [
    [184, 92],
    [206, 88],
    [220, 72],
    [240, 82],
    [254, 60],
  ];

  return (
    <VisualizationShell
      title="Turn a score into a probability"
      subtitle="Logistic regression computes a weighted score and maps it through a sigmoid, creating a smooth probability transition between classes."
      insight="The decision boundary is where the predicted probability is around 50%, so nearby points are the most uncertain."
      legend={[
        { label: "Class 0", color: "#adc6ff" },
        { label: "Class 1", color: "#7bd0ff" },
        { label: "Decision boundary", color: "#f8fafc" },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <svg
          viewBox="0 0 320 220"
          className="h-full w-full rounded-xl border border-white/5 bg-black/10"
        >
          <defs>
            <linearGradient
              id="logisticSplit"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="rgba(173,198,255,0.22)" />
              <stop offset="45%" stopColor="rgba(173,198,255,0.12)" />
              <stop offset="55%" stopColor="rgba(123,208,255,0.12)" />
              <stop offset="100%" stopColor="rgba(123,208,255,0.22)" />
            </linearGradient>
          </defs>

          <rect
            x="40"
            y="24"
            width="256"
            height="166"
            fill="url(#logisticSplit)"
            rx="10"
          />
          <ScatterAxes />

          <path
            d="M150 190 C 162 160, 172 135, 184 108 C 194 86, 206 56, 218 24"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="3"
            strokeDasharray="6 6"
          />

          {groupA.map(([x, y], index) => (
            <circle
              key={`a-${index}`}
              cx={x}
              cy={y}
              r="5.5"
              fill="var(--color-primary)"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
            />
          ))}

          {groupB.map(([x, y], index) => (
            <circle
              key={`b-${index}`}
              cx={x}
              cy={y}
              r="5.5"
              fill="var(--color-tertiary)"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
            />
          ))}
        </svg>

        <svg
          viewBox="0 0 220 220"
          className="h-full w-full rounded-xl border border-white/5 bg-black/10"
        >
          <text
            x="22"
            y="28"
            fill="#cbd5e1"
            fontSize="12"
            fontFamily="var(--font-mono)"
          >
            sigmoid(score)
          </text>
          <line
            x1="28"
            y1="184"
            x2="194"
            y2="184"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.5"
          />
          <line
            x1="28"
            y1="28"
            x2="28"
            y2="184"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.5"
          />
          <path
            d="M36 170 C 70 170, 80 155, 98 122 C 112 94, 124 54, 184 42"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="28"
            y1="106"
            x2="194"
            y2="106"
            stroke="rgba(255,255,255,0.18)"
            strokeDasharray="6 6"
          />
          <text
            x="146"
            y="98"
            fill="#94a3b8"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            p = 0.5
          </text>
          <text
            x="174"
            y="200"
            fill="#64748b"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            score
          </text>
          <text
            x="8"
            y="36"
            fill="#64748b"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            p
          </text>
        </svg>
      </div>
    </VisualizationShell>
  );
}

function KnnVisualization() {
  const blue = [
    [84, 134],
    [100, 148],
    [116, 126],
    [132, 144],
  ];
  const purple = [
    [186, 84],
    [204, 102],
    [222, 76],
    [238, 96],
  ];
  const neighbors = [
    [132, 144],
    [186, 84],
    [204, 102],
  ];

  return (
    <VisualizationShell
      title="Classify by local neighborhood"
      subtitle="K-nearest neighbors delays learning until prediction time, then checks which labeled samples are closest to a new query point."
      insight="The algorithm assumes nearby points should behave similarly, so distance and local density drive the prediction."
      legend={[
        { label: "Known class A", color: "#adc6ff" },
        { label: "Known class B", color: "#7bd0ff" },
        { label: "Query point", color: "#f8fafc" },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <ScatterAxes />

        {blue.map(([x, y], index) => (
          <circle
            key={`blue-${index}`}
            cx={x}
            cy={y}
            r="5.5"
            fill="var(--color-primary)"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
          />
        ))}

        {purple.map(([x, y], index) => (
          <circle
            key={`purple-${index}`}
            cx={x}
            cy={y}
            r="5.5"
            fill="var(--color-tertiary)"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
          />
        ))}

        <circle
          cx="168"
          cy="118"
          r="44"
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.32)"
          strokeDasharray="6 6"
        />

        {neighbors.map(([x, y], index) => (
          <line
            key={`n-${index}`}
            x1="168"
            y1="118"
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.4)"
            strokeDasharray="4 4"
          />
        ))}

        <circle
          cx="168"
          cy="118"
          r="7"
          fill="#f8fafc"
          stroke="#0f172a"
          strokeWidth="2"
        />
        <text
          x="182"
          y="116"
          fill="#e2e8f0"
          fontSize="11"
          fontFamily="var(--font-mono)"
        >
          query
        </text>
        <text
          x="182"
          y="130"
          fill="#64748b"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          k = 3
        </text>
      </svg>
    </VisualizationShell>
  );
}

function SvmVisualization() {
  const left = [
    [84, 148],
    [98, 126],
    [116, 142],
    [136, 116],
  ];
  const right = [
    [192, 88],
    [212, 68],
    [228, 92],
    [246, 72],
  ];
  const support = [
    [136, 116],
    [176, 90],
    [192, 88],
  ];

  return (
    <VisualizationShell
      title="Separate classes with the widest possible margin"
      subtitle="A support vector machine looks for a boundary that not only separates the groups, but does so with the largest safety buffer."
      insight="Only a few edge cases — the support vectors — determine the final separator, which is why SVMs can be very robust."
      legend={[
        { label: "Support vectors", color: "#ffb4ab" },
        { label: "Margin", color: "#94a3b8" },
        { label: "Hyperplane", color: "#f8fafc" },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <ScatterAxes />

        <line
          x1="112"
          y1="178"
          x2="228"
          y2="44"
          stroke="rgba(255,255,255,0.3)"
          strokeDasharray="8 8"
          strokeWidth="2"
        />
        <line
          x1="136"
          y1="190"
          x2="252"
          y2="56"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="160"
          y1="202"
          x2="276"
          y2="68"
          stroke="rgba(255,255,255,0.3)"
          strokeDasharray="8 8"
          strokeWidth="2"
        />

        {left.map(([x, y], index) => (
          <circle
            key={`l-${index}`}
            cx={x}
            cy={y}
            r="5.5"
            fill="var(--color-primary)"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
          />
        ))}

        {right.map(([x, y], index) => (
          <circle
            key={`r-${index}`}
            cx={x}
            cy={y}
            r="5.5"
            fill="var(--color-tertiary)"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
          />
        ))}

        {support.map(([x, y], index) => (
          <circle
            key={`s-${index}`}
            cx={x}
            cy={y}
            r="8"
            fill="transparent"
            stroke="var(--color-error)"
            strokeWidth="2"
          />
        ))}

        <rect
          x="196"
          y="24"
          width="92"
          height="38"
          rx="10"
          fill="rgba(11,19,38,0.86)"
          stroke="rgba(255,255,255,0.08)"
        />
        <text
          x="208"
          y="41"
          fill="#cbd5e1"
          fontSize="11"
          fontFamily="var(--font-mono)"
        >
          maximize margin
        </text>
        <text
          x="208"
          y="56"
          fill="#64748b"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          support vectors define it
        </text>
      </svg>
    </VisualizationShell>
  );
}

function DecisionTreeVisualization() {
  return (
    <VisualizationShell
      title="Make decisions by asking one split question at a time"
      subtitle="Decision trees partition the feature space into regions using a sequence of interpretable if/else rules."
      insight="Each internal node asks a question, and every branch narrows the data until a leaf makes the final prediction."
      legend={[
        { label: "Split node", color: "#adc6ff" },
        { label: "Leaf prediction", color: "#7bd0ff" },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <line
          x1="160"
          y1="46"
          x2="102"
          y2="92"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2"
        />
        <line
          x1="160"
          y1="46"
          x2="218"
          y2="92"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2"
        />
        <line
          x1="102"
          y1="104"
          x2="74"
          y2="154"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="2"
        />
        <line
          x1="102"
          y1="104"
          x2="130"
          y2="154"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="2"
        />
        <line
          x1="218"
          y1="104"
          x2="190"
          y2="154"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="2"
        />
        <line
          x1="218"
          y1="104"
          x2="246"
          y2="154"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="2"
        />

        {[
          { x: 160, y: 36, text: "income > 70k?" },
          { x: 102, y: 104, text: "age > 30?" },
          { x: 218, y: 104, text: "visits > 5?" },
        ].map((node) => (
          <g key={node.text}>
            <rect
              x={node.x - 34}
              y={node.y - 14}
              width="68"
              height="28"
              rx="12"
              fill="rgba(173,198,255,0.16)"
              stroke="rgba(173,198,255,0.28)"
            />
            <text
              x={node.x}
              y={node.y + 4}
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="9.5"
              fontFamily="var(--font-mono)"
            >
              {node.text}
            </text>
          </g>
        ))}

        {[
          { x: 74, y: 166, label: "class A" },
          { x: 130, y: 166, label: "class B" },
          { x: 190, y: 166, label: "class B" },
          { x: 246, y: 166, label: "class A" },
        ].map((leaf) => (
          <g key={`${leaf.x}-${leaf.label}`}>
            <rect
              x={leaf.x - 28}
              y={leaf.y - 11}
              width="56"
              height="22"
              rx="11"
              fill="rgba(123,208,255,0.14)"
              stroke="rgba(123,208,255,0.24)"
            />
            <text
              x={leaf.x}
              y={leaf.y + 3}
              textAnchor="middle"
              fill="#dbeafe"
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {leaf.label}
            </text>
          </g>
        ))}

        <text
          x="82"
          y="84"
          fill="#64748b"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          no
        </text>
        <text
          x="226"
          y="84"
          fill="#64748b"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          yes
        </text>
      </svg>
    </VisualizationShell>
  );
}

function RandomForestVisualization() {
  return (
    <VisualizationShell
      title="Combine many trees into one stronger vote"
      subtitle="Random forests train multiple slightly different trees and aggregate their outputs to reduce variance and overfitting."
      insight="Each tree sees a different slice of the data, so the ensemble is less fragile than a single deep tree."
      legend={[
        { label: "Individual tree", color: "#adc6ff" },
        { label: "Ensemble vote", color: "#7bd0ff" },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        {[60, 160, 260].map((x, index) => (
          <g key={x}>
            <circle
              cx={x}
              cy="48"
              r="10"
              fill="rgba(173,198,255,0.18)"
              stroke="rgba(173,198,255,0.32)"
            />
            <line
              x1={x}
              y1="58"
              x2={x - 20}
              y2="92"
              stroke="rgba(255,255,255,0.18)"
            />
            <line
              x1={x}
              y1="58"
              x2={x + 20}
              y2="92"
              stroke="rgba(255,255,255,0.18)"
            />
            <circle
              cx={x - 20}
              cy="98"
              r="7"
              fill="rgba(123,208,255,0.18)"
              stroke="rgba(123,208,255,0.3)"
            />
            <circle
              cx={x + 20}
              cy="98"
              r="7"
              fill="rgba(123,208,255,0.18)"
              stroke="rgba(123,208,255,0.3)"
            />
            <line
              x1={x - 20}
              y1="105"
              x2={x - 30}
              y2="136"
              stroke="rgba(255,255,255,0.12)"
            />
            <line
              x1={x + 20}
              y1="105"
              x2={x + 30}
              y2="136"
              stroke="rgba(255,255,255,0.12)"
            />
            <rect
              x={x - 44}
              y="138"
              width="28"
              height="18"
              rx="9"
              fill={
                index === 1
                  ? "rgba(123,208,255,0.18)"
                  : "rgba(173,198,255,0.18)"
              }
              stroke="rgba(255,255,255,0.14)"
            />
            <rect
              x={x + 16}
              y="138"
              width="28"
              height="18"
              rx="9"
              fill={
                index === 0
                  ? "rgba(173,198,255,0.18)"
                  : "rgba(123,208,255,0.18)"
              }
              stroke="rgba(255,255,255,0.14)"
            />
          </g>
        ))}

        <line
          x1="60"
          y1="178"
          x2="160"
          y2="178"
          stroke="rgba(255,255,255,0.18)"
          strokeDasharray="5 5"
        />
        <line
          x1="160"
          y1="178"
          x2="260"
          y2="178"
          stroke="rgba(255,255,255,0.18)"
          strokeDasharray="5 5"
        />
        <line
          x1="160"
          y1="178"
          x2="160"
          y2="196"
          stroke="rgba(255,255,255,0.18)"
        />

        <rect
          x="112"
          y="196"
          width="96"
          height="18"
          rx="9"
          fill="rgba(123,208,255,0.14)"
          stroke="rgba(123,208,255,0.26)"
        />
        <text
          x="160"
          y="208"
          textAnchor="middle"
          fill="#dbeafe"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          majority vote → class B
        </text>
      </svg>
    </VisualizationShell>
  );
}

function GradientBoostingVisualization() {
  return (
    <VisualizationShell
      title="Correct mistakes stage by stage"
      subtitle="Gradient boosting builds weak learners sequentially, where each new learner focuses on the residual errors left behind by the previous ones."
      insight="Instead of averaging many independent trees, boosting keeps asking: what errors remain, and how can the next model reduce them?"
      legend={[
        { label: "Current prediction", color: "#adc6ff" },
        { label: "Residual correction", color: "#ffb4ab" },
        { label: "Improved fit", color: "#7bd0ff" },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        {[
          { x: 26, y: 36, w: 78, h: 128, title: "Model 1", bars: [46, 62, 88] },
          {
            x: 122,
            y: 36,
            w: 78,
            h: 128,
            title: "Model 2",
            bars: [32, 46, 58],
          },
          {
            x: 218,
            y: 36,
            w: 78,
            h: 128,
            title: "Model 3",
            bars: [18, 30, 38],
          },
        ].map((panel, index) => (
          <g key={panel.title}>
            <rect
              x={panel.x}
              y={panel.y}
              width={panel.w}
              height={panel.h}
              rx="14"
              fill="rgba(255,255,255,0.03)"
              stroke="rgba(255,255,255,0.08)"
            />
            <text
              x={panel.x + 14}
              y={panel.y + 18}
              fill="#cbd5e1"
              fontSize="11"
              fontFamily="var(--font-mono)"
            >
              {panel.title}
            </text>

            {panel.bars.map((bar, barIndex) => (
              <g key={barIndex}>
                <rect
                  x={panel.x + 16}
                  y={panel.y + 34 + barIndex * 28}
                  width="14"
                  height={bar}
                  rx="7"
                  fill={
                    index === 2
                      ? "rgba(123,208,255,0.72)"
                      : "rgba(173,198,255,0.72)"
                  }
                />
                <rect
                  x={panel.x + 38}
                  y={panel.y + 34 + barIndex * 28 + Math.max(0, bar - 14)}
                  width="14"
                  height="14"
                  rx="7"
                  fill="rgba(255,180,171,0.78)"
                />
              </g>
            ))}
          </g>
        ))}

        <line
          x1="104"
          y1="100"
          x2="122"
          y2="100"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2"
        />
        <line
          x1="200"
          y1="100"
          x2="218"
          y2="100"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2"
        />
        <text
          x="108"
          y="92"
          fill="#64748b"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          fit residuals
        </text>
        <text
          x="204"
          y="92"
          fill="#64748b"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          fit residuals
        </text>

        <rect
          x="84"
          y="184"
          width="152"
          height="22"
          rx="11"
          fill="rgba(123,208,255,0.14)"
          stroke="rgba(123,208,255,0.24)"
        />
        <text
          x="160"
          y="198"
          textAnchor="middle"
          fill="#dbeafe"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          stage-wise additive model
        </text>
      </svg>
    </VisualizationShell>
  );
}

function NaiveBayesVisualization() {
  return (
    <VisualizationShell
      title="Combine independent evidence into a posterior probability"
      subtitle="Naive Bayes estimates how likely each feature is under each class, then multiplies that evidence with the class prior."
      insight="Even with a very strong independence assumption, combining several simple feature probabilities often works surprisingly well."
      legend={[
        { label: "Class A likelihood", color: "#adc6ff" },
        { label: "Class B likelihood", color: "#7bd0ff" },
        { label: "Posterior winner", color: "#f8fafc" },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <text
          x="30"
          y="28"
          fill="#cbd5e1"
          fontSize="12"
          fontFamily="var(--font-mono)"
        >
          feature likelihoods
        </text>

        <line
          x1="30"
          y1="164"
          x2="158"
          y2="164"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.5"
        />
        <line
          x1="30"
          y1="44"
          x2="30"
          y2="164"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.5"
        />

        <path
          d="M34 164 C 56 164, 62 112, 90 96 C 110 86, 128 102, 152 164"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M34 164 C 60 164, 88 148, 108 118 C 126 92, 142 90, 152 164"
          fill="none"
          stroke="var(--color-tertiary)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        <line
          x1="104"
          y1="44"
          x2="104"
          y2="164"
          stroke="rgba(255,255,255,0.14)"
          strokeDasharray="6 6"
        />
        <text
          x="84"
          y="38"
          fill="#94a3b8"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          observed value
        </text>

        <text
          x="188"
          y="28"
          fill="#cbd5e1"
          fontSize="12"
          fontFamily="var(--font-mono)"
        >
          posterior
        </text>

        <rect
          x="188"
          y="70"
          width="104"
          height="24"
          rx="12"
          fill="rgba(255,255,255,0.06)"
        />
        <rect
          x="188"
          y="70"
          width="42"
          height="24"
          rx="12"
          fill="rgba(173,198,255,0.72)"
        />
        <text
          x="196"
          y="86"
          fill="#0f172a"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          P(A|x)
        </text>

        <rect
          x="188"
          y="114"
          width="104"
          height="24"
          rx="12"
          fill="rgba(255,255,255,0.06)"
        />
        <rect
          x="188"
          y="114"
          width="62"
          height="24"
          rx="12"
          fill="rgba(123,208,255,0.72)"
        />
        <text
          x="196"
          y="130"
          fill="#0f172a"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          P(B|x)
        </text>

        <rect
          x="188"
          y="160"
          width="104"
          height="28"
          rx="14"
          fill="rgba(123,208,255,0.14)"
          stroke="rgba(123,208,255,0.24)"
        />
        <text
          x="240"
          y="178"
          textAnchor="middle"
          fill="#dbeafe"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          predict class B
        </text>
      </svg>
    </VisualizationShell>
  );
}

function KMeansVisualization() {
  const clusters = [
    {
      color: "rgba(173,198,255,0.18)",
      centroid: [88, 126],
      points: [
        [62, 144],
        [76, 116],
        [94, 138],
        [108, 114],
      ],
    },
    {
      color: "rgba(123,208,255,0.18)",
      centroid: [174, 88],
      points: [
        [152, 102],
        [168, 70],
        [186, 98],
        [198, 78],
      ],
    },
    {
      color: "rgba(208,188,255,0.18)",
      centroid: [248, 138],
      points: [
        [226, 152],
        [238, 124],
        [258, 154],
        [272, 132],
      ],
    },
  ];

  return (
    <VisualizationShell
      title="Assign each sample to the nearest centroid"
      subtitle="K-means alternates between two steps: assign points to the closest center, then move each center to the mean of its assigned cluster."
      insight="The centroids act like movable prototypes; when they stop shifting much, the clustering has stabilized."
      legend={[
        { label: "Cluster region", color: "#7bd0ff" },
        { label: "Centroid", color: "#f8fafc" },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <ScatterAxes />

        <rect
          x="40"
          y="24"
          width="92"
          height="166"
          rx="14"
          fill="rgba(173,198,255,0.08)"
        />
        <rect
          x="132"
          y="24"
          width="86"
          height="166"
          rx="14"
          fill="rgba(123,208,255,0.08)"
        />
        <rect
          x="218"
          y="24"
          width="78"
          height="166"
          rx="14"
          fill="rgba(208,188,255,0.08)"
        />

        {clusters.map((cluster, index) => (
          <g key={index}>
            {cluster.points.map(([x, y], pointIndex) => (
              <circle
                key={pointIndex}
                cx={x}
                cy={y}
                r="5"
                fill={
                  index === 0
                    ? "var(--color-primary)"
                    : index === 1
                      ? "var(--color-tertiary)"
                      : "var(--color-secondary)"
                }
                stroke="rgba(255,255,255,0.3)"
              />
            ))}
            <g>
              <circle
                cx={cluster.centroid[0]}
                cy={cluster.centroid[1]}
                r="11"
                fill="rgba(248,250,252,0.06)"
                stroke="#f8fafc"
                strokeWidth="2"
              />
              <line
                x1={cluster.centroid[0] - 6}
                y1={cluster.centroid[1]}
                x2={cluster.centroid[0] + 6}
                y2={cluster.centroid[1]}
                stroke="#f8fafc"
                strokeWidth="2"
              />
              <line
                x1={cluster.centroid[0]}
                y1={cluster.centroid[1] - 6}
                x2={cluster.centroid[0]}
                y2={cluster.centroid[1] + 6}
                stroke="#f8fafc"
                strokeWidth="2"
              />
            </g>
          </g>
        ))}
      </svg>
    </VisualizationShell>
  );
}

function DbscanVisualization() {
  const denseA = [
    [84, 138],
    [94, 126],
    [104, 142],
    [112, 122],
    [124, 134],
    [132, 118],
  ];
  const denseB = [
    [202, 88],
    [214, 100],
    [226, 82],
    [236, 96],
    [246, 78],
    [256, 92],
  ];
  const noise = [
    [56, 58],
    [160, 160],
    [278, 146],
  ];

  return (
    <VisualizationShell
      title="Find dense regions and mark sparse points as noise"
      subtitle="DBSCAN expands clusters from core points that have enough nearby neighbors within a chosen radius."
      insight="Unlike K-means, DBSCAN does not force every point into a cluster, which makes it useful when outliers matter."
      legend={[
        { label: "Dense cluster", color: "#7bd0ff" },
        { label: "Noise / outlier", color: "#ffb4ab" },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <ScatterAxes />

        <circle
          cx="108"
          cy="128"
          r="34"
          fill="rgba(173,198,255,0.10)"
          stroke="rgba(173,198,255,0.18)"
        />
        <circle
          cx="228"
          cy="90"
          r="34"
          fill="rgba(123,208,255,0.10)"
          stroke="rgba(123,208,255,0.18)"
        />

        {denseA.map(([x, y], index) => (
          <circle
            key={`a-${index}`}
            cx={x}
            cy={y}
            r="5"
            fill="var(--color-primary)"
            stroke="rgba(255,255,255,0.3)"
          />
        ))}

        {denseB.map(([x, y], index) => (
          <circle
            key={`b-${index}`}
            cx={x}
            cy={y}
            r="5"
            fill="var(--color-tertiary)"
            stroke="rgba(255,255,255,0.3)"
          />
        ))}

        {noise.map(([x, y], index) => (
          <g key={`n-${index}`}>
            <circle cx={x} cy={y} r="5.5" fill="var(--color-error)" />
            <line
              x1={x - 7}
              y1={y - 7}
              x2={x + 7}
              y2={y + 7}
              stroke="#0f172a"
              strokeWidth="1.5"
            />
          </g>
        ))}

        <circle
          cx="94"
          cy="126"
          r="22"
          fill="transparent"
          stroke="rgba(255,255,255,0.3)"
          strokeDasharray="5 5"
        />
        <text
          x="110"
          y="112"
          fill="#94a3b8"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          eps neighborhood
        </text>
      </svg>
    </VisualizationShell>
  );
}

function PcaVisualization() {
  return (
    <VisualizationShell
      title="Rotate the data to the directions of greatest variance"
      subtitle="Principal component analysis finds a new coordinate system whose axes explain as much spread in the data as possible."
      insight="The first component captures the strongest direction of variation, while later components explain what remains."
      legend={[
        { label: "Original data cloud", color: "#7bd0ff" },
        { label: "PC1", color: "#adc6ff" },
        { label: "PC2", color: "#d0bcff" },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <ScatterAxes />

        <ellipse
          cx="168"
          cy="110"
          rx="92"
          ry="34"
          transform="rotate(-28 168 110)"
          fill="rgba(123,208,255,0.10)"
          stroke="rgba(123,208,255,0.22)"
          strokeWidth="2"
        />

        {[
          [96, 142],
          [112, 130],
          [126, 124],
          [142, 112],
          [160, 106],
          [176, 98],
          [194, 86],
          [216, 78],
          [234, 70],
        ].map(([x, y], index) => (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="4.5"
            fill="var(--color-tertiary)"
            stroke="rgba(255,255,255,0.28)"
          />
        ))}

        <line
          x1="78"
          y1="158"
          x2="254"
          y2="58"
          stroke="var(--color-primary)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="146"
          y1="52"
          x2="196"
          y2="172"
          stroke="var(--color-secondary)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <text
          x="246"
          y="54"
          fill="#dbeafe"
          fontSize="11"
          fontFamily="var(--font-mono)"
        >
          PC1
        </text>
        <text
          x="202"
          y="176"
          fill="#e9ddff"
          fontSize="11"
          fontFamily="var(--font-mono)"
        >
          PC2
        </text>
      </svg>
    </VisualizationShell>
  );
}

function NeuralNetworkVisualization() {
  const layers = [
    { x: 52, nodes: [52, 98, 144, 190], color: "var(--color-primary)" },
    { x: 126, nodes: [64, 98, 132, 166], color: "var(--color-secondary)" },
    { x: 198, nodes: [78, 116, 154], color: "var(--color-secondary)" },
    { x: 270, nodes: [100, 140], color: "var(--color-tertiary)" },
  ];

  return (
    <VisualizationShell
      title="Transform inputs through hidden layers"
      subtitle="A multilayer perceptron repeatedly mixes features and applies non-linear activations so it can bend simple inputs into flexible decision regions."
      insight="Each hidden layer re-expresses the data; together they can represent patterns that a single straight boundary cannot."
      legend={[
        { label: "Input layer", color: "#adc6ff" },
        { label: "Hidden layers", color: "#d0bcff" },
        { label: "Output layer", color: "#7bd0ff" },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        {layers.map((layer, layerIndex) =>
          layer.nodes.map((y) =>
            layerIndex < layers.length - 1
              ? layers[layerIndex + 1].nodes.map((nextY, nextIndex) => (
                  <line
                    key={`${layerIndex}-${y}-${nextIndex}-${nextY}`}
                    x1={layer.x}
                    y1={y}
                    x2={layers[layerIndex + 1].x}
                    y2={nextY}
                    stroke="rgba(173,198,255,0.12)"
                    strokeWidth="1.2"
                  />
                ))
              : null,
          ),
        )}

        {layers.map((layer, layerIndex) => (
          <g key={layer.x}>
            {layer.nodes.map((y, index) => (
              <circle
                key={index}
                cx={layer.x}
                cy={y}
                r="9"
                fill={layer.color}
                fillOpacity={
                  layerIndex === 0
                    ? 0.85
                    : layerIndex === layers.length - 1
                      ? 0.85
                      : 0.6
                }
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1"
              />
            ))}
          </g>
        ))}

        <text
          x="36"
          y="28"
          fill="#94a3b8"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          inputs
        </text>
        <text
          x="108"
          y="28"
          fill="#94a3b8"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          hidden
        </text>
        <text
          x="182"
          y="28"
          fill="#94a3b8"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          hidden
        </text>
        <text
          x="250"
          y="28"
          fill="#94a3b8"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          outputs
        </text>

        <rect
          x="28"
          y="182"
          width="264"
          height="20"
          rx="10"
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.08)"
        />
        <path
          d="M40 192 C 78 170, 102 206, 132 190 C 160 174, 178 142, 214 158 C 244 172, 258 130, 282 120"
          fill="none"
          stroke="var(--color-tertiary)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </VisualizationShell>
  );
}

function CnnVisualization() {
  return (
    <VisualizationShell
      title="Detect local visual patterns and build them into objects"
      subtitle="CNNs reuse small filters across the image, first finding edges and textures, then combining them into higher-level visual concepts."
      insight="Weight sharing makes convolution efficient: the same filter can detect a pattern anywhere in the image."
      legend={[
        { label: "Input image", color: "#adc6ff" },
        { label: "Feature maps", color: "#d0bcff" },
        { label: "Classifier", color: "#7bd0ff" },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <rect
          x="22"
          y="58"
          width="68"
          height="68"
          rx="14"
          fill="rgba(173,198,255,0.10)"
          stroke="rgba(173,198,255,0.24)"
        />
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={34 + col * 16}
              y={70 + row * 16}
              width="10"
              height="10"
              rx="2"
              fill={
                row === 1 && col === 1
                  ? "var(--color-primary)"
                  : "rgba(255,255,255,0.18)"
              }
            />
          )),
        )}

        <rect
          x="58"
          y="94"
          width="22"
          height="22"
          rx="4"
          fill="transparent"
          stroke="#f8fafc"
          strokeWidth="1.5"
        />

        <line
          x1="98"
          y1="92"
          x2="130"
          y2="92"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
        />
        <line
          x1="98"
          y1="110"
          x2="130"
          y2="110"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
        />

        {[0, 1, 2].map((index) => (
          <rect
            key={index}
            x={132 + index * 8}
            y={58 + index * 8}
            width="52"
            height="52"
            rx="12"
            fill="rgba(208,188,255,0.10)"
            stroke="rgba(208,188,255,0.24)"
          />
        ))}

        {[0, 1, 2].map((index) => (
          <rect
            key={`pool-${index}`}
            x={198 + index * 6}
            y={74 + index * 6}
            width="36"
            height="36"
            rx="10"
            fill="rgba(123,208,255,0.10)"
            stroke="rgba(123,208,255,0.24)"
          />
        ))}

        <line
          x1="238"
          y1="100"
          x2="264"
          y2="100"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
        />

        {[
          { x: 276, y: 80 },
          { x: 276, y: 100 },
          { x: 276, y: 120 },
        ].map((node, index) => (
          <circle
            key={index}
            cx={node.x}
            cy={node.y}
            r="8"
            fill="var(--color-tertiary)"
            fillOpacity="0.8"
            stroke="rgba(255,255,255,0.25)"
          />
        ))}

        <text
          x="24"
          y="146"
          fill="#94a3b8"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          image
        </text>
        <text
          x="134"
          y="146"
          fill="#94a3b8"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          conv filters
        </text>
        <text
          x="198"
          y="146"
          fill="#94a3b8"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          pooled maps
        </text>
        <text
          x="254"
          y="146"
          fill="#94a3b8"
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          logits
        </text>
      </svg>
    </VisualizationShell>
  );
}

function RnnVisualization() {
  return (
    <VisualizationShell
      title="Carry context forward through a sequence"
      subtitle="RNNs process one time step at a time, updating a hidden state that summarizes what has happened so far."
      insight="The hidden state acts like short-term memory, letting earlier tokens influence the interpretation of later ones."
      legend={[
        { label: "Input token", color: "#adc6ff" },
        { label: "Hidden state", color: "#d0bcff" },
        { label: "Output", color: "#7bd0ff" },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        {[
          { x: 44, token: "x₁", state: "h₁", out: "y₁" },
          { x: 118, token: "x₂", state: "h₂", out: "y₂" },
          { x: 192, token: "x₃", state: "h₃", out: "y₃" },
          { x: 266, token: "x₄", state: "h₄", out: "y₄" },
        ].map((step, index) => (
          <g key={step.token}>
            <rect
              x={step.x - 18}
              y="148"
              width="36"
              height="24"
              rx="12"
              fill="rgba(173,198,255,0.14)"
              stroke="rgba(173,198,255,0.22)"
            />
            <text
              x={step.x}
              y="163"
              textAnchor="middle"
              fill="#dbeafe"
              fontSize="11"
              fontFamily="var(--font-mono)"
            >
              {step.token}
            </text>

            <rect
              x={step.x - 22}
              y="82"
              width="44"
              height="36"
              rx="14"
              fill="rgba(208,188,255,0.14)"
              stroke="rgba(208,188,255,0.24)"
            />
            <text
              x={step.x}
              y="104"
              textAnchor="middle"
              fill="#ede9fe"
              fontSize="11"
              fontFamily="var(--font-mono)"
            >
              RNN
            </text>

            <rect
              x={step.x - 18}
              y="28"
              width="36"
              height="24"
              rx="12"
              fill="rgba(123,208,255,0.14)"
              stroke="rgba(123,208,255,0.22)"
            />
            <text
              x={step.x}
              y="43"
              textAnchor="middle"
              fill="#dbeafe"
              fontSize="11"
              fontFamily="var(--font-mono)"
            >
              {step.out}
            </text>

            <text
              x={step.x}
              y="70"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {step.state}
            </text>

            <line
              x1={step.x}
              y1="118"
              x2={step.x}
              y2="148"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.8"
            />
            <line
              x1={step.x}
              y1="82"
              x2={step.x}
              y2="52"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.8"
            />

            {index < 3 ? (
              <>
                <line
                  x1={step.x + 22}
                  y1="100"
                  x2={step.x + 52}
                  y2="100"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="2"
                />
                <polygon
                  points={`${step.x + 52},100 ${step.x + 44},96 ${step.x + 44},104`}
                  fill="rgba(255,255,255,0.5)"
                />
              </>
            ) : null}
          </g>
        ))}
      </svg>
    </VisualizationShell>
  );
}

function DefaultVisualization() {
  return (
    <VisualizationShell
      title="Map structure, uncertainty, and model behavior"
      subtitle="This diagram highlights how the algorithm organizes information, whether through boundaries, clusters, projections, or sequential transformations."
      insight="The most useful intuition is to ask what structure the algorithm assumes and what kind of signal it tries to preserve."
    >
      <div className="grid h-full gap-4 md:grid-cols-3">
        {[
          {
            title: "Represent",
            text: "Transform raw inputs into a useful internal structure.",
            color: "bg-primary/10 border-primary/20 text-primary",
          },
          {
            title: "Separate",
            text: "Create regions, scores, or distances that distinguish outcomes.",
            color: "bg-secondary/10 border-secondary/20 text-secondary",
          },
          {
            title: "Generalize",
            text: "Apply the learned structure to unseen examples.",
            color: "bg-tertiary/10 border-tertiary/20 text-tertiary",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${card.color}`}
            >
              {card.title}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-400">{card.text}</p>
          </div>
        ))}
      </div>
    </VisualizationShell>
  );
}

export default function AlgorithmVisualization({ algorithmId }: Props) {
  switch (algorithmId) {
    case "linear-regression":
      return <LinearRegressionVisualization />;
    case "logistic-regression":
      return <LogisticRegressionVisualization />;
    case "k-nearest-neighbors":
      return <KnnVisualization />;
    case "support-vector-machines":
      return <SvmVisualization />;
    case "decision-trees":
      return <DecisionTreeVisualization />;
    case "random-forests":
      return <RandomForestVisualization />;
    case "gradient-boosting-machines":
      return <GradientBoostingVisualization />;
    case "naive-bayes":
      return <NaiveBayesVisualization />;
    case "k-means":
      return <KMeansVisualization />;
    case "dbscan":
      return <DbscanVisualization />;
    case "principal-component-analysis":
      return <PcaVisualization />;
    case "neural-networks":
      return <NeuralNetworkVisualization />;
    case "convolutional-neural-networks":
      return <CnnVisualization />;
    case "recurrent-neural-networks":
      return <RnnVisualization />;
    default:
      return <DefaultVisualization />;
  }
}
