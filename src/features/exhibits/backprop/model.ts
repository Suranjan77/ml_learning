export interface NetworkWeights {
  inputHidden: [[number, number], [number, number]];
  hiddenBias: [number, number];
  hiddenOutput: [number, number];
  outputBias: number;
}

export interface ForwardPass {
  input: [number, number];
  hidden: [number, number];
  output: number;
  loss: number;
}

export type Gradients = NetworkWeights;

export const INITIAL_WEIGHTS: NetworkWeights = {
  inputHidden: [[0.6, -0.4], [-0.3, 0.8]],
  hiddenBias: [0.1, -0.2], hiddenOutput: [0.7, -0.5], outputBias: 0.05,
};

const sigmoid = (value: number) => 1 / (1 + Math.exp(-value));

export function forward(input: [number, number], target: number, weights: NetworkWeights): ForwardPass {
  const hidden: [number, number] = [0, 1].map((hiddenIndex) => sigmoid(
    input[0] * weights.inputHidden[0][hiddenIndex]
    + input[1] * weights.inputHidden[1][hiddenIndex]
    + weights.hiddenBias[hiddenIndex],
  )) as [number, number];
  const output = sigmoid(hidden[0] * weights.hiddenOutput[0] + hidden[1] * weights.hiddenOutput[1] + weights.outputBias);
  const clipped = Math.max(1e-8, Math.min(1 - 1e-8, output));
  const loss = -(target * Math.log(clipped) + (1 - target) * Math.log(1 - clipped));
  return { input, hidden, output, loss };
}

export function gradients(input: [number, number], target: number, weights: NetworkWeights): Gradients {
  const pass = forward(input, target, weights);
  const outputDelta = pass.output - target;
  const hiddenDelta: [number, number] = [0, 1].map((index) =>
    outputDelta * weights.hiddenOutput[index] * pass.hidden[index] * (1 - pass.hidden[index]),
  ) as [number, number];
  return {
    hiddenOutput: [outputDelta * pass.hidden[0], outputDelta * pass.hidden[1]],
    outputBias: outputDelta,
    inputHidden: [
      [hiddenDelta[0] * input[0], hiddenDelta[1] * input[0]],
      [hiddenDelta[0] * input[1], hiddenDelta[1] * input[1]],
    ],
    hiddenBias: hiddenDelta,
  };
}

export function applyGradients(weights: NetworkWeights, gradient: Gradients, learningRate: number): NetworkWeights {
  return {
    inputHidden: weights.inputHidden.map((row, i) => row.map((value, j) => value - learningRate * gradient.inputHidden[i][j])) as NetworkWeights["inputHidden"],
    hiddenBias: weights.hiddenBias.map((value, i) => value - learningRate * gradient.hiddenBias[i]) as [number, number],
    hiddenOutput: weights.hiddenOutput.map((value, i) => value - learningRate * gradient.hiddenOutput[i]) as [number, number],
    outputBias: weights.outputBias - learningRate * gradient.outputBias,
  };
}
