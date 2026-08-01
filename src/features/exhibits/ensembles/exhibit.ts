import type { ExhibitDefinition } from "../types";

export const ensemblesExhibit: ExhibitDefinition = {
  slug: "bagging-and-boosting",
  question: "How do many bad rules add up to a good one?",
  title: "Bagging and boosting",
  summary:
    "Combine decision stumps that can only cut straight across one axis, and watch a diagonal boundary emerge from their votes under boosting — then spend the identical budget on bagging and watch the accuracy refuse to move at all.",
  insight:
    "The two methods fix different faults. Boosting attacks bias — it fits each stump to what the last one got wrong, so the committee can express a shape no single member can, and the diagonal emerges as a staircase. Bagging attacks variance, by averaging away the disagreement between learners trained on different samples. A decision stump has enormous bias and almost no variance: resample the data and you get back nearly the same stump, so bagging has nothing to average away and the accuracy does not move however many you add. This is why a random forest bags deep, unstable trees rather than stumps — and why the right question is never \"which ensemble method is better\" but \"which of my two errors is the larger one\".",
  topic: "Classical machine learning",
  difficulty: "Intermediate",
  duration: 6,
  renderer: "SVG",
  tags: [
    "ensemble",
    "bagging",
    "boosting",
    "AdaBoost",
    "random forest",
    "decision stump",
    "weak learner",
    "bootstrap",
    "variance reduction",
    "weighted vote",
    "model combination",
  ],
  related: ["decision-tree", "overfitting", "regression-boundary"],
  assumptions: [
    "Every weak learner is a decision stump: one threshold on one axis. Real bagging usually grows full trees, and a random forest also samples features at each split.",
    "Bagging here varies only the bootstrap resample, not the features considered. That isolates resampling as the source of diversity.",
    "Boosting is AdaBoost with the standard exponential reweighting. Gradient boosting, which is more common in practice, fits each learner to a residual instead.",
    "Accuracy is measured on the training data the ensemble was fitted to. Held-out behaviour is the subject of the overfitting exhibit.",
    "Bagging is shown on the case where it does not help. That is deliberate — the point is that it addresses variance, and a stump has none to address — but it is not a fair portrait of bagging applied to the unstable learners it was designed for.",
    "The dataset and every bootstrap resample come from a fixed seed, so the same controls always produce exactly the same ensemble.",
  ],
  references: [
    { label: "Breiman, Bagging Predictors (1996), Machine Learning 24(2)" },
    {
      label: "Freund & Schapire, A Decision-Theoretic Generalization of On-Line Learning and an Application to Boosting (1997), JCSS",
      href: "https://doi.org/10.1006/jcss.1997.1504",
    },
    { label: "Breiman, Random Forests (2001), Machine Learning 45(1)" },
    { label: "Hastie, Tibshirani & Friedman, The Elements of Statistical Learning (2009), chapter 10" },
  ],
  steps: [
    {
      title: "One rule, one straight cut",
      instruction: "A single decision stump splits on one axis at one threshold. Look at what it can and cannot do with a diagonal boundary.",
      observation: "It picks the best straight cut available and still gets a corner of each class wrong. No amount of tuning fixes this — the shape is beyond what one stump can express.",
    },
    {
      title: "Stack them up",
      instruction: "Now twelve stumps, each fitted to what the previous ones got wrong, voting in proportion to how well they did.",
      observation: "A staircase appears. Every step is still a straight axis-aligned cut; the diagonal exists only in the combination.",
    },
    {
      title: "The same budget, spent differently",
      instruction: "Twelve stumps again, but each fitted independently on its own resample and given an equal vote. Switch between the two methods.",
      observation: "Every bagged stump lands on almost the same cut, so twelve of them vote as one. The accuracy sits below what a single stump fitted on all the data manages.",
    },
    {
      title: "Add more of what is not working",
      instruction: "Drag the count to thirty with bagging selected, and watch the accuracy while you do it.",
      observation: "It does not move. Bagging averages away disagreement between learners, and stumps this stable never disagree — which is exactly why a random forest bags deep trees instead.",
    },
  ],
  challenges: [
    "How many boosted stumps does it take to beat thirty bagged ones? Try one, then two.",
    "Step through boosting one stump at a time and watch where each new cut lands. What does that tell you about which points still carry weight?",
    "Look at where the bagged cuts fall. Why do twelve independent resamples of ninety points produce almost the same stump every time?",
    "Bagging is a variance-reduction method shown here on a learner with no variance. What would you have to change about the weak learner to make bagging earn its keep?",
    "The accuracy shown is measured on the training data. Which of the two methods would you expect to suffer more on unseen data, and why?",
  ],
};
