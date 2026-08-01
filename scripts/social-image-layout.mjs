export const socialCards = [
  { name: "home", topic: "Interactive machine learning visualisations", question: "Watch the mechanism change" },
  { name: "library", topic: "Visualisation library", question: "Explore by question, topic, or model" },
  { name: "methodology", topic: "Methodology and about", question: "Assumptions, accessibility, and privacy" },
  { name: "gradient-descent", topic: "Learning and optimisation", question: "Does taking a bigger step always get you to the bottom faster?" },
  { name: "overfitting", topic: "Generalisation", question: "When does a flexible model stop generalising?" },
  { name: "k-means", topic: "Unsupervised learning", question: "How does k-means decide where clusters belong?" },
  { name: "kernel-trick", topic: "Classical machine learning", question: "How can a feature map turn a circular boundary into a flat one?" },
  { name: "attention", topic: "Language models", question: "How does a self-attention head turn query-key similarity into weights?" },
  { name: "token-sampling", topic: "Language models", question: "How do temperature and truncation change what a language model writes?" },
  { name: "cnn-feature-maps", topic: "Deep learning", question: "How does a CNN turn pixels into features?" },
  { name: "particle-swarm", topic: "Evolutionary computation", question: "How can a swarm find an optimum without gradients?" },
  { name: "genetic-algorithm", topic: "Evolutionary computation", question: "How does evolution search without knowing a gradient?" },
  { name: "pca", topic: "Unsupervised learning", question: "How does PCA compress data without labels?" },
  { name: "backpropagation", topic: "Deep learning", question: "How does error travel backward through a neural network?" },
  { name: "regression-boundary", topic: "Classical machine learning", question: "How do model parameters move a fit or decision boundary?" },
  { name: "decision-tree", topic: "Classical machine learning", question: "How does a decision tree carve up feature space?" },
  { name: "classification-threshold", topic: "Evaluation", question: "Why can a 99%-accurate detector catch almost nothing?" },
  { name: "bayesian-updating", topic: "Probabilistic inference", question: "When does the data overrule what you already believed?" },
  { name: "bagging-and-boosting", topic: "Classical machine learning", question: "How do many bad rules add up to a good one?" },
];

const colours = {
  paper: "#f5f2ec",
  surface: "#faf8f2",
  ink: "#282723",
  muted: "#6e6a62",
  outline: "#d5d0c6",
  outlineDark: "#8a857b",
  primary: "#4f6b4f",
  primarySoft: "#dbe8df",
  accent: "#b85236",
  accentSoft: "#ead8cf",
  error: "#934b43",
};

const escapeXml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function wrap(text, limit = 25) {
  const words = text.split(/\s+/);
  const lines = [];
  for (const word of words) {
    const last = lines.at(-1);
    if (!last || `${last} ${word}`.length > limit) lines.push(word);
    else lines[lines.length - 1] = `${last} ${word}`;
  }
  return lines.slice(0, 4);
}

function circles(points, fill, radius = 5) {
  return points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}"/>`).join("");
}

function gradientMotif() {
  return `<g fill="none" stroke="${colours.outlineDark}" opacity=".7">
    <ellipse cx="105" cy="92" rx="74" ry="46"/><ellipse cx="105" cy="92" rx="48" ry="29"/><ellipse cx="105" cy="92" rx="20" ry="12"/>
    <ellipse cx="270" cy="103" rx="72" ry="43"/><ellipse cx="270" cy="103" rx="43" ry="25"/><ellipse cx="270" cy="103" rx="18" ry="10"/>
  </g>
  <path d="M32 32C60 35 61 62 80 60S95 85 105 92" fill="none" stroke="${colours.accent}" stroke-width="5" stroke-linecap="round"/>
  ${circles([[32,32],[61,45],[80,60],[96,82],[105,92]], colours.accent, 4)}
  <path d="M188 24C213 42 190 60 222 73S201 103 238 108S245 103 270 103" fill="none" stroke="${colours.error}" stroke-width="3" stroke-dasharray="7 6"/>
  <circle cx="270" cy="103" r="8" fill="${colours.primary}"/>`;
}

