import type { PathAssessment, SurfaceKind } from "./model";

export type GradientPrediction = "faster" | "overshoot" | "depends" | "unsure";

const predictionOptions: readonly { id: GradientPrediction; label: string }[] = [
  { id: "faster", label: "Converge faster" },
  { id: "overshoot", label: "Overshoot" },
  { id: "depends", label: "It depends how much" },
  { id: "unsure", label: "Not sure yet" },
];

const predictionLanguage: Record<GradientPrediction, string> = {
  faster: "You expected faster convergence.",
  overshoot: "You expected it to overshoot.",
  depends: "You expected the amount to matter.",
  unsure: "You left the outcome open.",
};

interface GradientDescentGuideProps {
  step: number;
  boundedStep: number;
  surface: SurfaceKind;
  learningRate: number;
  beforeLoss: number;
  afterLoss: number;
  pathAssessment: PathAssessment;
  referenceRate: number | null;
  rateAdjusted: boolean;
  prediction: GradientPrediction | null;
  onPredict: (prediction: GradientPrediction) => void;
  stabilityBoundary: number;
  testedUnstable: boolean;
  startChanged: boolean;
  rateChanged: boolean;
  reachesDifferentBasin: boolean;
  forecastLoss: number;
  referenceLoss: number | null;
}

function pathChange(assessment: PathAssessment) {
  return Math.abs(assessment.relativeLossDelta * 100).toFixed(0);
}

