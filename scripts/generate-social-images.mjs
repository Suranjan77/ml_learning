import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const cards = [
  ["home", "Interactive machine learning visualisations", "Watch the mechanism change"],
  ["library", "Visualisation library", "Explore by question, topic, or model"],
  ["methodology", "Methodology and about", "Assumptions, accessibility, and privacy"],
  ["gradient-descent", "Learning and optimisation", "How does gradient descent choose its next step?"],
  ["overfitting", "Generalisation", "When does a flexible model stop generalising?"],
  ["k-means", "Unsupervised learning", "How does k-means decide where clusters belong?"],
  ["kernel-trick", "Classical machine learning", "How can a feature map turn a circular boundary into a flat one?"],
  ["attention", "Language models", "How does query-key similarity become an attention weight?"],
  ["token-sampling", "Language models", "How do temperature and truncation change what a language model writes?"],
  ["cnn-feature-maps", "Deep learning", "How does a CNN turn pixels into features?"],
  ["particle-swarm", "Evolutionary computation", "How can a swarm find an optimum without gradients?"],
  ["genetic-algorithm", "Evolutionary computation", "How does evolution search without knowing a gradient?"],
  ["pca", "Unsupervised learning", "How does PCA compress data without labels?"],
  ["backpropagation", "Deep learning", "How does error travel backward through a neural network?"],
  ["regression-boundary", "Classical machine learning", "How do model parameters move a fit or decision boundary?"],
  ["decision-tree", "Classical machine learning", "How does a decision tree carve up feature space?"],
];

const escapeXml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function wrap(text, limit = 42) {
  const words = text.split(/\s+/);
  const lines = [];
  for (const word of words) {
    const last = lines.at(-1);
    if (!last || `${last} ${word}`.length > limit) lines.push(word);
    else lines[lines.length - 1] = `${last} ${word}`;
  }
  return lines.slice(0, 3);
}

function svg(topic, question) {
  const lines = wrap(question);
  return `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#f5f2ec"/>
      <path d="M0 92H1200M0 538H1200M86 0V630M1114 0V630" stroke="#d5d0c6" stroke-width="2"/>
      <circle cx="1030" cy="176" r="116" fill="#dbe8df"/>
      <path d="M910 346C970 278 1038 286 1114 222" fill="none" stroke="#b85236" stroke-width="11"/>
      <circle cx="910" cy="346" r="13" fill="#f5f2ec" stroke="#b85236" stroke-width="7"/>
      <circle cx="1114" cy="222" r="13" fill="#f5f2ec" stroke="#b85236" stroke-width="7"/>
      <text x="86" y="72" font-family="monospace" font-size="18" letter-spacing="3" fill="#306b4f">${escapeXml(topic.toUpperCase())}</text>
      ${lines.map((line, index) => `<text x="86" y="${190 + index * 76}" font-family="Georgia,serif" font-size="62" font-weight="500" fill="#282723">${escapeXml(line)}</text>`).join("")}
      <text x="86" y="580" font-family="monospace" font-size="18" letter-spacing="2" fill="#6e6a62">MACHINE LEARNING VISUALISATIONS · INTERACTIVE</text>
    </svg>`;
}

const output = path.join(process.cwd(), "public", "social");
await mkdir(output, { recursive: true });
await Promise.all(cards.map(([name, topic, question]) =>
  sharp(Buffer.from(svg(topic, question))).png().toFile(path.join(output, `${name}.png`)),
));