function libraryMotif() {
  return `<g fill="${colours.surface}" stroke="${colours.outline}">
    <rect x="18" y="18" width="152" height="68"/><rect x="190" y="18" width="152" height="68"/>
    <rect x="18" y="104" width="152" height="68"/><rect x="190" y="104" width="152" height="68"/>
  </g>
  <g transform="translate(28 27) scale(.36)">${gradientMotif()}</g>
  <g stroke="${colours.primary}" fill="none"><path d="M210 68C231 34 266 33 291 68S329 90 332 43" stroke-width="4"/>${circles([[215,64],[255,43],[291,68],[326,50]], colours.accent, 4)}</g>
  <g transform="translate(27 113)">${circles([[10,30],[34,14],[55,35],[82,19],[112,39]], colours.primary, 5)}<line x1="4" y1="47" x2="132" y2="6" stroke="${colours.accent}" stroke-width="3"/></g>
  <g transform="translate(205 118)"><rect width="55" height="39" fill="${colours.primarySoft}"/><rect x="55" width="73" height="39" fill="${colours.accentSoft}"/><line x1="55" y1="0" x2="55" y2="39" stroke="${colours.accent}" stroke-width="3"/>${circles([[17,15],[39,28],[74,14],[105,29]], colours.ink, 4)}</g>`;
}

function methodologyMotif() {
  const rows = [
    ["COMPUTED", colours.primary, "scores · paths · boundaries"],
    ["AUTHORED", colours.accent, "data · vectors · examples"],
    ["OMITTED", colours.outlineDark, "scope stated explicitly"],
  ];
  return rows.map(([label, colour, detail], index) => {
    const y = 28 + index * 52;
    return `<rect x="18" y="${y}" width="324" height="38" fill="${colours.surface}" stroke="${colours.outline}"/>
      <rect x="18" y="${y}" width="8" height="38" fill="${colour}"/>
      <text x="40" y="${y + 16}" font-family="monospace" font-size="10" fill="${colour}">${label}</text>
      <text x="40" y="${y + 31}" font-family="sans-serif" font-size="11" fill="${colours.muted}">${detail}</text>`;
  }).join("");
}

function attentionMotif() {
  return `<g fill="none" stroke="${colours.primary}" stroke-linecap="round">
    <path d="M180 145C165 86 110 76 65 48" stroke-width="10" opacity=".76"/>
    <path d="M180 145C210 92 256 81 305 48" stroke-width="4" opacity=".52"/>
    <path d="M180 145C180 100 181 77 180 48" stroke-width="2" opacity=".35"/>
  </g>
  <g font-family="monospace" font-size="11" text-anchor="middle">
    <rect x="22" y="25" width="86" height="38" fill="${colours.surface}" stroke="${colours.outlineDark}"/><text x="65" y="49" fill="${colours.ink}">animal · 45%</text>
    <rect x="137" y="25" width="86" height="38" fill="${colours.surface}" stroke="${colours.outlineDark}"/><text x="180" y="49" fill="${colours.ink}">it · 6%</text>
    <rect x="262" y="25" width="86" height="38" fill="${colours.surface}" stroke="${colours.outlineDark}"/><text x="305" y="49" fill="${colours.ink}">street · 5%</text>
    <rect x="146" y="132" width="68" height="38" fill="${colours.primary}"/><text x="180" y="156" fill="${colours.surface}">it</text>
  </g>`;
}

function overfittingMotif() {
  const points = [[28,127],[64,85],[101,108],[138,63],[176,91],[215,55],[252,106],[292,68],[333,118]];
  return `<g stroke="${colours.outline}" opacity=".8"><line x1="20" y1="150" x2="340" y2="150"/><line x1="20" y1="20" x2="20" y2="150"/></g>
    <path d="M24 132C88 55 244 113 338 62" fill="none" stroke="${colours.primary}" stroke-width="5"/>
    <path d="M24 142L64 82L101 120L138 54L176 101L215 46L252 116L292 58L338 133" fill="none" stroke="${colours.accent}" stroke-width="3"/>
    ${circles(points,colours.ink,5)}
    <path d="M230 18C262 28 288 39 325 36" fill="none" stroke="${colours.error}" stroke-width="3"/><text x="258" y="25" font-family="monospace" font-size="9" fill="${colours.error}">validation rises</text>`;
}