export function GradientDescentGuide({
  step,
  boundedStep,
  surface,
  learningRate,
  beforeLoss,
  afterLoss,
  pathAssessment,
  referenceRate,
  rateAdjusted,
  prediction,
  onPredict,
  stabilityBoundary,
  testedUnstable,
  startChanged,
  rateChanged,
  reachesDifferentBasin,
  forecastLoss,
  referenceLoss,
}: GradientDescentGuideProps) {
  if (step === 0) {
    return (
      <aside aria-label="Learning guide" className="border-t border-outline bg-primary-container/45 px-3 py-2 sm:px-4">
        <p className="font-mono text-[9px] uppercase tracking-label text-primary">Before you move it</p>
        <div className="mt-1 grid gap-1 sm:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)] sm:gap-5">
          <p className="font-headline text-base font-medium text-on-surface">Where do you think it will end up?</p>
          <p className="text-xs leading-5 text-on-surface-variant">The green arrow is everything this optimiser knows right now: the local downhill direction. Move the rust start, then take one step.</p>
        </div>
      </aside>
    );
  }

  if (step === 1) {
    return (
      <aside aria-label="Learning guide" className="border-t border-outline bg-primary-container/45 px-3 py-2 sm:px-4" aria-live="polite">
        <p className="font-mono text-[9px] uppercase tracking-label text-primary">What changed?</p>
        <div className="mt-1 grid gap-1 sm:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)] sm:gap-5">
          <p className="font-headline text-base font-medium text-on-surface">{boundedStep > 0 ? "One local decision. No map." : "Take one local step."}</p>
          <p className="text-xs leading-5 text-on-surface-variant">{boundedStep > 0 ? `Using only the slope at the previous point, loss moved from ${beforeLoss.toFixed(3)} to ${afterLoss.toFixed(3)}.` : "The update will use the arrow at this point; it does not inspect the complete route first."}</p>
        </div>
      </aside>
    );
  }

  if (step === 2 && surface === "valley" && !rateAdjusted) {
    return (
      <aside aria-label="Learning guide" className="border-t border-outline bg-primary-container/45 px-3 py-2 sm:px-4">
        <div className="grid gap-2 lg:grid-cols-[minmax(230px,0.55fr)_minmax(0,1fr)] lg:items-center lg:gap-5">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-label text-primary">Before you move it</p>
            <p className="mt-1 font-headline text-base font-medium text-on-surface">If the step gets bigger, what do you expect?</p>
          </div>
          <div className="grid grid-cols-2 gap-1 sm:flex sm:flex-wrap" role="group" aria-label="Prediction options">
            {predictionOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={prediction === option.id}
                onClick={() => onPredict(option.id)}
                className={`min-h-9 border px-2.5 text-[11px] transition-colors ${prediction === option.id ? "border-primary bg-primary text-on-primary" : "border-outline-dark bg-surface text-on-surface hover:border-primary"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {prediction ? <p className="mt-1 text-[11px] text-on-surface-variant">{predictionLanguage[prediction]} Now test it with the learning-rate control; nothing is scored.</p> : <p className="mt-1 text-[11px] text-on-surface-variant">Prediction is optional. The green path keeps rate {referenceRate?.toFixed(2) ?? "0.40"} while you change the rust path.</p>}
      </aside>
    );
  }

  if (step === 2) {
    const expected = prediction ? `${predictionLanguage[prediction]} ` : "";
    const fixedEvidence = referenceRate !== null
      ? `You changed the rate from ${referenceRate.toFixed(2)} to ${learningRate.toFixed(2)}; the start and landscape stayed fixed. `
      : "";
    const failedChallenge = pathAssessment.relativeLossDelta >= 0;
    const atBoundary = Math.abs(learningRate - stabilityBoundary) < 1e-8;
    const title = surface !== "valley"
      ? "Return to the narrow valley."
      : atBoundary && testedUnstable
        ? "You found the tested edge."
        : failedChallenge
          ? "There it is."
          : pathAssessment.crossings > 0
            ? "Watch the valley floor."
            : "Still descending cleanly."
    const outcome = surface !== "valley"
      ? "The stability challenge is defined on the narrow valley so the surface can remain controlled."
      : atBoundary && testedUnstable
        ? `${stabilityBoundary.toFixed(2)} is the largest slider value whose 14-step path finishes lower; ${(stabilityBoundary + 0.02).toFixed(2)} finishes higher.`
        : failedChallenge
          ? `${fixedEvidence}After 14 steps, loss is ${pathChange(pathAssessment)}% higher. Each direction is locally downhill, but the steps are too large for stable progress.`
          : pathAssessment.crossings > 0
            ? `${fixedEvidence}The path crosses the valley floor ${pathAssessment.crossings} times and still finishes ${pathChange(pathAssessment)}% lower.`
            : `${fixedEvidence}After 14 steps, loss is ${pathChange(pathAssessment)}% lower without crossing the valley floor.`

    return (
      <aside aria-label="Learning guide" className={`border-t px-3 py-2 sm:px-4 ${failedChallenge ? "border-error bg-error-container/65" : "border-outline bg-primary-container/45"}`} aria-live="polite">
        <div className="grid gap-1 sm:grid-cols-[minmax(0,0.36fr)_minmax(0,1fr)] sm:gap-5">
          <div>
            <p className={`font-mono text-[9px] uppercase tracking-label ${failedChallenge ? "text-error" : "text-primary"}`}>{failedChallenge ? "Instability revealed" : "Can you break it?"}</p>
            <p className="mt-1 font-headline text-base font-medium text-on-surface">{title}</p>
          </div>
          <p className="text-xs leading-5 text-on-surface-variant">{expected}{outcome}</p>
        </div>
      </aside>
    );
  }

  if (step === 3) {
    const controlled = startChanged && !rateChanged;
    const title = controlled && reachesDifferentBasin
      ? "Same rule. Same rate. Different basin."
      : startChanged && rateChanged
        ? "Two things changed—causality is no longer isolated."
        : "Move only the rust start."
    const detail = controlled && referenceLoss !== null
      ? `Changing only the start sends the paths to final losses ${referenceLoss.toFixed(2)} and ${forecastLoss.toFixed(2)}. Neither path inspected the other basin.`
      : "Keep the rate fixed and compare endpoints. If rate and start both change, the scene will label the comparison as confounded."

    return (
      <aside aria-label="Learning guide" className="border-t border-outline bg-primary-container/45 px-3 py-2 sm:px-4" aria-live="polite">
        <p className="font-mono text-[9px] uppercase tracking-label text-primary">What stayed constant?</p>
        <div className="mt-1 grid gap-1 sm:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)] sm:gap-5">
          <p className="font-headline text-base font-medium text-on-surface">{title}</p>
          <p className="text-xs leading-5 text-on-surface-variant">{detail}</p>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="Learning guide" className="border-t-2 border-primary bg-primary-container/65 px-3 py-2 sm:px-4" aria-live="polite">
      <p className="font-mono text-[9px] uppercase tracking-label text-primary">Keep this image</p>
      <div className="mt-1 grid gap-1 sm:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)] sm:gap-5">
        <p className="font-headline text-base font-medium text-on-surface">Same start. Same landscape. Different step size.</p>
        <p className="text-xs leading-5 text-on-surface-variant">The green path converges; the rust path finishes {pathChange(pathAssessment)}% higher. Real networks have far more dimensions, but plain gradient descent still acts from local slope—not a map of the destination.</p>
      </div>
    </aside>
  );
}
