import { Algorithm } from "./types";

export const calculus: Algorithm = {
  id: "calculus",
  title: "Calculus & Optimisation",
  category: "Calculus",
  shortDescription: "The math behind how AI learns from its mistakes by finding the fastest way to improve.",

  fullDescription: `
Machine learning is really just a giant game of "getting better through trial and error." During training, an AI model tries to find the best possible settings to make the fewest mistakes. **Calculus is the math of continuous change**, and it gives our models the exact instructions they need to improve.

While linear algebra helps us calculate *how wrong* our model's predictions are, calculus tells us exactly *how to fix* the model's internal settings to make fewer mistakes next time. Without calculus, AI would just be guessing randomly. With it, models can take smart, calculated steps to get better after every single example they see.

### Moving Beyond High School Math

In high school calculus, you might have looked at simple curves with one variable, like $f(x)$. But modern AI models have millions or even billions of variables (we call them weights). Because of this, we need **Multivariate Calculus**. 

Instead of finding a single slope, the AI calculates a **Gradient**—a mathematical arrow made up of many slopes that points in the direction where the error increases the fastest. By taking a step in the *opposite* direction (a process called Gradient Descent), models like neural networks slowly walk down the hill until they reach the bottom, where the error is lowest.

The explosion of modern AI is mostly thanks to a specific trick from calculus called the **Chain Rule**. In computer science, we call this *backpropagation*. It's a clever way to figure out exactly how much a single tiny weight deep inside a neural network contributed to a mistake made at the very end.
  `,

  intuition: `
Imagine you're blindfolded and dropped somewhere in a hilly landscape. Your goal is to find the lowest point in the deepest valley (which represents making zero mistakes). Since you're blindfolded, you can't just look around and walk straight to the bottom.

Calculus is like feeling the slope of the ground right under your feet. 
By feeling the ground, you can figure out which way is uphill and which way is downhill. You then take a small step downhill. If you keep doing this—feeling the slope and taking a step down—you'll eventually reach the bottom of a valley.

In machine learning:
1. **The Landscape** is the error surface (all the possible mistakes the model could make).
2. **Your Coordinates** are the model's current settings (weights).
3. **Feeling the slope** is calculating the gradient vector $\\nabla L$.
4. **Taking a step downhill** is updating the model's weights to be slightly better.
  `,

  mathematics: `
### 1. The Derivative
A derivative simply measures how fast something is changing at a specific moment. Mathematically, it looks like this:

$$ f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h} $$

In machine learning, if $f(x)$ is our error (or loss), the derivative $f'(x)$ tells us exactly how much our error will go up or down if we tweak our parameter $x$ just a tiny bit.

### 2. Partial Derivatives and the Gradient
When we have lots of parameters $\\mathbf{w} = [w_1, w_2, ..., w_n]$, we calculate the slope for each one individually while pretending the others are frozen. When we put all these individual slopes together into a list, we call it the **Gradient**, $\\nabla L$:

$$ \\nabla L(\\mathbf{w}) = \\begin{bmatrix} \\frac{\\partial L}{\\partial w_1} \\\\ \\frac{\\partial L}{\\partial w_2} \\\\ \\vdots \\\\ \\frac{\\partial L}{\\partial w_n} \\end{bmatrix} $$

To improve the model, we subtract a small fraction of this gradient from our current weights. The size of the step we take is controlled by a setting called the learning rate, $\\alpha$:
$$ \\mathbf{w}_{new} = \\mathbf{w}_{old} - \\alpha \\nabla L(\\mathbf{w}_{old}) $$

### 3. The Chain Rule
The Chain Rule is the true hero of deep learning. It tells us how to find the derivative of functions that are stuffed inside other functions. If $y = f(u)$ and $u = g(x)$, the rule says:

$$ \\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx} $$

Neural networks are basically just giant chains of functions: $Output = f_3(f_2(f_1(X)))$. The chain rule lets us work backwards from the final error, multiplying slopes together to figure out exactly how to adjust every single weight in the network.
  `,

  pros: [
    "It's the engine behind gradient descent, which is how almost all modern neural networks learn.",
    "The Chain Rule (via backpropagation) makes it incredibly efficient to train massive, deep networks.",
    "For simple problems (like linear regression), calculus can give us a math equation to find the absolute perfect answer instantly.",
    "It lets us use advanced tricks (like looking at the curvature of the error landscape) to speed up learning."
  ],

  cons: [
    "Calculus only works on smooth, continuous math functions. It can't handle sudden jumps or rigid rules like decision trees.",
    "Models can get stuck in 'local minima'—shallow valleys that aren't the true bottom, but the math thinks we're done because the ground is flat.",
    "Vanishing Gradients: In very deep networks, multiplying lots of tiny slopes together makes the final update so small that the AI stops learning.",
    "Exploding Gradients: On the flip side, multiplying large slopes together can cause updates to spiral out of control and crash the math."
  ],

  codeSnippet: ``
};
