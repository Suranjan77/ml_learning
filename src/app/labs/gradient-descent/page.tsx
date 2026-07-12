import type { Metadata } from "next";
import LabShell from "@/components/labs/LabShell";
import GradientDescentLab from "@/components/labs/GradientDescentLab";

export const metadata: Metadata = {
  title: "Gradient Descent Lab",
  description:
    "Drop a ball on a loss surface and race SGD, momentum, RMSProp, and Adam to the minimum. Learning rate and momentum are yours to break.",
};

const guidelines: [string, string, string][] = [
  [
    "01",
    "Read the Surface",
    "Darker regions are higher loss, lighter regions are lower. The crosshair marks the true minimum — every optimizer is trying to reach it.",
  ],
  [
    "02",
    "Move the Start",
    "Click or tap anywhere on the plot to drop all four optimizers at a new point. They always start together, so the race is fair.",
  ],
  [
    "03",
    "Push the Learning Rate",
    "Drag it up until SGD overshoots and bounces around, or even flies off the surface. Then watch how the adaptive methods stay composed.",
  ],
  [
    "04",
    "Switch Surfaces",
    "The ravine punishes a fixed step size; the banana punishes straight-line thinking; the saddle can stall an optimizer that ignores curvature.",
  ],
];

export default function GradientDescentLabPage() {
  return (
    <LabShell
      title="Gradient Descent Lab"
      lede="Every training run is a ball rolling downhill on a loss surface."
      theoryHref="/algorithms/optimization-optimizers"
      stats={[
        ["Optimizers", "SGD · Mom · RMS · Adam"],
        ["Surfaces", "4 loss landscapes"],
        ["Controls", "η · β · start point"],
      ]}
      notes={guidelines}
      closing={
        <>
          Real training runs happen in millions of dimensions instead of
          two, so you can never actually see the loss surface a network is
          descending. The mechanics here are otherwise identical to what
          PyTorch or TensorFlow run under the hood: a gradient, a learning
          rate, and a handful of running averages that decide how far and
          in what direction the next step goes.
        </>
      }
    >
      <GradientDescentLab />
    </LabShell>
  );
}