function kMeansMotif() {
  const clusters = [
    [82,62,colours.primary,[[-30,-18],[-14,14],[15,-20],[28,9],[-28,24]]],
    [202,126,colours.accent,[[-27,-7],[-8,-25],[21,-10],[26,19],[-13,20]]],
    [294,50,colours.error,[[-24,11],[-5,-17],[23,13],[9,29]]],
  ];
  return clusters.map(([cx,cy,colour,offsets]) => `${offsets.map(([dx,dy]) => `<circle cx="${cx+dx}" cy="${cy+dy}" r="5" fill="${colour}" opacity=".72"/>`).join("")}<circle cx="${cx}" cy="${cy}" r="12" fill="${colours.surface}" stroke="${colour}" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="3" fill="${colour}"/>`).join("");
}

function kernelMotif() {
  const ring = Array.from({ length: 11 }, (_, index) => {
    const angle = index / 11 * Math.PI * 2;
    return [180 + Math.cos(angle) * 116, 54 + Math.sin(angle) * 34];
  });
  return `<path d="M40 132L180 76L320 132L180 178Z" fill="${colours.primarySoft}" stroke="${colours.outlineDark}"/>
    <path d="M60 101L180 58L300 101L180 144Z" fill="${colours.accentSoft}" fill-opacity=".65" stroke="${colours.accent}" stroke-width="3"/>
    <ellipse cx="180" cy="121" rx="72" ry="29" fill="none" stroke="${colours.accent}" stroke-width="4"/>
    ${circles(ring,colours.primary,6)}${circles([[158,130],[179,121],[198,133],[183,145]],colours.error,6)}`;
}

function samplingMotif() {
  const bars = [["dusk",250,colours.accent],["dark",168,colours.primary],["noon",108,colours.primary],["rain",62,colours.primary],["socks",26,colours.outlineDark]];
  return `${bars.map(([label,width,colour],index) => `<text x="70" y="${32+index*31}" text-anchor="end" font-family="monospace" font-size="12" fill="${colours.ink}">${label}</text><rect x="82" y="${18+index*31}" width="${width}" height="19" fill="${colour}" opacity="${1-index*.1}"/>`).join("")}<line x1="247" y1="8" x2="247" y2="174" stroke="${colours.error}" stroke-width="2" stroke-dasharray="5 4"/><text x="253" y="16" font-family="monospace" font-size="9" fill="${colours.error}">top-p cutoff</text>`;
}

function cnnMotif() {
  const pixels = [0,0,1,1,0,0,0,1,1,1,1,0,1,1,0,0,1,1,1,0,1,1,0,1,1,1,1,1,1,1,0,0,0,0,0,0];
  return `${pixels.map((value,index)=>`<rect x="18" y="${25+Math.floor(index/6)*21}" width="19" height="19" transform="translate(${(index%6)*21} 0)" fill="${value?colours.primary:colours.surface}" stroke="${colours.outline}"/>`).join("")}
    <path d="M160 85H198" stroke="${colours.outlineDark}" stroke-width="2"/><path d="M198 85l-9-5v10z" fill="${colours.outlineDark}"/>
    ${Array.from({length:9},(_,index)=>`<rect x="211" y="${54+Math.floor(index/3)*27}" width="25" height="25" transform="translate(${(index%3)*27} 0)" fill="${index%3===0?colours.error:index%3===2?colours.primary:colours.surface}" opacity=".78"/>`).join("")}
    <path d="M302 85H328" stroke="${colours.outlineDark}" stroke-width="2"/><circle cx="342" cy="85" r="13" fill="${colours.accent}"/>`;
}

