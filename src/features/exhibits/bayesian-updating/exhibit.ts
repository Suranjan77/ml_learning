import type { ExhibitDefinition } from "../types";

export const bayesianUpdatingExhibit: ExhibitDefinition = {
  slug: "bayesian-updating",
  title: "Prior, likelihood, posterior",
  question: "When does the data overrule what you already believed?",
  summary:
    "Set a belief about an unknown rate, then feed in observations and watch the posterior get pulled away from the prior and towards the data — slowly if you were confident, immediately if you were not.",
  insight:
    "A posterior is not a compromise chosen by judgement: it is the prior multiplied by the likelihood, point by point. How far it travels is decided by how much data you have relative to how strong your prior was — a prior worth twenty observations is overruled by two hundred and barely dented by five. Maximum likelihood is the limit you reach by refusing to have a prior at all, which is a choice rather than the absence of one.",
  topic: "Probabilistic inference",
  difficulty: "Intermediate",
  duration: 6,
  renderer: "SVG",
  tags: [
    "Bayes",
    "prior",
    "posterior",
    "likelihood",
    "Bayesian inference",
    "maximum likelihood",
    "MAP",
    "conjugate prior",
    "Beta distribution",
    "credible interval",
    "belief updating",
    "probabilistic foundations",
  ],
  related: ["classification-threshold", "overfitting", "regression-boundary"],
  assumptions: [
    "The unknown quantity is a single rate between 0 and 1, and observations are independent successes and failures. Real inference problems usually have many parameters at once.",
    "The prior is a Beta distribution, which is conjugate to this likelihood — that is why the posterior can be drawn exactly rather than sampled. Most real priors are not conjugate and need the sampling machinery this exhibit deliberately avoids.",
    "Prior strength is shown as a count of notional prior observations, which is exactly what the Beta parameters mean here. That interpretation does not carry over to every prior.",
    "The likelihood is rescaled to share a vertical axis with the two distributions. It is a function of the rate, not a probability distribution over it, and its height alone carries no meaning.",
    "Observations are summarised by a proportion, so changing the count keeps the same success rate rather than drawing a fresh sample.",
  ],
  references: [
    { label: "Gelman, Carlin, Stern, Dunson, Vehtari & Rubin, Bayesian Data Analysis (2013), chapter 2" },
    { label: "MacKay, Information Theory, Inference and Learning Algorithms (2003), chapter 3" },
    { label: "Bishop, Pattern Recognition and Machine Learning (2006), §2.1" },
    {
      label: "Efron, Bayes' Theorem in the 21st Century (2013), Science",
      href: "https://doi.org/10.1126/science.1236536",
    },
  ],
  steps: [
    {
      title: "Start with a belief",
      instruction: "Nothing has been observed yet. The posterior sits exactly on top of the prior, because there is nothing to update with.",
      observation: "The prior is worth twenty notional observations. Note how wide it is — that width is the belief's uncertainty, not its error.",
    },
    {
      title: "Add a little evidence",
      instruction: "Ten observations arrive, seventy per cent of them successes. Watch how far the posterior moves.",
      observation: "It moves, but not far. Ten observations against a prior worth twenty leaves the prior with two-thirds of the say.",
    },
    {
      title: "Let the evidence pile up",
      instruction: "Now two hundred observations at the same rate. Drag the observation count yourself and watch the posterior slide.",
      observation: "The posterior has left the prior behind and settled on the likelihood. It has also become far narrower: more data buys both a different answer and more confidence in it.",
    },
    {
      title: "Change how sure you were",
      instruction: "Same data, different conviction. Drag prior strength from 2 to 80 and watch the posterior refuse to move.",
      observation: "A strong prior needs proportionally more evidence to shift. Nothing about the data changed — only how much of a hearing you were willing to give it.",
    },
  ],
  challenges: [
    "With a prior worth 20 observations centred on 0.3, how many observations at 0.8 does it take before the posterior mean passes 0.6?",
    "Set prior strength to its minimum. How closely does the posterior peak track the maximum likelihood estimate, and why does it never quite reach it?",
    "Find a prior and a dataset that disagree, then make the posterior sit closer to the prior than to the data. What had to be true?",
    "Hold the observation count at 40 and sweep the observed rate. Does the width of the posterior change, or only its position?",
  ],
};
