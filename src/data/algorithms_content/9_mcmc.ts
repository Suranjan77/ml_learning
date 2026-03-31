import { Algorithm } from "./types";

export const mcmc: Algorithm = {
  id: "mcmc",
  title: "Markov Chain Monte Carlo",
  category: "Markov Chain Monte Carlo",
  shortDescription: "A clever way to map out incredibly complex probabilities by taking a randomized, guided 'walk' through the data.",

  fullDescription: `
Markov Chain Monte Carlo (MCMC) is a family of algorithms used to solve some of the hardest problems in statistics. In advanced Bayesian statistics, you often end up with a math equation for a probability distribution that is so complex, it is literally impossible to solve directly. 

Instead of trying to solve the impossible math, MCMC algorithms use a clever trick: they build a simulation. They create a "Markov Chain"—a sequence of random steps—that wanders through the mathematical space. By carefully setting the rules for how this random walk behaves, the algorithm will naturally spend more time in areas of high probability and less time in areas of low probability. By just keeping track of where the algorithm walked, you get a perfect map of the complex math equation you couldn't solve!

### Where is it used?
MCMC is the heavy artillery of statistics. It is used when standard approximations fail. It's heavily used in complex physics simulations, advanced medical research (like modeling how a disease spreads through different levels of a population), and high-end financial risk analysis.
  `,

  intuition: `
Imagine you are blindfolded and dropped onto a massive, complex mountain range, and your goal is to draw a topographical map of the whole area. You can't see, but you have an altimeter that tells you your current height.

Here is your strategy: You take a random step in any direction. If that step takes you *uphill*, you always take it. If that step takes you *downhill*, you roll a pair of dice. If you roll high, you take the step; if you roll low, you stay where you are. 

If you do this for a million steps and drop a GPS pin at every location you visit, you will spend most of your time near the mountain peaks, and very little time in the deep valleys. If someone looks at your million GPS pins, they will see a perfect 3D map of the mountain range, even though you were blindfolded the whole time!
  `,

  mathematics: `
### 1. The Metropolis-Hastings Algorithm
To map out a target probability distribution $P(x)$, the algorithm is currently at state $x$. It proposes a random jump to a new state $x'$. It then calculates an acceptance ratio ($\\alpha$):

$$ \\alpha = \\min\\left(1, \\frac{P(x')}{P(x)}\\right) $$

This ratio simply asks: "Is the new spot more probable than my current spot?" 
If $P(x')$ is greater than $P(x)$, the ratio is 1, and the algorithm *always* moves to the new spot. 
If the new spot is worse, it calculates the fraction (e.g., 0.4). It then generates a random number $u$ between 0 and 1. If $u \\le 0.4$, it accepts the bad move anyway! Otherwise, it stays at $x$.

### 2. Why it works
Allowing the algorithm to occasionally make "bad" moves (going downhill) is crucial. It prevents the algorithm from getting permanently stuck on a small, fake peak (a local maximum) and allows it to explore the entire mathematical landscape. Given enough time, the places it visits will perfectly match the true target distribution.
  `,

  pros: [
    "It can solve incredibly complex statistical problems that are mathematically impossible to solve any other way.",
    "It doesn't rely on assuming your data looks like a standard Bell Curve. It can map out weird, lopsided, and multi-peaked distributions perfectly."
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

print(f"We took {len(samples)} steps to map the mountain!")`
};
