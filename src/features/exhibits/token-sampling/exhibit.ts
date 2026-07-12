import type { ExhibitDefinition } from "../types";

export const tokenSamplingExhibit: ExhibitDefinition = {
  slug: "token-sampling",
  title: "Token sampling",
  question: "How do temperature and truncation change what a language model writes?",
  summary:
    "Adjust temperature and truncation over a hand-authored next-token distribution, then sample to see which continuation gets picked.",
  insight:
    "Temperature reshapes how concentrated a distribution is, and top-k or top-p remove unlikely tokens before sampling. Both change what gets written without changing which token was most likely.",
  topic: "Language models",
  difficulty: "Approachable",
  duration: 5,
  renderer: "SVG",
  tags: ["language model", "softmax", "temperature", "probability", "sampling", "decoding"],
  related: ["attention"],
  steps: [
    {
      title: "Read the distribution",
      instruction: "Sample a few tokens at the default temperature and watch which ones appear.",
      observation:
        "This distribution is a hand-authored illustration: ‘dusk’ is the clear favourite, with a run of sensible alternatives and an implausible tail.",
    },
    {
      title: "Lower the temperature",
      instruction: "Drop the temperature well below the default and sample again.",
      observation:
        "Compared with the default, a low temperature sharpens the distribution toward the favourite token, so sampling returns it far more often.",
    },
    {
      title: "Cut the tail with top-p",
      instruction: "Switch to top-p truncation and read the nucleus marker on the chart.",
      observation:
        "Top-p removes the low-probability tail before sampling ever runs, even though the untruncated distribution still assigns those tokens a small weight.",
    },
    {
      title: "Raise the temperature",
      instruction: "Remove truncation, raise the temperature well above the default, and sample repeatedly.",
      observation:
        "At a high temperature the tail token becomes reachable; enough draws will eventually surface even the implausible one.",
    },
  ],
  challenges: [
    "Find temperature and truncation settings where the tail token ‘spaghetti’ gets sampled.",
    "Find the lowest temperature at which repeated sampling still returns more than one token.",
  ],
};