function swarmMotif() {
  const particles=[[40,48],[73,135],[112,83],[159,145],[215,56],[265,119],[319,46],[238,158],[128,33]];
  return `<g fill="none" stroke="${colours.outlineDark}" opacity=".6"><ellipse cx="190" cy="95" rx="148" ry="66"/><ellipse cx="190" cy="95" rx="99" ry="44"/><ellipse cx="190" cy="95" rx="49" ry="22"/></g>
    ${particles.map(([x,y],index)=>`<g transform="translate(${x} ${y}) rotate(${index*19-40})"><path d="M-10 4L0-3L10 4L4 1L0 9L-4 1Z" fill="${index%2?colours.error:colours.primary}"/></g>`).join("")}
    <circle cx="190" cy="95" r="10" fill="${colours.accent}"/><circle cx="190" cy="95" r="20" fill="none" stroke="${colours.accent}" stroke-dasharray="4 4"/>`;
}

function geneticMotif() {
  const genomes=["101101001010","101111001010","101111101010","101111101110"];
  return `<path d="M18 42C70 28 90 92 142 76S226 115 265 46S320 31 345 64" fill="none" stroke="${colours.primary}" stroke-width="3"/>
    ${genomes.map((genome,row)=>`<text x="34" y="${91+row*24}" font-family="monospace" font-size="11" fill="${colours.ink}">${genome}</text><rect x="155" y="${80+row*24}" width="${85+row*30}" height="14" fill="${row===3?colours.accent:colours.primary}" opacity="${.5+row*.15}"/>`).join("")}`;
}

function pcaMotif() {
  const points=Array.from({length:20},(_,index)=>[30+index*16,150-index*5.1+Math.sin(index*2.2)*20]);
  return `<line x1="20" y1="168" x2="344" y2="48" stroke="${colours.accent}" stroke-width="5"/>
    ${points.map(([x,y])=>`<line x1="${x}" y1="${y}" x2="${x+8}" y2="${y-3}" stroke="${colours.error}" opacity=".45"/><circle cx="${x}" cy="${y}" r="6" fill="${colours.primary}"/>`).join("")}`;
}

function backpropMotif() {
  const inputs=[[48,48],[48,137]], hidden=[[180,35],[180,150]], output=[320,92];
  return `${inputs.flatMap((a,i)=>hidden.map((b,j)=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${(i+j)%2?colours.error:colours.primary}" stroke-width="${2+i+j}" opacity=".6"/>`)).join("")}
    ${hidden.map((a,i)=>`<line x1="${a[0]}" y1="${a[1]}" x2="${output[0]}" y2="${output[1]}" stroke="${colours.accent}" stroke-width="${i?3:7}" opacity=".7"/>`).join("")}
    <path d="M310 112C260 160 213 164 192 155" fill="none" stroke="${colours.error}" stroke-width="4" stroke-dasharray="6 5"/>
    ${circles(inputs,colours.surface,13)}${inputs.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="${colours.primary}" stroke-width="4"/>`).join("")}
    ${hidden.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="16" fill="${colours.primarySoft}" stroke="${colours.primary}" stroke-width="4"/>`).join("")}<circle cx="${output[0]}" cy="${output[1]}" r="20" fill="${colours.accentSoft}" stroke="${colours.accent}" stroke-width="4"/>`;
}

function regressionMotif() {
  const points=[[28,145],[63,126],[96,118],[131,99],[166,93],[201,76],[239,72],[275,51],[313,43]];
  return `<g stroke="${colours.outline}"><line x1="18" y1="165" x2="340" y2="165"/><line x1="18" y1="18" x2="18" y2="165"/></g>
    <path d="M22 154L334 32" stroke="${colours.accent}" stroke-width="5" fill="none"/>
    ${points.map(([x,y])=>`<line x1="${x}" y1="${y}" x2="${x}" y2="${154-(x-22)*.391}" stroke="${colours.error}" stroke-dasharray="3 3"/><circle cx="${x}" cy="${y}" r="6" fill="${colours.primary}"/>`).join("")}`;
}

/** Two overlapping score curves split by a threshold: the rare class is the sliver. */
function thresholdMotif() {
  const bell = (centre, scale) => Array.from({ length: 49 }, (_, index) => {
    const x = 12 + (index / 48) * 258;
    const t = (x - centre) / 46;
    const y = 150 - Math.exp(-t * t / 2) * 118 * scale;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${(y + 15).toFixed(1)}`;
  }).join(" ");
  const cut = 214;
  return `<rect x="${cut}" y="15" width="${282 - cut}" height="150" fill="${colours.accentSoft}" opacity=".6"/>
    <path d="${bell(104, 1)} L270 165 L12 165 Z" fill="${colours.primarySoft}" stroke="${colours.primary}" stroke-width="3"/>
    <path d="${bell(186, 1)} L270 165 L12 165 Z" fill="${colours.accentSoft}" stroke="${colours.error}" stroke-width="3" fill-opacity=".8"/>
    <line x1="${cut}" y1="15" x2="${cut}" y2="165" stroke="${colours.accent}" stroke-width="5"/>
    <g fill="${colours.surface}" stroke="${colours.outlineDark}" stroke-width="2">
      <rect x="291" y="34" width="69" height="42"/><rect x="291" y="80" width="69" height="42"/>
    </g>
    <text x="325" y="60" text-anchor="middle" font-family="monospace" font-size="19" fill="${colours.primary}">193</text>
    <text x="325" y="106" text-anchor="middle" font-family="monospace" font-size="19" fill="${colours.error}">807</text>
    <text x="360" y="140" text-anchor="end" font-family="monospace" font-size="12" fill="${colours.muted}">caught / missed</text>`;
}

