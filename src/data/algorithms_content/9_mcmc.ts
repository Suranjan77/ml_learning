import { LearningModule } from "./types";

export const mcmc: LearningModule = {
  id: "mcmc",
  title: "Markov Chain Monte Carlo",
  category: "Markov Chain Monte Carlo",
  prerequisites: ["gmm-em"],
  tracks: ["practitioner"],
  difficulty: 3,
  relatedModules: ["gmm-em"],
  shortDescription: "A family of sampling algorithms that approximate hard probability distributions by constructing a Markov chain.",
  estimatedMinutes: 25,
  learningObjectives: [
    'Explain the mathematical foundation of Markov Chain Monte Carlo sampling',
    'Describe the Metropolis-Hastings acceptance ratio and its rationale',
    'Identify diagnostic metrics for MCMC convergence such as Gelman-Rubin $\\hat{R}$ and Effective Sample Size',
    'Explain the concept of burn-in or warm-up phase in MCMC',
  ],
  keyTerms: [
    { term: 'Markov Chain', definition: 'A sequence of random variables where the probability of the next state depends only on the current state.' },
    { term: 'Stationary Distribution', definition: 'A probability distribution that remains invariant under the transitions of the Markov chain.' },
    { term: 'Metropolis-Hastings', definition: 'A specific MCMC algorithm that uses proposal distributions and acceptance criteria to sample from target distributions.' },
  ],
  misconceptions: [
    {
      claim: 'MCMC samples are completely independent of each other.',
      correction: 'Because each step is proposed from the current position, adjacent samples are highly correlated. This autocorrelation reduces the effective sample size.'
    },
    {
      claim: 'The chain always converges to the true distribution immediately.',
      correction: 'MCMC chains require a "burn-in" or "warm-up" phase to discard early samples before the chain reaches its stationary distribution.'
    }
  ],
  references: [
    {
      title: "Markov Chains and Mixing Times",
      authors: "Levin, D.A. and Peres, Y",
      url: "https://www.ams.org",
      type: "textbook"
    },
    {
      title: "Handbook of Markov Chain Monte Carlo",
      authors: "Brooks, S. et al",
      url: "https://www.crcpress.com",
      type: "textbook"
    }
  ],
  failureModes: [
    {
      name: 'Poor Mixing',
      description: 'If the proposal step size is too small, the chain explores very slowly. If the step size is too large, proposed steps are almost always rejected.',
      mitigation: 'Tune proposal variance, use adaptive samplers, or switch to Hamiltonian Monte Carlo (HMC).'
    }
  ],

  fullDescription: `
Markov Chain Monte Carlo (MCMC) is used when a probability distribution is known up to proportionality, but direct integration or exact sampling is too difficult. This is common in Bayesian inference, where the posterior may be high-dimensional and analytically intractable.

MCMC builds a Markov chain whose stationary distribution is the target distribution. After warm-up, the visited states behave like dependent samples from that target. Histograms, expectations, credible intervals, and posterior summaries can then be estimated from those samples.

### Where is it used?
MCMC is used in Bayesian modeling, physics simulation, hierarchical medical models, ecological inference, and risk analysis when closed-form calculations are not available.
  `,

  intuition: `
Imagine a landscape where height represents probability density. The sampler proposes nearby moves. Moves to higher-density regions are usually accepted, but some lower-density moves are accepted too.

That occasional willingness to move downhill matters. It keeps the chain from getting trapped at one local peak and lets it explore the distribution. The result is not a perfect map, but an approximation that improves with better proposals, diagnostics, and enough effective samples.
  `,

  mathematics: `
### 1. The Metropolis-Hastings Algorithm
To map out a target probability distribution $P(x)$, the algorithm is currently at state $x$. It proposes a random jump to a new state $x'$. It then calculates an acceptance ratio ($\\alpha$):

$$ \\alpha = \\min\\left(1, \\frac{P(x')}{P(x)}\\right) $$

This ratio asks whether the proposed state is more probable than the current state.
If $P(x')$ is greater than $P(x)$, the ratio is 1, and the algorithm *always* moves to the new spot. 
If the proposed state is less probable, the algorithm may still accept it with probability $\\alpha$. Otherwise, it stays at $x$ and records the current state again.

### 2. Why it works
Allowing occasional lower-density moves is crucial because it improves exploration. In practice, you still need convergence diagnostics, warm-up removal, and effective sample size checks before trusting the estimates.
  `,

  pros: [
    "It can estimate posterior quantities for models where direct integration is not feasible.",
    "It does not require a Gaussian posterior and can represent skewed, correlated, or multi-modal distributions if the chain mixes well."
  ],

  cons: [
    "It is notoriously slow. Taking millions of tiny random steps takes a lot of computing power and time.",
    "It can be very difficult to know exactly when the algorithm has 'finished' mapping the mountain. You often have to run multiple walkers at the same time to check if they agree."
  ],

  codeSnippet: `import numpy as np

# Let's build a simple MCMC walker!
def target_density(x):
    # A weird, two-peaked math equation we want to map
    return np.exp(-0.5 * (x - 2)**2) + 0.5 * np.exp(-0.5 * (x + 2)**2)

current_x = 0.0
samples = []
n_iterations = 10000

for _ in range(n_iterations):
    # Propose a random step
    proposed_x = current_x + np.random.normal(0, 1.5)
    
    # Calculate if the new spot is better or worse
    acceptance_ratio = target_density(proposed_x) / target_density(current_x)
    
    # Roll the dice to see if we accept the move!
    if np.random.rand() < acceptance_ratio:
        current_x = proposed_x
        
    samples.append(current_x)

print(f"We took {len(samples)} steps to map the mountain!")`,
  tldr: [
    'MCMC approximates a hard target distribution $p(x)$ by simulating a **Markov chain** whose stationary distribution is exactly $p(x)$; after warm-up, the visited states behave like (correlated) samples from $p$.',
    'It shines when you can evaluate $p(x)$ only **up to a normalizing constant** — typical of Bayesian posteriors $p(\\theta \\mid D) \\propto p(D \\mid \\theta)\\,p(\\theta)$ whose evidence integral is intractable.',
    'The **Metropolis-Hastings** acceptance ratio $A = \\min\\left(1, \\frac{p(x\')\\,q(x \\mid x\')}{p(x)\\,q(x\' \\mid x)}\\right)$ uses only **ratios** of $p$, so the unknown normalizer cancels.',
    'Correctness comes from **detailed balance**: the constructed transition leaves $p$ invariant, so the chain converges to the target regardless of where it starts.',
    'Practical use requires discarding **burn-in**, monitoring convergence ($\\hat{R}$, trace plots), and remembering that successive draws are **autocorrelated**, so the effective sample size is far below the raw count.',
  ],
  additionalSections: [
    {
      heading: 'Deriving the Metropolis-Hastings Acceptance Ratio',
      content: `
We want a Markov chain whose stationary distribution is the target $p(x)$. A *sufficient* condition for $p$ to be stationary is **detailed balance** (reversibility): for every pair of states the probability flux in each direction must match,

$$ p(x)\\,T(x' \\mid x) = p(x')\\,T(x \\mid x') $$

where $T(x' \\mid x)$ is the chain's transition kernel. If this holds, summing both sides over $x$ gives $\\sum_x p(x)\\,T(x' \\mid x) = p(x')\\sum_x T(x \\mid x') = p(x')$, i.e. one application of the kernel maps $p$ to itself — $p$ is **invariant**.

Metropolis-Hastings factors the transition into a **proposal** $q(x' \\mid x)$ followed by an **accept/reject** step with acceptance probability $A(x' \\mid x)$, so for $x' \\neq x$,

$$ T(x' \\mid x) = q(x' \\mid x)\\,A(x' \\mid x) $$

Plugging this into detailed balance and rearranging gives a single requirement on the acceptance probabilities:

$$ \\frac{A(x' \\mid x)}{A(x \\mid x')} = \\frac{p(x')\\,q(x \\mid x')}{p(x)\\,q(x' \\mid x)} $$

The Metropolis-Hastings choice that satisfies this — while keeping each $A \\le 1$ and accepting as often as possible — is

$$ A(x' \\mid x) = \\min\\left(1, \\; \\frac{p(x')\\,q(x \\mid x')}{p(x)\\,q(x' \\mid x)}\\right) $$

Notice that $p$ appears **only as the ratio** $p(x')/p(x)$. If $p(x) = \\tilde{p}(x)/Z$ for some unknown constant $Z$, the $Z$ cancels: $p(x')/p(x) = \\tilde{p}(x')/\\tilde{p}(x)$. This is the crux of why MCMC works for Bayesian posteriors — we never need the intractable evidence $Z = \\int \\tilde{p}(x)\\,dx$. When the proposal is **symmetric**, $q(x' \\mid x) = q(x \\mid x')$, the proposal terms cancel too and we recover the original Metropolis ratio $A = \\min\\left(1, \\frac{p(x')}{p(x)}\\right)$.
      `,
    },
    {
      heading: 'From Samples to Estimates: Burn-in and Effective Sample Size',
      content: `
Once the chain has reached its stationary distribution, we approximate a posterior expectation by a simple average over the retained draws:

$$ \\mathbb{E}_{p}[f(x)] \\approx \\frac{1}{N}\\sum_{t=1}^{N} f(x_t) $$

Two practical corrections stand between you and a trustworthy estimate. First, **burn-in (warm-up)**: the chain starts at an arbitrary point that may sit in a low-probability region, so the early states are *not* distributed according to $p$. We discard the first $B$ samples and average only over the rest.

Second, **autocorrelation**: because $x_{t+1}$ is proposed from $x_t$, consecutive draws are correlated. The variance of the Monte Carlo estimate is inflated relative to i.i.d. sampling, captured by the **effective sample size**

$$ \\text{ESS} = \\frac{N}{1 + 2\\sum_{k=1}^{\\infty}\\rho_k} $$

where $\\rho_k$ is the lag-$k$ autocorrelation. A chain of $N = 10{,}000$ draws with strong autocorrelation may have an ESS of only a few hundred — which is why mixing quality, not raw iteration count, governs estimate precision.
      `,
    },
  ],
  comparisons: [
    {
      title: 'MCMC vs Variational Inference vs Exact/Conjugate Inference',
      methods: ['MCMC (Metropolis-Hastings)', 'Variational Inference', 'Exact / Conjugate'],
      rows: [
        {
          dimension: 'Asymptotic accuracy',
          values: ['Exact in the limit of infinite samples', 'Approximate — biased by the chosen variational family', 'Exact (closed form)'],
        },
        {
          dimension: 'Speed',
          values: ['Slow — many serial iterations', 'Fast — cast as an optimization problem', 'Instant once the formula is derived'],
        },
        {
          dimension: 'Scalability to high dimensions / big data',
          values: ['Poor — mixing degrades and cost grows', 'Good — scales with stochastic gradient methods', 'N/A — only special models qualify'],
        },
        {
          dimension: 'Gives the true posterior?',
          values: ['Yes (asymptotically, as samples)', 'No — an approximation, often under-dispersed', 'Yes — the exact posterior'],
        },
        {
          dimension: 'Requires only an unnormalized density?',
          values: ['Yes — normalizer cancels', 'Yes — uses the unnormalized joint via the ELBO', 'No — relies on a known conjugate form'],
        },
      ],
      takeaway: 'Use exact/conjugate inference whenever the model admits it; otherwise trade accuracy for speed — MCMC for asymptotically exact (but slow) posteriors, variational inference for fast (but approximate) ones.',
    },
  ],
  usageGuidance: {
    useWhen: [
      'The posterior is **analytically intractable** (no conjugate form) and you need full uncertainty quantification, not just a point estimate.',
      'You can evaluate the target only **up to a normalizing constant** — e.g. an unnormalized Bayesian posterior $p(\\theta)\\,p(D \\mid \\theta)$.',
      'The posterior may be **skewed, correlated, or multi-modal**, so a Gaussian approximation would be misleading.',
    ],
    avoidWhen: [
      'The model has a **conjugate / closed-form** posterior — exact inference is faster and exact.',
      'You face **very high-dimensional** parameter spaces or massive datasets where MCMC mixes too slowly — consider variational inference or stochastic-gradient methods.',
      'You need an answer in **real time / under a tight latency budget** — MCMC requires many serial iterations and convergence checks.',
    ],
    rulesOfThumb: [
      'Always run **multiple chains** from dispersed starts and check Gelman-Rubin $\\hat{R} < 1.01$ before trusting results.',
      'For random-walk Metropolis, tune the proposal so the acceptance rate lands near the theoretically optimal $\\approx 23\\%$ (in high dimensions).',
      'Report **effective sample size**, not raw iteration count, as the measure of estimate precision.',
      'When mixing is poor or dimension is high, switch from random-walk Metropolis to gradient-based samplers like Hamiltonian Monte Carlo / NUTS.',
    ],
  },
  caseStudies: [
    {
      title: 'Optimal scaling of random-walk Metropolis',
      domain: 'Computational statistics / Bayesian inference',
      scenario: 'A practitioner sampling a high-dimensional posterior with random-walk Metropolis must choose the variance of the Gaussian proposal. Too small a step and the chain crawls (high acceptance but tiny moves); too large and almost every proposal is rejected (the chain stalls). The question is what acceptance rate to target.',
      approach: 'Roberts, Gelman and Gilks (1997) analyzed the diffusion limit of random-walk Metropolis as the dimension $d \\to \\infty$ for product targets, deriving the proposal scaling that maximizes the efficiency (effective sample size per iteration) of the resulting chain.',
      outcome: 'They showed the asymptotically optimal acceptance rate is $\\approx 0.234$ (about **23.4%**), achieved by scaling the proposal standard deviation like $2.38/\\sqrt{d}$. Tuning a sampler toward this $\\approx 23\\%$ acceptance target is now a standard practitioner rule of thumb that directly maximizes effective sample size per unit cost.',
      source: {
        title: 'Weak convergence and optimal scaling of random walk Metropolis algorithms (Annals of Applied Probability, 1997)',
        authors: 'Roberts, G.O., Gelman, A. and Gilks, W.R.',
        url: 'https://projecteuclid.org/journals/annals-of-applied-probability/volume-7/issue-1',
        type: 'paper',
      },
    },
  ],
  shortAnswerQuestions: [
    {
      question: 'Explain why the Metropolis-Hastings algorithm is uniquely suited for Bayesian inference where the evidence integral (normalizing constant) is intractable.',
      expectedAnswerRubric: 'The answer should explain that the Metropolis-Hastings acceptance ratio only requires the ratio of the target probabilities $p(x\')/p(x)$. Because the intractable normalizing constant $Z$ appears in both the numerator and denominator, it cancels out completely. This allows the algorithm to sample from the posterior distribution using only the unnormalized joint distribution $p(\\theta)p(D \\mid \\theta)$.'
    }
  ],
  quiz: [
    {
      question: 'What property guarantees that the Metropolis-Hastings chain leaves the target distribution $p$ invariant?',
      options: [
        { text: 'Detailed balance: $p(x)\\,T(x\' \\mid x) = p(x\')\\,T(x \\mid x\')$ for the transition kernel.', correct: true },
        { text: 'The proposal distribution must equal the target distribution.', correct: false },
        { text: 'The acceptance probability must always equal exactly $1$.', correct: false },
        { text: 'Samples must be drawn independently and identically distributed.', correct: false },
      ],
      explanation: 'Metropolis-Hastings is constructed so its transition kernel satisfies detailed balance with respect to $p$. Detailed balance is a sufficient condition for $p$ to be the stationary (invariant) distribution: summing the balance equation over the current state shows one application of the kernel maps $p$ to itself. The proposal need not match the target, acceptance is typically below $1$, and the samples are deliberately correlated.',
    },
    {
      question: 'What is the purpose of the "burn-in" (warm-up) period in MCMC?',
      options: [
        { text: 'To discard early samples drawn before the chain has reached its stationary distribution.', correct: true },
        { text: 'To increase the autocorrelation between successive samples.', correct: false },
        { text: 'To compute the normalizing constant of the target.', correct: false },
        { text: 'To make every proposed move guaranteed to be accepted.', correct: false },
      ],
      explanation: 'The chain starts at an arbitrary point that is generally not distributed according to the target $p$, so the initial states are biased toward the starting location. Discarding this burn-in period removes those non-stationary samples so that estimates are computed only over draws that approximate $p$. It does not compute $Z$, does not force acceptance, and aims to reduce (not increase) bias.',
    },
    {
      question: 'Why can a chain of 50,000 stored MCMC draws behave like far fewer independent samples?',
      options: [
        { text: 'Successive draws are autocorrelated, so the effective sample size is much smaller than the raw count.', correct: true },
        { text: 'MCMC always throws away exactly 90% of its samples automatically.', correct: false },
        { text: 'The normalizing constant shrinks the number of usable samples.', correct: false },
        { text: 'Stored samples are always perfectly independent, so 50,000 is the effective count.', correct: false },
      ],
      explanation: 'Because each state is proposed from the previous one, consecutive draws are positively correlated. The effective sample size $\\text{ESS} = N / (1 + 2\\sum_k \\rho_k)$ can be orders of magnitude below $N$ when autocorrelation is strong, inflating the Monte Carlo error. Precision is therefore governed by ESS, not the raw number of stored draws.',
    },
  ],
  review: {
    lastReviewed: '2026-06-15',
    reviewedBy: 'Suranjan',
    status: 'published',
  },
};
