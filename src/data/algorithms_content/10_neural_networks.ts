import { Algorithm } from "./types";

export const neuralNetworks: Algorithm = {
  id: "neural-networks",
  title: "Neural Networks & Deep Learning",
  category: "Neural Networks / Deep Learning",
  shortDescription: "Massive, interconnected layers of simple math equations that can learn to recognize incredibly complex patterns on their own.",

  fullDescription: `
Neural Networks are the engine behind the modern AI revolution. They are built using layers of interconnected "neurons" (which are really just simple math equations). Instead of a human programmer having to explicitly write rules (like "if it has fur and pointy ears, it's a cat"), you just feed the network thousands of pictures of cats, and it figures out the rules by itself.

"Deep Learning" simply refers to Neural Networks that have many, many layers stacked on top of each other. This deep structure gives them a massive amount of computational power, allowing them to approximate almost any complex relationship in the universe, provided you give them enough data and computing power.

### Where is it used?
Everywhere. They are the undisputed champions of modern AI. They power Large Language Models (like ChatGPT), self-driving cars, facial recognition on your phone, real-time language translation, and advanced medical imaging systems that can detect cancer better than human doctors.
  `,

  intuition: `
Imagine a factory assembly line trying to identify if a photo contains a car. 

The workers at the very start of the line (the first layer) only look at tiny, zoomed-in pixels. They can only recognize basic things like straight edges or simple curves. They pass their findings to the next group of workers.

The second layer of workers looks at those edges and curves and combines them. They might say, "Ah, these curves make a circle!" or "These edges make a rectangle!" They pass this up the chain.

The deep layers combine those shapes into concepts: "I see two circles and a rectangle... that looks like wheels and a chassis!" Finally, the boss at the very end of the line (the output layer) looks at the high-level concepts and confidently shouts, "It's a car!"
  `,

  mathematics: `
### 1. The Forward Pass
A basic Neural Network layer takes your input data ($x$), multiplies it by a set of weights ($W$), adds a bias ($b$), and then passes the result through an "activation function" ($f$) to introduce non-linearity (so it can learn curves, not just straight lines):

$$ z^{(1)} = W^{(1)}x + b^{(1)} $$
$$ a^{(1)} = f(z^{(1)}) $$
$$ \\hat{y} = W^{(2)}a^{(1)} + b^{(2)} $$

### 2. Backpropagation (How it learns)
When the network makes a guess, it calculates how wrong it was (the Loss, $\\mathcal{L}$). To learn, it needs to figure out exactly which weights caused the mistake. It uses a calculus technique called the Chain Rule to trace the error backwards through the network, from the final answer all the way back to the first layer:

$$ \\frac{\\partial \\mathcal{L}}{\\partial W^{(1)}} = \\frac{\\partial \\mathcal{L}}{\\partial a^{(1)}} \\frac{\\partial a^{(1)}}{\\partial z^{(1)}} \\frac{\\partial z^{(1)}}{\\partial W^{(1)}} $$

Once it knows exactly how much each weight contributed to the error, it tweaks them all slightly in the correct direction. It repeats this process millions of times until the error is as close to zero as possible.
  `,

  pros: [
    "They are incredibly powerful. Given enough data and layers, they can learn to solve almost any pattern-recognition problem.",
    "They do the hard work for you. You don't need to manually figure out what features are important; the network learns them automatically.",
    "They scale incredibly well. You can train them on massive supercomputers using specialized hardware (GPUs)."
  ],

  cons: [
    "They are the ultimate 'Black Box'. It is notoriously difficult to look inside a trained neural network and understand *why* it made a specific decision.",
    "They require a massive amount of data to work well. If you only have a few hundred examples, a Random Forest will usually beat a Neural Network.",
    "They are incredibly expensive and slow to train, requiring specialized, power-hungry hardware."
  ],

  codeSnippet: `import torch
import torch.nn as nn
import torch.optim as optim

# Build a simple Neural Network with PyTorch
class SimpleNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(10, 32), # Input layer
            nn.ReLU(),         # Activation function
            nn.Linear(32, 16), # Hidden layer
            nn.ReLU(),         # Activation function
            nn.Linear(16, 1),  # Output layer
            nn.Sigmoid()       # Squish output between 0 and 1
        )
        
    def forward(self, x):
        return self.layers(x)

model = SimpleNetwork()
criterion = nn.BCELoss() # How we measure mistakes
optimizer = optim.Adam(model.parameters(), lr=0.01) # How we update weights

# Fake data: 8 examples, 10 features each
x_batch = torch.randn(8, 10)
y_batch = torch.empty(8, 1).random_(2)

# The Learning Loop!
optimizer.zero_grad()                 # Clear old math
predictions = model(x_batch)          # 1. Make a guess (Forward pass)
loss = criterion(predictions, y_batch)# 2. Calculate the mistake
loss.backward()                       # 3. Figure out who to blame (Backpropagation)
optimizer.step()                      # 4. Tweak the weights to do better next time!

print(f"Current Error (Loss): {loss.item():.4f}")`
};