/** A wide prior, a narrow likelihood, and the posterior pulled between them. */
function posteriorMotif() {
  const bell = (centre, spread, height) => Array.from({ length: 49 }, (_, index) => {
    const x = 12 + (index / 48) * 348;
    const t = (x - centre) / spread;
    const y = 165 - Math.exp(-t * t / 2) * height;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return `<path d="${bell(110, 62, 88)} L360 165 L12 165 Z" fill="${colours.outline}" fill-opacity=".5" stroke="${colours.outlineDark}" stroke-width="3" stroke-dasharray="7 5"/>
    <path d="${bell(268, 26, 132)}" fill="none" stroke="${colours.primary}" stroke-width="3" stroke-dasharray="4 5"/>
    <path d="${bell(228, 30, 124)} L360 165 L12 165 Z" fill="${colours.accentSoft}" fill-opacity=".85" stroke="${colours.accent}" stroke-width="4"/>
    <line x1="12" y1="165" x2="360" y2="165" stroke="${colours.outlineDark}" stroke-width="2"/>
    <text x="110" y="33" text-anchor="middle" font-family="monospace" font-size="12" fill="${colours.muted}">prior</text>
    <text x="252" y="20" text-anchor="middle" font-family="monospace" font-size="12" fill="${colours.accent}">posterior</text>`;
}

/** A staircase of axis-aligned cuts approximating a diagonal it cannot draw. */
function ensembleMotif() {
  const steps = [[12,150],[52,150],[52,124],[96,124],[96,100],[140,100],[140,76],[188,76],[188,52],[236,52],[236,30],[286,30]];
  const path = steps.map(([x,y],i)=>`${i===0?"M":"L"}${x} ${y}`).join(" ");
  const dots = [[36,44,colours.primary],[74,58,colours.primary],[112,40,colours.primary],[158,34,colours.primary],[210,26,colours.primary],[64,126,colours.error],[118,142,colours.error],[176,120,colours.error],[228,132,colours.error],[268,104,colours.error]];
  return `<path d="${path} L286 165 L12 165 Z" fill="${colours.accentSoft}" fill-opacity=".55"/>
    <path d="${path}" fill="none" stroke="${colours.accent}" stroke-width="4"/>
    <line x1="12" y1="162" x2="292" y2="22" stroke="${colours.ink}" stroke-width="3" stroke-dasharray="8 6" opacity=".55"/>
    ${dots.map(([x,y,fill])=>`<circle cx="${x}" cy="${y}" r="6" fill="${fill}" stroke="${colours.surface}" stroke-width="2"/>`).join("")}
    <g stroke="${colours.primary}" stroke-width="2" opacity=".45">
      <line x1="52" y1="15" x2="52" y2="165"/><line x1="140" y1="15" x2="140" y2="165"/>
      <line x1="12" y1="100" x2="292" y2="100"/><line x1="12" y1="52" x2="292" y2="52"/>
    </g>
    <text x="325" y="80" text-anchor="middle" font-family="monospace" font-size="15" fill="${colours.muted}">30</text>
    <text x="325" y="102" text-anchor="middle" font-family="monospace" font-size="12" fill="${colours.muted}">stumps</text>`;
}

function treeMotif() {
  const points=[[31,36,colours.primary],[65,56,colours.primary],[95,30,colours.primary],[110,96,colours.primary],[47,136,colours.primary],[164,45,colours.error],[205,69,colours.error],[238,34,colours.error],[260,116,colours.error],[188,139,colours.error]];
  return `<rect x="12" y="15" width="258" height="150" fill="${colours.primarySoft}"/><rect x="142" y="15" width="128" height="150" fill="${colours.accentSoft}"/><rect x="12" y="111" width="130" height="54" fill="${colours.accentSoft}" opacity=".72"/>
    <line x1="142" y1="15" x2="142" y2="165" stroke="${colours.accent}" stroke-width="5"/><line x1="12" y1="111" x2="142" y2="111" stroke="${colours.primary}" stroke-width="4"/>
    ${points.map(([x,y,fill])=>`<circle cx="${x}" cy="${y}" r="6" fill="${fill}" stroke="${colours.surface}" stroke-width="2"/>`).join("")}
    <g stroke="${colours.outlineDark}" fill="${colours.surface}"><line x1="315" y1="55" x2="291" y2="103"/><line x1="315" y1="55" x2="342" y2="103"/><rect x="291" y="34" width="49" height="25"/><rect x="275" y="103" width="39" height="25" fill="${colours.primarySoft}"/><rect x="326" y="103" width="34" height="25" fill="${colours.accentSoft}"/></g>`;
}

export function motifFor(name) {
  const motifs = {
    home: gradientMotif,
    library: libraryMotif,
    methodology: methodologyMotif,
    "gradient-descent": gradientMotif,
    overfitting: overfittingMotif,
    "k-means": kMeansMotif,
    "kernel-trick": kernelMotif,
    attention: attentionMotif,
    "token-sampling": samplingMotif,
    "cnn-feature-maps": cnnMotif,
    "particle-swarm": swarmMotif,
    "genetic-algorithm": geneticMotif,
    pca: pcaMotif,
    backpropagation: backpropMotif,
    "regression-boundary": regressionMotif,
    "decision-tree": treeMotif,
    "classification-threshold": thresholdMotif,
    "bayesian-updating": posteriorMotif,
    "bagging-and-boosting": ensembleMotif,
  };
  const render = motifs[name];
  if (!render) throw new Error(`No social motif for ${name}`);
  return `<g data-motif="${name}">${render()}</g>`;
}

export function renderSocialSvg(card) {
  const lines = wrap(card.question);
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="${colours.paper}"/>
    <path d="M0 92H1200M0 538H1200M70 0V630M1130 0V630M720 92V538" stroke="${colours.outline}" stroke-width="2"/>
    <text x="86" y="62" font-family="monospace" font-size="17" letter-spacing="2" fill="${colours.primary}">${escapeXml(card.topic.toUpperCase())}</text>
    ${lines.map((line,index)=>`<text x="86" y="${176+index*62}" font-family="Georgia,serif" font-size="50" font-weight="500" fill="${colours.ink}">${escapeXml(line)}</text>`).join("")}
    <svg x="760" y="150" width="340" height="330" viewBox="0 0 360 180" preserveAspectRatio="xMidYMid meet">${motifFor(card.name)}</svg>
    <text x="86" y="580" font-family="monospace" font-size="17" letter-spacing="2" fill="${colours.muted}">MACHINE LEARNING VISUALISATIONS · INTERACTIVE EXHIBIT</text>
  </svg>`;
}
