import type { Metadata } from "next";
import Link from "next/link";
import AlgorithmSimulator from "@/components/ui/AlgorithmSimulator";

export const metadata: Metadata = {
  title: "Neural Network Playground",
  description:
    "Build classification datasets, tune model settings, and watch a neural network learn a decision boundary in real time.",
};

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        {/* Page header */}
        <section className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center border-2 border-outline bg-surface-container px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-on-surface transition-transform hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-outline)]"
            >
              ← Back
            </Link>
            <div className="inline-flex items-center border-2 border-outline-dark bg-tertiary px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#000] shadow-[2px_2px_0px_0px_#000]">
              Interactive Lab
            </div>
          </div>

          <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface sm:text-5xl">
            Neural Network Playground
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-on-surface-variant sm:text-lg">
            Build a tiny classification dataset, tune model settings, and watch
            a small neural network learn a decision boundary directly in your
            browser. This simulator runs a real forward pass and backpropagation
            loop — no shortcuts.
          </p>
        </section>

        {/* Main simulator area */}
        <section className="mb-16">
          <div className="border-4 border-outline bg-surface-container-lowest shadow-[8px_8px_0px_0px_var(--color-outline)]">
            <div className="border-b-4 border-outline bg-surface-container-low px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-headline text-lg font-bold uppercase text-on-surface">
                    Playground Environment
                  </span>
                  <p className="mt-1 font-mono text-xs uppercase tracking-wider text-on-surface-variant">
                    Interactive Neural Network Canvas
                  </p>
                </div>
                <Link
                  href="/algorithms/neural-networks"
                  className="border-2 border-outline bg-surface-container px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-on-surface transition-transform hover:-translate-y-1 hover:translate-x-1 hover:shadow-[-2px_2px_0px_0px_var(--color-outline)]"
                >
                  Read Theory →
                </Link>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <AlgorithmSimulator />
            </div>
          </div>
        </section>

        {/* How to use guide */}
        <section className="mb-16">
          <h2 className="mb-6 font-headline text-3xl font-black uppercase tracking-tight text-on-surface">
            How to Use
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Place Data Points",
                description:
                  "Click on the canvas to place samples. Use the class selector to toggle between Class A (blue) and Class B (orange). Aim for at least 3–4 points per class.",
              },
              {
                step: "2",
                title: "Pick a Preset",
                description:
                  'Or choose a preset dataset — Linear (separable), XOR (needs nonlinearity), or Rings (concentric circles) — to see how the network handles different geometries.',
              },
              {
                step: "3",
                title: "Configure & Train",
                description:
                  "Adjust hidden units (network width), learning rate, and regularisation. Then hit Train and watch the decision boundary evolve in real time.",
              },
              {
                step: "4",
                title: "Read the Output",
                description:
                  "The heatmap shows predicted class probability. The white contour is the decision boundary (ŷ ≈ 0.5). Watch loss decrease and accuracy increase in the metrics panel.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group border-2 border-outline bg-surface-container p-6 transition-transform hover:-translate-y-1 hover:translate-x-1 hover:shadow-[-4px_4px_0px_0px_var(--color-outline)]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center border-2 border-outline-dark bg-secondary font-mono text-lg font-black text-[#000] shadow-[2px_2px_0px_0px_#000] transition-colors group-hover:bg-primary">
                  {item.step}
                </div>
                <h3 className="font-headline text-lg font-bold uppercase text-on-surface">
                  {item.title}
                </h3>
                <p className="mt-2 font-mono text-sm leading-6 text-on-surface-variant">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Deep Dive */}
        <section className="mb-16">
          <h2 className="mb-6 font-headline text-3xl font-black uppercase tracking-tight text-on-surface">
            Under the Hood
          </h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="border-4 border-outline bg-surface-container p-6 shadow-[4px_4px_0px_0px_var(--color-outline)]">
              <h3 className="mb-3 font-headline text-lg font-bold uppercase text-on-surface">
                Architecture
              </h3>
              <p className="font-mono text-sm leading-7 text-on-surface-variant">
                The simulator runs a{" "}
                <strong className="text-on-surface">
                  multi-layer perceptron (MLP)
                </strong>{" "}
                with a single hidden layer. The architecture is{" "}
                <code className="border border-outline bg-surface-lowest px-1.5 py-0.5 font-mono text-xs font-bold text-primary">
                  2 → H → 1
                </code>{" "}
                where H is the number of hidden units you configure. The two
                inputs are the (x, y) canvas coordinates normalized to [−1, 1].
              </p>
              <div className="mt-4 space-y-2 border-2 border-outline-dark bg-[#000] px-4 py-3 font-mono text-sm leading-6 text-on-surface shadow-[4px_4px_0px_0px_var(--color-outline-dark)]">
                <div>
                  <strong className="text-on-surface">Hidden:</strong> z =
                  W₁·x + b₁, &nbsp;a = tanh(z)
                </div>
                <div>
                  <strong className="text-on-surface">Output:</strong> ŷ =
                  σ(w₂ᵀ·a + b₂)
                </div>
              </div>
              <p className="mt-4 font-mono text-sm leading-7 text-on-surface-variant">
                The <strong className="text-on-surface">tanh</strong> activation
                allows hidden units to produce both positive and negative
                values, enabling the network to carve nonlinear boundaries. The
                output sigmoid squashes the result to [0, 1],
                representing the probability of Class B.
              </p>
            </div>

            <div className="border-4 border-outline bg-surface-container p-6 shadow-[4px_4px_0px_0px_var(--color-outline)]">
              <h3 className="mb-3 font-headline text-lg font-bold uppercase text-on-surface">
                Training Loop
              </h3>
              <p className="font-mono text-sm leading-7 text-on-surface-variant">
                Each click of "Train" runs multiple epochs of{" "}
                <strong className="text-on-surface">
                  full-batch gradient descent
                </strong>
                . The loss function is{" "}
                <strong className="text-on-surface">binary cross-entropy</strong>:
              </p>
              <div className="mt-4 border-2 border-outline-dark bg-[#000] px-4 py-3 font-mono text-sm leading-6 text-tertiary shadow-[4px_4px_0px_0px_var(--color-outline-dark)]">
                L = −(1/n) Σ [yᵢ log(ŷᵢ) + (1−yᵢ) log(1−ŷᵢ)]
              </div>
              <p className="mt-4 font-mono text-sm leading-7 text-on-surface-variant">
                Gradients are computed via{" "}
                <strong className="text-on-surface">backpropagation</strong> —
                the chain rule applied through every layer. The weight update
                includes L2 regularisation (weight decay):
              </p>
              <div className="mt-4 border-2 border-outline-dark bg-[#000] px-4 py-3 font-mono text-sm leading-6 text-secondary shadow-[4px_4px_0px_0px_var(--color-outline-dark)]">
                θ ← θ − η·(∇L + λ·θ)
              </div>
              <p className="mt-4 font-mono text-sm leading-7 text-on-surface-variant">
                The <strong className="text-on-surface">‖W‖ metric</strong>{" "}
                tracks total weight magnitude. Higher regularisation (λ) keeps
                this small, producing simpler, smoother decision boundaries that
                generalise better.
              </p>
            </div>

            <div className="border-4 border-outline bg-surface-container p-6 shadow-[4px_4px_0px_0px_var(--color-outline)]">
              <h3 className="mb-3 font-headline text-lg font-bold uppercase text-on-surface">
                Why Different Datasets Matter
              </h3>
              <ul className="space-y-4 font-mono text-sm leading-7 text-on-surface-variant">
                <li className="flex items-start gap-4">
                  <span className="mt-1 h-3 w-3 shrink-0 border border-[#000] bg-primary shadow-[1px_1px_0px_0px_#000]" />
                  <span>
                    <strong className="text-on-surface">Linear:</strong> A
                    single straight line can separate the classes. Even 1 hidden
                    unit suffices. This shows the model at its simplest.
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="mt-1 h-3 w-3 shrink-0 border border-[#000] bg-secondary shadow-[1px_1px_0px_0px_#000]" />
                  <span>
                    <strong className="text-on-surface">XOR:</strong> No single
                    line can separate these four clusters. The network needs ≥2
                    hidden units to combine features nonlinearly.
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="mt-1 h-3 w-3 shrink-0 border border-[#000] bg-tertiary shadow-[1px_1px_0px_0px_#000]" />
                  <span>
                    <strong className="text-on-surface">Rings:</strong>{" "}
                    Concentric circles require a closed-curve boundary. The
                    network needs ~4+ hidden units to approximate this shape.
                  </span>
                </li>
              </ul>
            </div>

            <div className="border-4 border-outline bg-surface-container p-6 shadow-[4px_4px_0px_0px_var(--color-outline)]">
              <h3 className="mb-3 font-headline text-lg font-bold uppercase text-on-surface">
                Reading the Visualisation
              </h3>
              <ul className="space-y-4 font-mono text-sm leading-7 text-on-surface-variant">
                <li className="flex items-start gap-4">
                  <span className="mt-1 h-3 w-3 shrink-0 border border-[#000] bg-primary shadow-[1px_1px_0px_0px_#000]" />
                  <span>
                    <strong className="text-on-surface">Heatmap:</strong> Each
                    pixel shows the model&apos;s predicted probability. Pink-tinted
                    areas predict Class A; Cyan-tinted areas predict Class B.
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="mt-1 h-3 w-3 shrink-0 border border-outline bg-surface-highest" />
                  <span>
                    <strong className="text-on-surface">White contour:</strong>{" "}
                    The decision boundary where ŷ ≈ 0.5 — the model is
                    maximally uncertain. Points on opposite sides are classified
                    differently.
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="mt-1 h-3 w-3 shrink-0 border border-[#000] bg-error shadow-[1px_1px_0px_0px_#000]" />
                  <span>
                    <strong className="text-on-surface">Metrics:</strong> Loss
                    should decrease over training. Accuracy shows the fraction
                    of training points correctly classified. ‖W‖ measures model
                    complexity.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Navigation footer */}
        <footer className="flex flex-col gap-4 border-t border-outline-variant/50 pt-8 text-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
          <p>
            Want to learn the theory?{" "}
            <Link
              href="/algorithms/neural-networks"
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Open the Neural Networks lesson →
            </Link>
          </p>
          <Link
            href="/"
            className="transition-colors hover:text-on-surface"
          >
            Back to Home
          </Link>
        </footer>
      </div>
    </div>
  );
}
