import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const KIB = 1024;
const routes = [
  { name: "homepage", file: "out/index.html", budget: 210 },
  { name: "library", file: "out/visualisations.html", budget: 210 },
  { name: "attention", file: "out/visualisations/attention.html", budget: 280 },
  { name: "backpropagation", file: "out/visualisations/backpropagation.html", budget: 280 },
  { name: "cnn-feature-maps", file: "out/visualisations/cnn-feature-maps.html", budget: 280 },
  { name: "genetic-algorithm", file: "out/visualisations/genetic-algorithm.html", budget: 280 },
  { name: "k-means", file: "out/visualisations/k-means.html", budget: 280 },
  { name: "overfitting", file: "out/visualisations/overfitting.html", budget: 280 },
  { name: "particle-swarm", file: "out/visualisations/particle-swarm.html", budget: 280 },
  { name: "pca", file: "out/visualisations/pca.html", budget: 280 },
  { name: "token-sampling", file: "out/visualisations/token-sampling.html", budget: 280 },
  { name: "gradient-descent", file: "out/visualisations/gradient-descent.html", budget: 470 },
  { name: "kernel-trick", file: "out/visualisations/kernel-trick.html", budget: 470 },
];

let failed = false;

for (const route of routes) {
  const html = readFileSync(route.file, "utf8");
  const assets = [
    ...new Set(
      [...html.matchAll(/\/_next\/static\/chunks\/[^"' ]+\.js/g)].map(
        ([asset]) => `out${asset}`,
      ),
    ),
  ];
  const compressedBytes = assets.reduce(
    (total, asset) => total + gzipSync(readFileSync(asset)).byteLength,
    0,
  );
  const compressedKib = compressedBytes / KIB;
  const result = compressedKib <= route.budget ? "PASS" : "FAIL";

  console.log(
    `${result} ${route.name}: ${compressedKib.toFixed(1)} KiB gzip / ${route.budget} KiB budget (${assets.length} files)`,
  );

  if (compressedKib > route.budget) failed = true;
}

if (failed) {
  console.error("Static JavaScript budget exceeded.");
  process.exitCode = 1;
}
