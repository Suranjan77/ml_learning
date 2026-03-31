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

// Brutalist Palette
const COLORS = {
  bg: "#121212",
  grid: "#333333",
  border: "#E2E8F0",
  pink: "#FF3366",
  cyan: "#00FFFF",
  yellow: "#FFEA00",
  green: "#00E676",
  muted: "#64748B",
};

function VisualizationShell({
  title,
  subtitle,
  insight,
  legend,
  children,
}: VisualizationShellProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#121212] border-2 border-slate-200 shadow-[8px_8px_0px_0px_rgba(226,232,240,1)] font-sans">
      {/* Brutalist Grid Background */}
      <div className="absolute inset-0 z-0">
        <div className="h-full w-full bg-[linear-gradient(#222_2px,transparent_2px),linear-gradient(90deg,#222_2px,transparent_2px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 flex flex-col items-start justify-between border-b-2 border-slate-200 bg-[#121212] p-5 lg:flex-row lg:gap-8">
        <div className="flex-1">
          <div className="inline-block bg-slate-200 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black mb-3 border border-slate-200 shadow-[2px_2px_0px_0px_#FF3366]">
            Interactive Diagram
          </div>
          <h4 className="font-mono text-xl font-black uppercase tracking-tight text-white mb-2">
            {title}
          </h4>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-400">
            {subtitle}
          </p>
        </div>

        {legend && legend.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 lg:mt-0 lg:flex-col lg:items-end">
            {legend.map((item) => (
              <div
                key={item.label}
                className="inline-flex items-center gap-2 border-2 border-slate-700 bg-black px-3 py-1.5 text-xs font-bold uppercase text-white shadow-[2px_2px_0px_0px_#333]"
              >
                <span
                  className="h-3 w-3 border border-white"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 flex-1 p-4 sm:p-6">{children}</div>

      <div className="relative z-10 border-t-2 border-slate-200 bg-slate-200 px-5 py-4 text-sm font-medium leading-relaxed text-black">
        <span className="bg-black px-2 py-0.5 text-xs font-black uppercase tracking-widest text-[#FFEA00] mr-2">
          Key Insight
        </span>
        {insight}
      </div>
    </div>
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
        stroke={COLORS.border}
        strokeWidth="2"
      />
      <line
        x1="40"
        y1="190"
        x2="296"
        y2="190"
        stroke={COLORS.border}
        strokeWidth="2"
      />
      <text x="24" y="22" fill={COLORS.border} fontSize="12" fontFamily="monospace" fontWeight="bold">Y</text>
      <text x="296" y="208" fill={COLORS.border} fontSize="12" fontFamily="monospace" fontWeight="bold">X</text>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. LINEAR REGRESSION
// ─────────────────────────────────────────────────────────────
function LinearRegressionVisualization() {
  const points = [
    { x: 68, y: 152 }, { x: 96, y: 144 }, { x: 120, y: 122 },
    { x: 146, y: 118 }, { x: 176, y: 98 }, { x: 210, y: 92 },
    { x: 236, y: 78 }, { x: 262, y: 62 },
  ];
  const predictY = (x: number) => 178 - 0.45 * x;

  return (
    <VisualizationShell
      title="Fit a trend line through noisy data"
      subtitle="Linear regression summarizes a relationship with one rigid line that minimizes the total vertical distance to all observed points."
      insight="The dashed lines represent residual errors. The algorithm's only job is to adjust the line's slope and height to make those errors as small as possible."
      legend={[
        { label: "Observations", color: COLORS.cyan },
        { label: "Best-fit line", color: COLORS.pink },
        { label: "Residual error", color: COLORS.yellow },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
        <ScatterAxes />
        <line
          x1="52" y1={predictY(52)} x2="286" y2={predictY(286)}
          stroke={COLORS.pink} strokeWidth="4"
        />
        {points.map((point, index) => {
          const lineY = predictY(point.x);
          return (
            <g key={index}>
              <line
                x1={point.x} y1={point.y} x2={point.x} y2={lineY}
                stroke={COLORS.yellow} strokeWidth="2" strokeDasharray="4 4"
              />
              <rect
                x={point.x - 4} y={point.y - 4} width="8" height="8"
                fill={COLORS.cyan} stroke="#000" strokeWidth="2"
              />
            </g>
          );
        })}
        <rect x="56" y="32" width="130" height="34" fill="#000" border="2" stroke={COLORS.border} strokeWidth="2" />
        <text x="66" y="54" fill={COLORS.pink} fontSize="14" fontFamily="monospace" fontWeight="bold">Y = mx + b</text>
      </svg>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. LOGISTIC REGRESSION
// ─────────────────────────────────────────────────────────────
function LogisticRegressionVisualization() {
  const groupA = [[74, 154], [92, 138], [110, 150], [126, 126], [142, 136]];
  const groupB = [[184, 92], [206, 88], [220, 72], [240, 82], [254, 60]];

  return (
    <VisualizationShell
      title="Turn a raw score into a strict probability"
      subtitle="Logistic regression computes a linear score and forces it through a sigmoid curve, creating a strict percentage boundary between two classes."
      insight="The exact center of the curve represents 50% uncertainty—the mathematical decision boundary slicing the two groups."
      legend={[
        { label: "Class 0", color: COLORS.pink },
        { label: "Class 1", color: COLORS.cyan },
      ]}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <svg viewBox="0 0 320 220" className="h-full w-full border-2 border-slate-700 bg-black">
          <rect x="0" y="0" width="160" height="220" fill="rgba(255,51,102,0.15)" />
          <rect x="160" y="0" width="160" height="220" fill="rgba(0,255,255,0.15)" />
          <line x1="160" y1="0" x2="160" y2="220" stroke="#FFF" strokeWidth="4" strokeDasharray="8 8" />
          <ScatterAxes />
          {groupA.map(([x, y], i) => (
            <rect key={`a-${i}`} x={x - 5} y={y - 5} width="10" height="10" fill={COLORS.pink} />
          ))}
          {groupB.map(([x, y], i) => (
            <rect key={`b-${i}`} x={x - 5} y={y - 5} width="10" height="10" fill={COLORS.cyan} />
          ))}
        </svg>

        <svg viewBox="0 0 220 220" className="h-full w-full border-2 border-slate-700 bg-black">
          <line x1="28" y1="184" x2="194" y2="184" stroke={COLORS.border} strokeWidth="2" />
          <line x1="28" y1="28" x2="28" y2="184" stroke={COLORS.border} strokeWidth="2" />
          <path
            d="M36 170 L 80 170 L 110 106 L 140 42 L 184 42"
            fill="none" stroke={COLORS.yellow} strokeWidth="4"
          />
          <line x1="28" y1="106" x2="194" y2="106" stroke="#FFF" strokeWidth="2" strokeDasharray="4 4" />
          <text x="146" y="98" fill="#FFF" fontSize="12" fontFamily="monospace" fontWeight="bold">p=0.5</text>
          <text x="10" y="36" fill={COLORS.border} fontSize="12" fontFamily="monospace" fontWeight="bold">P</text>
        </svg>
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. K-NEAREST NEIGHBORS (KNN)
// ─────────────────────────────────────────────────────────────
function KnnVisualization() {
  const blue = [[84, 134], [100, 148], [116, 126], [132, 144]];
  const purple = [[186, 84], [204, 102], [222, 76], [238, 96]];
  const neighbors = [[132, 144], [186, 84], [204, 102]];

  return (
    <VisualizationShell
      title="Classify by checking the local neighborhood"
      subtitle="KNN skips training entirely. When a new point arrives, it simply draws a radius and takes a majority vote from the closest known data points."
      insight="The algorithm assumes the world is smooth: if you are surrounded by Class A, you are likely Class A."
      legend={[
        { label: "Class A", color: COLORS.cyan },
        { label: "Class B", color: COLORS.pink },
        { label: "Query", color: COLORS.yellow },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <ScatterAxes />
        {blue.map(([x, y], i) => (
          <rect key={`blue-${i}`} x={x - 5} y={y - 5} width="10" height="10" fill={COLORS.cyan} stroke="#000" strokeWidth="2" />
        ))}
        {purple.map(([x, y], i) => (
          <rect key={`purple-${i}`} x={x - 5} y={y - 5} width="10" height="10" fill={COLORS.pink} stroke="#000" strokeWidth="2" />
        ))}
        <rect x="168 - 44" y="118 - 44" width="88" height="88" fill="rgba(255,234,0,0.1)" stroke={COLORS.yellow} strokeWidth="2" strokeDasharray="8 8" />
        {neighbors.map(([x, y], i) => (
          <line key={`n-${i}`} x1="168" y1="118" x2={x} y2={y} stroke={COLORS.yellow} strokeWidth="3" />
        ))}
        <rect x="163" y="113" width="10" height="10" fill={COLORS.yellow} stroke="#000" strokeWidth="2" />
        <text x="180" y="112" fill={COLORS.yellow} fontSize="14" fontFamily="monospace" fontWeight="bold">QUERY</text>
        <text x="180" y="130" fill="#FFF" fontSize="12" fontFamily="monospace">K=3</text>
      </svg>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. SUPPORT VECTOR MACHINES (SVM)
// ─────────────────────────────────────────────────────────────
function SvmVisualization() {
  const left = [[84, 148], [98, 126], [116, 142], [136, 116]];
  const right = [[192, 88], [212, 68], [228, 92], [246, 72]];
  const support = [[136, 116], [176, 90], [192, 88]];

  return (
    <VisualizationShell
      title="Draw a boundary with the widest possible safety margin"
      subtitle="SVM doesn't just split the data; it finds the single dividing line that sits as far away as possible from the closest points of both classes."
      insight="Only the absolute edge cases (the support vectors) define the model. All other data points behind the lines are effectively ignored."
      legend={[
        { label: "Margin", color: COLORS.muted },
        { label: "Hyperplane", color: "#FFF" },
        { label: "Support Vector", color: COLORS.yellow },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <ScatterAxes />
        <line x1="112" y1="178" x2="228" y2="44" stroke={COLORS.muted} strokeWidth="3" strokeDasharray="8 8" />
        <line x1="136" y1="190" x2="252" y2="56" stroke="#FFF" strokeWidth="5" />
        <line x1="160" y1="202" x2="276" y2="68" stroke={COLORS.muted} strokeWidth="3" strokeDasharray="8 8" />

        {left.map(([x, y], i) => (
          <rect key={`l-${i}`} x={x - 5} y={y - 5} width="10" height="10" fill={COLORS.cyan} />
        ))}
        {right.map(([x, y], i) => (
          <rect key={`r-${i}`} x={x - 5} y={y - 5} width="10" height="10" fill={COLORS.pink} />
        ))}
        {support.map(([x, y], i) => (
          <rect key={`s-${i}`} x={x - 9} y={y - 9} width="18" height="18" fill="none" stroke={COLORS.yellow} strokeWidth="3" />
        ))}
      </svg>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. DECISION TREES
// ─────────────────────────────────────────────────────────────
function DecisionTreeVisualization() {
  return (
    <VisualizationShell
      title="Segment data via rigid rules"
      subtitle="Decision trees build an architectural flowchart. At each node, they slice the data using a strict mathematical rule until a final verdict is reached."
      insight="This creates rectangular, blocky decision boundaries. It is highly interpretable, but prone to creating overly specific, jagged rules."
      legend={[
        { label: "Logic Gate", color: COLORS.cyan },
        { label: "Terminal Leaf", color: COLORS.pink },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <line x1="160" y1="46" x2="102" y2="104" stroke="#FFF" strokeWidth="3" />
        <line x1="160" y1="46" x2="218" y2="104" stroke="#FFF" strokeWidth="3" />
        <line x1="102" y1="104" x2="74" y2="166" stroke="#FFF" strokeWidth="3" />
        <line x1="102" y1="104" x2="130" y2="166" stroke="#FFF" strokeWidth="3" />
        <line x1="218" y1="104" x2="190" y2="166" stroke="#FFF" strokeWidth="3" />
        <line x1="218" y1="104" x2="246" y2="166" stroke="#FFF" strokeWidth="3" />

        {[
          { x: 160, y: 40, text: "X > 10?" },
          { x: 102, y: 104, text: "Y < 5?" },
          { x: 218, y: 104, text: "Z = 1?" },
        ].map((node) => (
          <g key={node.text}>
            <rect x={node.x - 34} y={node.y - 14} width="68" height="28" fill="#000" stroke={COLORS.cyan} strokeWidth="3" />
            <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#FFF" fontSize="12" fontFamily="monospace" fontWeight="bold">{node.text}</text>
          </g>
        ))}

        {[
          { x: 74, y: 166, label: "A" }, { x: 130, y: 166, label: "B" },
          { x: 190, y: 166, label: "B" }, { x: 246, y: 166, label: "A" },
        ].map((leaf) => (
          <g key={`${leaf.x}-${leaf.label}`}>
            <rect x={leaf.x - 20} y={leaf.y - 14} width="40" height="28" fill={COLORS.pink} stroke="#000" strokeWidth="3" />
            <text x={leaf.x} y={leaf.y + 5} textAnchor="middle" fill="#000" fontSize="14" fontFamily="monospace" fontWeight="bold">{leaf.label}</text>
          </g>
        ))}
      </svg>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. RANDOM FOREST
// ─────────────────────────────────────────────────────────────
function RandomForestVisualization() {
  return (
    <VisualizationShell
      title="Create an ensemble mob to vote on reality"
      subtitle="Random forests deliberately train many flawed, highly restricted decision trees. By forcing them to look at different parts of the data, their collective vote cancels out individual errors."
      insight="A single tree memorizes the noise; a forest of trees averages the noise out into a robust signal."
      legend={[
        { label: "Weak Tree", color: COLORS.muted },
        { label: "Aggregated Vote", color: COLORS.green },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        {[60, 160, 260].map((x, index) => (
          <g key={x}>
            <rect x={x - 15} y="38" width="30" height="20" fill="none" stroke={COLORS.muted} strokeWidth="2" />
            <line x1={x} y1="58" x2={x - 20} y2="92" stroke={COLORS.muted} strokeWidth="2" />
            <line x1={x} y1="58" x2={x + 20} y2="92" stroke={COLORS.muted} strokeWidth="2" />

            <rect x={x - 30} y="92" width="20" height="15" fill={index === 1 ? COLORS.green : COLORS.muted} />
            <rect x={x + 10} y="92" width="20" height="15" fill={index === 0 ? COLORS.muted : COLORS.green} />
          </g>
        ))}

        <line x1="40" y1="150" x2="280" y2="150" stroke="#FFF" strokeWidth="4" />
        <polygon points="150,150 170,150 160,170" fill="#FFF" />

        <rect x="90" y="180" width="140" height="30" fill={COLORS.green} stroke="#000" strokeWidth="3" />
        <text x="160" y="200" textAnchor="middle" fill="#000" fontSize="14" fontFamily="monospace" fontWeight="bold">FINAL VOTE</text>
      </svg>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. K-MEANS CLUSTERING
// ─────────────────────────────────────────────────────────────
function KMeansVisualization() {
  const clusters = [
    { color: COLORS.cyan, centroid: [88, 126], points: [[62, 144], [76, 116], [94, 138], [108, 114]] },
    { color: COLORS.pink, centroid: [174, 88], points: [[152, 102], [168, 70], [186, 98], [198, 78]] },
    { color: COLORS.yellow, centroid: [248, 138], points: [[226, 152], [238, 124], [258, 154], [272, 132]] },
  ];

  return (
    <VisualizationShell
      title="Force data into competitive gravity wells"
      subtitle="K-means drops random center points. Points snap to the closest center. The centers then move to the middle of their newly acquired points. This repeats until territory is locked."
      insight="It creates rigid, geometric borders (Voronoi cells). It assumes clusters are perfectly round and evenly sized, which can fail on complex shapes."
      legend={[
        { label: "Centroid", color: "#FFF" },
        { label: "Territory", color: COLORS.muted },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <ScatterAxes />
        {/* Voronoi territories */}
        <path d="M40 24 L 132 24 L 132 190 L 40 190 Z" fill="rgba(0,255,255,0.1)" stroke={COLORS.cyan} strokeWidth="2" strokeDasharray="4 4" />
        <path d="M132 24 L 218 24 L 218 190 L 132 190 Z" fill="rgba(255,51,102,0.1)" stroke={COLORS.pink} strokeWidth="2" strokeDasharray="4 4" />
        <path d="M218 24 L 296 24 L 296 190 L 218 190 Z" fill="rgba(255,234,0,0.1)" stroke={COLORS.yellow} strokeWidth="2" strokeDasharray="4 4" />

        {clusters.map((cluster, i) => (
          <g key={i}>
            {cluster.points.map(([x, y], pi) => (
              <rect key={pi} x={x - 4} y={y - 4} width="8" height="8" fill={cluster.color} />
            ))}
            <polygon
              points={`${cluster.centroid[0]},${cluster.centroid[1] - 10} ${cluster.centroid[0] + 10},${cluster.centroid[1]} ${cluster.centroid[0]},${cluster.centroid[1] + 10} ${cluster.centroid[0] - 10},${cluster.centroid[1]}`}
              fill="#FFF" stroke="#000" strokeWidth="2"
            />
          </g>
        ))}
      </svg>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. NEURAL NETWORKS
// ─────────────────────────────────────────────────────────────
function NeuralNetworkVisualization() {
  const layers = [
    { x: 52, nodes: [52, 98, 144, 190], color: COLORS.cyan },
    { x: 126, nodes: [64, 98, 132, 166], color: COLORS.muted },
    { x: 198, nodes: [78, 116, 154], color: COLORS.muted },
    { x: 270, nodes: [100, 140], color: COLORS.pink },
  ];

  return (
    <VisualizationShell
      title="Warp and mangle space to separate targets"
      subtitle="Neural Networks stack layers of matrix multiplications (warping space) and activation functions (folding space) until impossible problems become linearly solvable."
      insight="The hidden layers literally learn a completely new coordinate system where the final classification is trivial."
      legend={[
        { label: "Input", color: COLORS.cyan },
        { label: "Hidden", color: COLORS.muted },
        { label: "Output", color: COLORS.pink },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        {layers.map((layer, i) =>
          layer.nodes.map((y) =>
            i < layers.length - 1
              ? layers[i + 1].nodes.map((nextY, ni) => (
                <line key={`${i}-${y}-${ni}`} x1={layer.x} y1={y} x2={layers[i + 1].x} y2={nextY} stroke="#333" strokeWidth="2" />
              ))
              : null
          )
        )}
        {layers.map((layer) => (
          <g key={layer.x}>
            {layer.nodes.map((y, i) => (
              <rect key={i} x={layer.x - 8} y={y - 8} width="16" height="16" fill={layer.color} stroke="#000" strokeWidth="2" />
            ))}
          </g>
        ))}
      </svg>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 9. MAXIMUM LIKELIHOOD ESTIMATION (MLE) - *NEW*
// ─────────────────────────────────────────────────────────────
function MaximumLikelihoodVisualization() {
  return (
    <VisualizationShell
      title="Shift the mathematical truth to fit reality"
      subtitle="Maximum Likelihood Estimation slides and stretches a probability distribution until the data we actually observed sits squarely at the highest possible probability."
      insight="We assume a shape (like a bell curve). MLE is the brute-force search for the exact center and width that makes our data look completely unsurprising."
      legend={[
        { label: "Fixed Data", color: COLORS.yellow },
        { label: "Fitted Model", color: COLORS.pink },
        { label: "Likelihood", color: COLORS.cyan },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <line x1="20" y1="180" x2="300" y2="180" stroke={COLORS.border} strokeWidth="4" />

        {/* Poor fit curve (ghosted) */}
        <path d="M 20 180 Q 70 180 100 80 Q 130 180 180 180" fill="none" stroke="#444" strokeWidth="2" strokeDasharray="4 4" />

        {/* MLE Best fit curve */}
        <path d="M 100 180 Q 160 180 200 40 Q 240 180 300 180" fill="rgba(255,51,102,0.1)" stroke={COLORS.pink} strokeWidth="4" />

        {/* Data points & Likelihood drops */}
        {[
          { x: 170, y: 80 }, { x: 190, y: 46 }, { x: 200, y: 40 }, { x: 215, y: 58 }, { x: 230, y: 110 }
        ].map((pt, i) => (
          <g key={i}>
            <line x1={pt.x} y1={180} x2={pt.x} y2={pt.y} stroke={COLORS.cyan} strokeWidth="3" />
            <rect x={pt.x - 6} y={174} width="12" height="12" fill={COLORS.yellow} stroke="#000" strokeWidth="2" />
          </g>
        ))}

        <text x="200" y="25" fill={COLORS.pink} fontSize="14" fontFamily="monospace" fontWeight="bold" textAnchor="middle">MAX LIKELIHOOD</text>
      </svg>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 10. BAYESIAN INFERENCE - *NEW*
// ─────────────────────────────────────────────────────────────
function BayesianVisualization() {
  return (
    <VisualizationShell
      title="Update your beliefs with hard evidence"
      subtitle="Bayesian logic refuses to look at data in a vacuum. It forces you to state an initial belief (Prior), measures the new evidence (Likelihood), and computes a mathematically sound compromise (Posterior)."
      insight="If your prior belief is incredibly strong, it takes massive amounts of contrary data to shift your posterior. The model inherently protects against jumping to conclusions."
      legend={[
        { label: "Prior (Belief)", color: COLORS.yellow },
        { label: "Likelihood (Data)", color: COLORS.cyan },
        { label: "Posterior (Truth)", color: COLORS.pink },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <line x1="20" y1="180" x2="300" y2="180" stroke={COLORS.border} strokeWidth="4" />

        {/* Prior (Wide, Yellow) */}
        <path d="M 40 180 Q 120 180 120 100 Q 120 180 200 180" fill="none" stroke={COLORS.yellow} strokeWidth="3" strokeDasharray="6 6" />
        <text x="120" y="85" fill={COLORS.yellow} fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">PRIOR</text>

        {/* Likelihood (Tall, Cyan, Shifted right) */}
        <path d="M 160 180 Q 220 180 220 40 Q 220 180 280 180" fill="none" stroke={COLORS.cyan} strokeWidth="3" strokeDasharray="6 6" />
        <text x="220" y="25" fill={COLORS.cyan} fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">DATA</text>

        {/* Posterior (Intermediate, Pink, Solid) */}
        <path d="M 100 180 Q 180 180 180 50 Q 180 180 260 180" fill="rgba(255,51,102,0.15)" stroke={COLORS.pink} strokeWidth="5" />
        <rect x="150" y="55" width="60" height="24" fill={COLORS.pink} stroke="#000" strokeWidth="2" />
        <text x="180" y="72" fill="#000" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">UPDATED</text>

        {/* Shift Arrow */}
        <line x1="135" y1="120" x2="160" y2="105" stroke="#FFF" strokeWidth="3" markerEnd="url(#bayes_arrow)" />
        <defs>
          <marker id="bayes_arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <polygon points="0,0 10,5 0,10" fill="#FFF" />
          </marker>
        </defs>
      </svg>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 11. DEFAULT VISUALIZATION (Brutalist Fallback)
// ─────────────────────────────────────────────────────────────
function DefaultVisualization() {
  return (
    <VisualizationShell
      title="Deconstruct the algorithm's mechanical reality"
      subtitle="Every algorithm is simply a machine designed to force data into a specific structural paradigm—be it rules, distances, or mathematical boundaries."
      insight="Stop looking at the math as magic. Look at the geometry it creates. That geometry tells you exactly when and how the algorithm will spectacularly fail."
    >
      <div className="grid h-full gap-4 md:grid-cols-3">
        {[
          { title: "REPRESENT", text: "Transform raw chaotic inputs into rigid vector geometry.", color: "bg-[#00FFFF]" },
          { title: "FRACTURE", text: "Violently split the space using boundaries, planes, or rules.", color: "bg-[#FF3366]" },
          { title: "PROJECT", text: "Force unseen future data into this exact same rigid structure.", color: "bg-[#FFEA00]" },
        ].map((card) => (
          <div key={card.title} className="border-4 border-slate-700 bg-black p-5 shadow-[4px_4px_0px_0px_#333]">
            <div className={`mb-4 inline-block px-3 py-1 text-sm font-black text-black border-2 border-black ${card.color}`}>
              {card.title}
            </div>
            <p className="text-sm font-medium leading-relaxed text-white">{card.text}</p>
          </div>
        ))}
      </div>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// FOUNDATION: CALCULUS
// ─────────────────────────────────────────────────────────────
function CalculusVisualization() {
  return (
    <VisualizationShell
      title="Navigate the error landscape by following the slope"
      subtitle="Calculus computes the exact local steepness (gradient) of the error landscape. Optimization (like Gradient Descent) takes steps directly opposite to that steepest vector."
      insight="Backpropagation is just the chain rule applied backwards, computing this slope across millions of parameters simultaneously."
      legend={[
        { label: "Loss Landscape", color: "#FFF" },
        { label: "Descent Steps", color: COLORS.cyan },
        { label: "Gradient Tangent", color: COLORS.pink },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        {/* Axes */}
        <line x1="30" y1="20" x2="30" y2="190" stroke={COLORS.border} strokeWidth="2" />
        <line x1="30" y1="190" x2="300" y2="190" stroke={COLORS.border} strokeWidth="2" />
        <text x="16" y="24" fill={COLORS.border} fontSize="12" fontFamily="monospace" fontWeight="bold">L</text>
        <text x="296" y="204" fill={COLORS.border} fontSize="12" fontFamily="monospace" fontWeight="bold">W</text>

        {/* Parabolic Loss Curve - Stark */}
        <path d="M 40 40 Q 160 220 280 40" fill="none" stroke="#FFF" strokeWidth="4" />

        {/* Tangent lines */}
        <line x1="45" y1="20" x2="115" y2="150" stroke={COLORS.pink} strokeWidth="2" strokeDasharray="4 4" />
        <line x1="90" y1="95" x2="160" y2="155" stroke={COLORS.pink} strokeWidth="2" strokeDasharray="4 4" />

        {/* Gradient Steps */}
        <rect x="76" y="81" width="8" height="8" fill={COLORS.cyan} stroke="#000" strokeWidth="2" />
        <line x1="84" y1="90" x2="115" y2="119" stroke={COLORS.cyan} strokeWidth="3" markerEnd="url(#arrow_calc)" />
        <rect x="121" y="121" width="8" height="8" fill={COLORS.cyan} stroke="#000" strokeWidth="2" />
        <line x1="129" y1="128" x2="150" y2="141" stroke={COLORS.cyan} strokeWidth="3" markerEnd="url(#arrow_calc)" />
        <rect x="156" y="141" width="8" height="8" fill="#FFF" stroke="#000" strokeWidth="2" />

        <defs>
          <marker id="arrow_calc" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <polygon points="0,0 10,5 0,10" fill={COLORS.cyan} />
          </marker>
        </defs>

        <rect x="100" y="165" width="120" height="24" fill={COLORS.pink} stroke="#000" strokeWidth="2" />
        <text x="160" y="181" fill="#000" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">MINIMUM LOSS</text>
      </svg>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// FOUNDATION: LINEAR ALGEBRA
// ─────────────────────────────────────────────────────────────
function LinearAlgebraVisualization() {
  return (
    <VisualizationShell
      title="Morph and rotate the fabric of data"
      subtitle="Matrices are transformation engines. Multiplying data vectors by a weight matrix fundamentally skews, rotates, or squashes the entire spatial coordinate system."
      insight="Training a neural network is essentially searching for the exact sequence of spatial warps that perfectly untangles target classes."
      legend={[
        { label: "Original Grid", color: COLORS.muted },
        { label: "Warped Space", color: COLORS.cyan },
        { label: "Data Vector", color: COLORS.pink },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        {/* Original Grid */}
        <g stroke={COLORS.muted} strokeWidth="2" strokeDasharray="4 4">
          <line x1="160" y1="20" x2="160" y2="200" />
          <line x1="160" y1="110" x2="300" y2="110" />
          <line x1="20" y1="110" x2="160" y2="110" />
        </g>

        {/* Skewed Grid (Transformed) */}
        <g stroke={COLORS.cyan} strokeWidth="2">
          <line x1="100" y1="20" x2="220" y2="200" />
          <line x1="20" y1="140" x2="300" y2="80" />
          <line x1="60" y1="80" x2="180" y2="260" strokeOpacity="0.4" />
          <line x1="60" y1="130" x2="340" y2="70" strokeOpacity="0.4" />
        </g>

        {/* Transformed Basis Vectors */}
        <line x1="160" y1="110" x2="120" y2="50" stroke={COLORS.yellow} strokeWidth="4" markerEnd="url(#arrow_yellow)" />
        <line x1="160" y1="110" x2="250" y2="90" stroke={COLORS.pink} strokeWidth="4" markerEnd="url(#arrow_pink)" />

        <rect x="220" y="60" width="50" height="24" fill={COLORS.pink} stroke="#000" strokeWidth="2" />
        <text x="245" y="76" fill="#000" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">T(v)</text>

        <defs>
          <marker id="arrow_pink" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto">
            <polygon points="0,0 10,5 0,10" fill={COLORS.pink} />
          </marker>
          <marker id="arrow_yellow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto">
            <polygon points="0,0 10,5 0,10" fill={COLORS.yellow} />
          </marker>
        </defs>
      </svg>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// FOUNDATION: PROBABILITY THEORY
// ─────────────────────────────────────────────────────────────
function ProbabilityTheoryVisualization() {
  return (
    <VisualizationShell
      title="Quantify uncertainty and bound the noise"
      subtitle="Probability models assume data springs from mathematical distributions. Using variance and expectations prevents algorithms from falsely memorizing chaotic noise."
      insight="A standard deviation formally maps the boundaries of uncertainty, ensuring models output confidence limits rather than rigid guesses."
      legend={[
        { label: "Variance Bounds", color: COLORS.cyan },
        { label: "Target Distribution", color: COLORS.pink },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <line x1="30" y1="190" x2="300" y2="190" stroke={COLORS.border} strokeWidth="4" />

        {/* Harsh Hatched/Solid Variance Area */}
        <rect x="110" y="40" width="100" height="150" fill="rgba(0,255,255,0.1)" stroke={COLORS.cyan} strokeWidth="2" strokeDasharray="4 4" />

        {/* Gaussian Curve - Converted to brutalist straight lines for effect */}
        <path d="M 30 190 L 90 190 L 110 130 L 160 40 L 210 130 L 230 190 L 300 190" fill="none" stroke={COLORS.pink} strokeWidth="4" />

        {/* Center Mean */}
        <line x1="160" y1="40" x2="160" y2="190" stroke="#FFF" strokeWidth="3" />

        <rect x="150" y="20" width="20" height="20" fill="#FFF" stroke="#000" strokeWidth="2" />
        <text x="160" y="34" fill="#000" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">μ</text>

        {/* Standard Deviations */}
        <line x1="110" y1="150" x2="160" y2="150" stroke={COLORS.cyan} strokeWidth="2" markerStart="url(#arrow_prob_rev)" markerEnd="url(#arrow_prob)" />
        <rect x="120" y="140" width="30" height="20" fill={COLORS.cyan} stroke="#000" strokeWidth="2" />
        <text x="135" y="154" fill="#000" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">-1σ</text>

        <line x1="160" y1="150" x2="210" y2="150" stroke={COLORS.cyan} strokeWidth="2" markerStart="url(#arrow_prob_rev)" markerEnd="url(#arrow_prob)" />
        <rect x="170" y="140" width="30" height="20" fill={COLORS.cyan} stroke="#000" strokeWidth="2" />
        <text x="185" y="154" fill="#000" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">+1σ</text>

        <defs>
          <marker id="arrow_prob" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto">
            <polygon points="0,0 10,5 0,10" fill={COLORS.cyan} />
          </marker>
          <marker id="arrow_prob_rev" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
            <polygon points="0,0 10,5 0,10" fill={COLORS.cyan} />
          </marker>
        </defs>
      </svg>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// MODEL: PRINCIPAL COMPONENT ANALYSIS (PCA)
// ─────────────────────────────────────────────────────────────
function PcaVisualization() {
  return (
    <VisualizationShell
      title="Rotate reality to find the strongest signal"
      subtitle="PCA abandons the original X/Y axes and creates a new coordinate system aligned with the directions where the data varies the most."
      insight="The first component (PC1) slices through the widest spread of data. The rest capture whatever variance is left over."
      legend={[
        { label: "Data points", color: COLORS.cyan },
        { label: "PC1 (Max Variance)", color: COLORS.pink },
        { label: "PC2 (Orthogonal)", color: COLORS.yellow },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full">
        <ScatterAxes />
        {/* Rotated bounding box representing variance instead of a soft ellipse */}
        <rect x="76" y="76" width="184" height="68" transform="rotate(-28 168 110)" fill="rgba(0,255,255,0.05)" stroke={COLORS.cyan} strokeWidth="2" strokeDasharray="4 4" />

        {/* Data points (Squares) */}
        {[[96, 142], [112, 130], [126, 124], [142, 112], [160, 106], [176, 98], [194, 86], [216, 78], [234, 70]].map(([x, y], index) => (
          <rect key={index} x={x - 4} y={y - 4} width="8" height="8" fill={COLORS.cyan} stroke="#000" strokeWidth="2" />
        ))}

        {/* PC1 */}
        <line x1="78" y1="158" x2="254" y2="58" stroke={COLORS.pink} strokeWidth="4" />
        {/* PC2 */}
        <line x1="146" y1="52" x2="196" y2="172" stroke={COLORS.yellow} strokeWidth="3" strokeDasharray="6 6" />

        <rect x="236" y="34" width="36" height="20" fill={COLORS.pink} stroke="#000" strokeWidth="2" />
        <text x="254" y="48" fill="#000" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">PC1</text>

        <rect x="180" y="174" width="36" height="20" fill={COLORS.yellow} stroke="#000" strokeWidth="2" />
        <text x="198" y="188" fill="#000" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">PC2</text>
      </svg>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// 12. MARKOV CHAIN MONTE CARLO (MCMC)
// ─────────────────────────────────────────────────────────────
function McmcVisualization() {
  // Path data for the Markov Chain
  const chain = [
    [50, 170], [80, 140], [130, 150], [160, 100], [200, 110]
  ];
  const rejected = [250, 50]; // Proposed but rejected (went too far outside)

  return (
    <VisualizationShell
      title="Wander randomly to map the unknown"
      subtitle="MCMC explores complex probability landscapes by taking a random walk. Steps towards higher probability are accepted; steps away are mostly rejected, leaving a trail that maps the hidden structure."
      insight="Instead of calculating an impossible integral, MCMC builds a crowd of samples. Where the walker spends the most time is where the mathematical truth lies."
      legend={[
        { label: "Target Distribution", color: COLORS.cyan },
        { label: "Accepted Chain", color: COLORS.yellow },
        { label: "Rejected Step", color: COLORS.pink },
      ]}
    >
      <svg viewBox="0 0 320 220" className="h-full w-full overflow-visible">
        <ScatterAxes />

        {/* Target Distribution Contours (Brutalist style: stark, thick, jagged lines) */}
        {/* Outer low prob boundary */}
        <path
          d="M 100 100 L 140 30 L 260 60 L 280 150 L 200 190 Z"
          fill="none" stroke={COLORS.muted} strokeWidth="3" strokeDasharray="8 8"
        />
        {/* Inner high prob core */}
        <path
          d="M 150 100 L 180 70 L 230 90 L 220 140 L 170 130 Z"
          fill="rgba(0,255,255,0.1)" stroke={COLORS.cyan} strokeWidth="4"
        />
        <text x="195" y="110" fill={COLORS.cyan} fontSize="16" fontFamily="monospace" fontWeight="bold" textAnchor="middle">P(X)</text>

        {/* The Chain (Accepted Steps) */}
        <polyline
          points={chain.map(p => p.join(',')).join(' ')}
          fill="none"
          stroke={COLORS.yellow}
          strokeWidth="4"
        />

        {/* Accepted Nodes */}
        {chain.map(([x, y], i) => (
          <rect
            key={`node-${i}`}
            x={x - 6} y={y - 6}
            width="12" height="12"
            fill={i === chain.length - 1 ? "#000" : COLORS.yellow}
            stroke={COLORS.yellow} strokeWidth="3"
          />
        ))}

        {/* Rejected Step */}
        <line
          x1={chain[chain.length - 1][0]} y1={chain[chain.length - 1][1]}
          x2={rejected[0]} y2={rejected[1]}
          stroke={COLORS.pink} strokeWidth="4" strokeDasharray="6 6"
        />

        {/* Brutalist 'X' for rejected node */}
        <rect x={rejected[0] - 8} y={rejected[1] - 8} width="16" height="16" fill="none" stroke={COLORS.pink} strokeWidth="3" />
        <line x1={rejected[0] - 8} y1={rejected[1] - 8} x2={rejected[0] + 8} y2={rejected[1] + 8} stroke={COLORS.pink} strokeWidth="3" />
        <line x1={rejected[0] - 8} y1={rejected[1] + 8} x2={rejected[0] + 8} y2={rejected[1] - 8} stroke={COLORS.pink} strokeWidth="3" />

        {/* Annotations */}
        <rect x="215" y="20" width="76" height="22" fill={COLORS.pink} stroke="#000" strokeWidth="2" />
        <text x="253" y="35" fill="#000" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">REJECTED</text>

        <rect x={chain[chain.length - 1][0] - 35} y={chain[chain.length - 1][1] + 15} width="70" height="22" fill={COLORS.yellow} stroke="#000" strokeWidth="2" />
        <text x={chain[chain.length - 1][0]} y={chain[chain.length - 1][1] + 30} fill="#000" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">CURRENT</text>

      </svg>
    </VisualizationShell>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT EXPORT
// ─────────────────────────────────────────────────────────────
export default function AlgorithmVisualization({ algorithmId }: Props) {
  switch (algorithmId) {
    // ── Foundations ─────────────────────────
    case "calculus":
      return <CalculusVisualization />;
    case "linear-algebra":
      return <LinearAlgebraVisualization />;
    case "probability-theory":
      return <ProbabilityTheoryVisualization />;

    // ── Core Models ─────────────────────────
    case "linear-regression":
      return <LinearRegressionVisualization />;
    case "logistic-regression":
      return <LogisticRegressionVisualization />;
    case "maximum-likelihood":
      return <MaximumLikelihoodVisualization />;
    case "bayesian-inference":
      return <BayesianVisualization />;
    case "knn":
      return <KnnVisualization />;
    case "instance-based-trees":
      return <DecisionTreeVisualization />;
    case "support-vector-machines":
      return <SvmVisualization />;
    case "mcmc":
      return <McmcVisualization />;

    // ── Unsupervised & Ensembles ────────────
    case "clustering":
      return <KMeansVisualization />;
    case "dimensionality-reduction":
      return <PcaVisualization />;
    case "ensemble-learning":
      return <RandomForestVisualization />;

    // ── Deep Learning ───────────────────────
    case "neural-networks":
      return <NeuralNetworkVisualization />;

    // ── Fallback ────────────────────────────
    default:
      return <DefaultVisualization />;
  }
}