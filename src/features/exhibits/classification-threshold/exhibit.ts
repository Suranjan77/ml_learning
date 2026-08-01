import type { ExhibitDefinition } from "../types";

export const classificationThresholdExhibit: ExhibitDefinition = {
  slug: "classification-threshold",
  title: "Threshold and base rate",
  question: "Why can a 99%-accurate detector catch almost nothing?",
  summary:
    "Drag the alert threshold across two overlapping score distributions and watch the confusion matrix, accuracy, precision and recall move together — then make the positive class rarer and watch precision collapse while accuracy and the ROC curve barely notice.",
  insight:
    "Accuracy is a weighted average dominated by whichever class is larger, so when attacks are 1% of traffic a detector that alerts on nothing scores 99%. Recall depends only on the model and the threshold. Precision depends on the base rate as well — which is why the same detector can look excellent on a balanced benchmark and be unusable in production, and why the ROC curve, which never sees the base rate, cannot warn you.",
  topic: "Evaluation",
  difficulty: "Approachable",
  duration: 6,
  renderer: "SVG",
  tags: [
    "threshold",
    "confusion matrix",
    "precision",
    "recall",
    "accuracy",
    "base rate",
    "class imbalance",
    "ROC",
    "precision-recall curve",
    "false positives",
    "anomaly detection",
    "evaluation metrics",
  ],
  related: ["overfitting", "regression-boundary", "decision-tree"],
  assumptions: [
    "Both classes are drawn as normal score distributions with the same spread. Real detector scores are rarely this tidy, and are often multi-modal.",
    "The two density curves are each scaled to their own peak so the rare class stays visible. The population bar beneath them shows the true proportion.",
    "Counts are computed analytically from the normal distributions rather than sampled, so there is no sampling noise: every number follows exactly from the three controls.",
    "A single fixed population of 100,000 events is scored, so counts remain comparable as the base rate changes.",
    "Separation stands in for everything that makes a detector good or bad. A real model's errors are not symmetric between classes.",
  ],
  references: [
    {
      label: "Saito & Rehmsmeier, The Precision-Recall Plot Is More Informative than the ROC Plot on Imbalanced Datasets (2015), PLOS ONE",
      href: "https://doi.org/10.1371/journal.pone.0118432",
    },
    {
      label: "Davis & Goadrich, The Relationship Between Precision-Recall and ROC Curves (2006), ICML",
      href: "https://doi.org/10.1145/1143844.1143874",
    },
    { label: "Provost & Fawcett, Data Science for Business (2013), chapters 7–8" },
    { label: "Axelsson, The Base-Rate Fallacy and the Difficulty of Intrusion Detection (2000), ACM TISSEC" },
  ],
  steps: [
    {
      title: "Read the accuracy",
      instruction: "One event in a hundred is an attack, and the threshold sits where accuracy is highest. Read the accuracy.",
      observation: "99.1% — and the do-nothing detector that calls everything benign scores 99.0%. Almost all of that number was free.",
    },
    {
      title: "Count what accuracy hid",
      instruction: "Look at the four cells instead of the summary. Compare the attacks caught with the attacks missed.",
      observation: "807 of 1,000 attacks are in the missed cell. Accuracy stayed high because the benign column dwarfs everything else.",
    },
    {
      title: "Make the attack rarer",
      instruction: "The base rate is now 0.2% and nothing else has changed. Watch recall and precision separately, then drag the base rate yourself.",
      observation: "Recall does not move at all — the model and the threshold decide it. Precision falls, because each real attack is buried in more false alarms.",
    },
    {
      title: "Choose a threshold for the job",
      instruction: "This is the threshold that balances the two errors. Press 'Best accuracy' to see what the accuracy-optimal choice would have cost you.",
      observation: "Accuracy picks a threshold that catches one attack in twenty. Choosing a threshold means choosing which error you can afford, and accuracy will not make that choice for you.",
    },
  ],
  challenges: [
    "Set the base rate to 0.1% and find a threshold that reaches 50% precision. What does it cost you in recall?",
    "Hold the threshold still and sweep the base rate from 50% down to 0.1%. Which of the four confusion cells changes most, and which metric refuses to move?",
    "Find two settings with the same accuracy but very different recall. What does that tell you about reporting a single accuracy figure?",
    "Push separation to its maximum. Can a very good model still produce more false alarms than true ones at a low base rate?",
  ],
};
