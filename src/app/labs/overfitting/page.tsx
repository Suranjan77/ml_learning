import type { Metadata } from "next";
import LabShell from "@/components/labs/LabShell";
import OverfittingLab from "@/components/labs/OverfittingLab";

export const metadata: Metadata = {
  title: "Overfitting Lab",
  description:
    "Fit a curve to noisy points and crank the model's complexity. Watch training error melt away while test error quietly betrays you.",
};

const guidelines: [string, string, string][] = [
  [
    "01",
    "Start Simple",
    "At degree 1 or 2 the curve can barely bend — both train and test error stay high. That flat, unconvincing fit is underfitting.",
  ],
  [
    "02",
    "Crank the Degree",
    "Drag the degree slider past 8 or 9 and watch the curve loop tightly through the train points while the test points get abandoned.",
  ],
  [
    "03",
    "Read the U-Curve",
    "The chart below the plot tracks train and test RMSE across every degree at once. Train keeps falling; test bottoms out, then climbs — that valley is the sweet spot.",
  ],
  [
    "04",
    "Fight Back with Ridge",
    "Raise λ (lambda) on an overfit, high-degree curve. The same shape gets penalized for large coefficients and settles back down without losing the degree.",
  ],
];

export default function OverfittingLabPage() {
  return (
    <LabShell
      title="Overfitting Lab"
      lede="Every model has a knob for complexity — turn it too far and it stops learning the pattern and starts memorizing the noise."
      theoryHref="/algorithms/regularization"
      stats={[
        ["Model", "Polynomial · ridge"],
        ["Solver", "Normal equations"],
        ["Knobs", "Degree · λ"],
      ]}
      notes={guidelines}
      closing={
        <>
          Real models rarely tune a literal polynomial degree, but the
          shape of the tradeoff is identical &mdash; tree depth, hidden
          units, training epochs, and nearest-neighbor count all trade the
          same bias for the same variance. Every one of them has a test
          curve shaped like the one below the plot, and every regularizer
          &mdash; ridge, dropout, weight decay, early stopping &mdash; is a
          different way of pulling that curve back down.
        </>
      }
    >
      <OverfittingLab />
    </LabShell>
  );
}
