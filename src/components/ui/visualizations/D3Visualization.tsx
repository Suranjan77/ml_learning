"use client";

import React from "react";
import {
  COLORS,
  VisualizationShell,
} from "../visualizationPrimitives";

import LinearRegressionViz from "./LinearRegressionViz";
import LogisticRegressionViz from "./LogisticRegressionViz";
import KNNViz from "./KNNViz";
import DecisionTreeViz from "./DecisionTreeViz";
import SVMViz from "./SVMViz";
import KMeansViz from "./KMeansViz";
import EnsembleViz from "./EnsembleViz";
import PCAViz from "./PCAViz";
import MCMCViz from "./MCMCViz";

import NeuralNetworkViz from "./NeuralNetworkViz";
import CNNViz from "./CNNViz";
import ComputerVisionViz from "./ComputerVisionViz";
import NLPEmbeddingsViz from "./NLPEmbeddingsViz";
import AutoencoderViz from "./AutoencoderViz";
import TransformerViz from "./TransformerViz";
import LLMViz from "./LLMViz";
import RLViz from "./RLViz";
import GenerativeViz from "./GenerativeViz";

import RegularizationViz from "./RegularizationViz";
import NaiveBayesViz from "./NaiveBayesViz";
import GMMEMViz from "./GMMEMViz";
import BackpropagationViz from "./BackpropagationViz";
import SequenceModelsViz from "./SequenceModelsViz";
import EmbeddingsTokenizationViz from "./EmbeddingsTokenizationViz";
import RAGViz from "./RAGViz";
import AIAgentsViz from "./AIAgentsViz";
import FineTuningViz from "./FineTuningViz";
import LLMEvalSafetyViz from "./LLMEvalSafetyViz";
import AIInferenceViz from "./AIInferenceViz";
import ImageSegmentationViz from "./ImageSegmentationViz";
import VisionTransformersViz from "./VisionTransformersViz";
import DiffusionViz from "./DiffusionViz";
import ModelEvaluationViz from "./ModelEvaluationViz";
import GradientBoostingViz from "./GradientBoostingViz";
import OptimizationOptimizersViz from "./OptimizationOptimizersViz";
import ObjectDetectionViz from "./ObjectDetectionViz";
import CnnArchitecturesViz from "./CnnArchitecturesViz";
import SelfSupervisedVisionViz from "./SelfSupervisedVisionViz";
import VisionLanguageModelsViz from "./VisionLanguageModelsViz";

interface VizMetadata {
  title: string;
  subtitle: string;
  insight: string;
  legend?: Array<{ label: string; color: string }>;
}

const extendedVisualizations: Record<
  string,
  {
    component: React.ComponentType;
    title: string;
    subtitle: string;
    insight: string;
  }
> = {
  "naive-bayes": {
    component: NaiveBayesViz,
    title: "Spam Filter: Every Word Tugs the Verdict",
    subtitle: "Toggle words in the email; each one pulls the decision toward spam or ham by how often it appears in each, until the running total crosses the 50/50 line.",
    insight: "Naive Bayes adds up each word's log-likelihood ratio, so one strong word can tip a borderline email across the decision line.",
  },
  "gmm-em": {
    component: GMMEMViz,
    title: "Gaussian Mixtures and Expectation-Maximization",
    subtitle: "Alternate soft assignments and parameter updates for a mixture model.",
    insight: "EM improves latent-variable models by alternating inference and parameter estimation.",
  },
  backpropagation: {
    component: BackpropagationViz,
    title: "Backprop: Assigning Blame for the Error",
    subtitle: "A neuron predicts the wrong number. Watch the error flow backward and split into a gradient on each weight — then step downhill and watch the loss fall.",
    insight: "Backpropagation computes every weight's gradient in one backward sweep by passing blame through the chain rule, which is what makes training large models feasible.",
  },
  "sequence-models": {
    component: SequenceModelsViz,
    title: "Why RNNs Forget: Memory Decays Exponentially",
    subtitle: "Each time step multiplies the signal by the same factor. Drag it: below 1 the start of the sequence fades to nothing, above 1 it explodes, and only near 1 does memory survive a long sequence.",
    insight: "Repeated multiplication across time steps is exponential, so a plain RNN's memory either vanishes or explodes — which is exactly why LSTMs, gradient clipping, and attention exist.",
  },
  "embeddings-tokenization": {
    component: EmbeddingsTokenizationViz,
    title: "The Model Sees Tokens, Not Words",
    subtitle: "Before anything else, a tokenizer chops text into subword pieces with integer IDs. Type a sentence and watch common words stay whole while rare or long ones shatter into pieces — and the token count climb.",
    insight: "Models read a fixed vocabulary of subword tokens, not words, so 'tokenization' is two tokens and your API cost and context window are measured in tokens.",
  },
  rag: {
    component: RAGViz,
    title: "Retrieval-Augmented Generation: Grounding the Answer",
    subtitle: "Ask about a private fact the model never trained on. With retrieval off it confidently makes one up; turn it on and the matching document is pulled from the knowledge base, so the answer becomes correct and cited.",
    insight: "RAG fixes hallucination without retraining by retrieving the most relevant documents at question time and answering from them — so quality hinges on the retrieval step.",
  },
  "ai-agents": {
    component: AIAgentsViz,
    title: "The ReAct Loop: Think, Act, Observe, Repeat",
    subtitle: "Step through an agent chasing a compound goal it cannot answer from memory alone. Each click advances one Thought, Action, or Observation — watch the tool calls run for real and the history grow until the agent has enough grounded facts to answer.",
    insight: "An agent is an LLM wrapped in a loop that interleaves reasoning with real tool calls, feeding each tool's actual result back into the next reasoning step — that grounding in real observations is what lets it solve multi-step goals a single LLM call cannot.",
  },
  "fine-tuning": {
    component: FineTuningViz,
    title: "LoRA: Adapt a Giant Model by Training a Sliver",
    subtitle: "Full fine-tuning retrains every weight in a layer. LoRA freezes them and trains two thin low-rank matrices instead — drag the rank and watch the trainable count stay a tiny fraction of the whole.",
    insight: "A weight update can be approximated by two small low-rank matrices, so LoRA specializes a model by training under ~1% of its parameters — cheap to train, store, and swap.",
  },
  "llm-evaluation-safety": {
    component: LLMEvalSafetyViz,
    title: "No Single Best Model: Picking by Priorities",
    subtitle: "Three models trade quality and safety against cost and speed. Reweight what matters — or pick a use-case preset — and watch the top model flip. There is no winner on every axis.",
    insight: "Model selection is multi-objective: capability, safety, cost, and latency trade off, so the right choice depends on which axes your use case weights — and safety is a first-class axis.",
  },
  "ai-inference": {
    component: AIInferenceViz,
    title: "The Memory Wall: Will This Model Even Run?",
    subtitle: "Weights plus a growing KV cache must fit in GPU VRAM. Push the model size, context, or batch and the bar overflows the GPU's limit into OUT OF MEMORY — then quantize and watch it fit again.",
    insight: "Inference is memory-bound: weights are fixed but the KV cache grows with context and batch, so quantization and hardware limits decide whether a model can serve at all.",
  },
  "image-segmentation": {
    component: ImageSegmentationViz,
    title: "Segmentation: A Class for Every Pixel, Scored by Overlap",
    subtitle: "A model predicts a per-pixel probability that each cell belongs to the object. Drag the threshold to turn those probabilities into a hard mask and watch Dice and IoU rise and fall as misses and false alarms trade off.",
    insight: "Segmentation is per-pixel classification graded by mask overlap (Dice / IoU), so the threshold trades recall against precision — there is a sweet spot that maximizes overlap.",
  },
  "vision-transformers": {
    component: VisionTransformersViz,
    title: "Patches, Not Pixels: A Global Receptive Field in One Layer",
    subtitle: "Pick any patch as the attention query and watch where it looks. In ViT mode it attends across the whole image to patches with similar content; switch to CNN mode and it is boxed into a 3×3 neighborhood — the locality bias a Vision Transformer trades away.",
    insight: "A Vision Transformer turns an image into a sequence of patch tokens and lets every patch attend to every other one, so a single self-attention layer already has a global, content-based receptive field — flexibility that costs data but pays off at scale.",
  },
  "diffusion-models": {
    component: DiffusionViz,
    title: "Bury an Image in Noise, Then Learn to Dig It Out",
    subtitle: "Slide the diffusion step right to watch the closed-form forward process mix shrinking signal with growing noise until the image is pure static; slide left to imagine the reverse process, and watch the model's single-step denoised estimate sharpen as the noise recedes.",
    insight: "Diffusion defines a fixed forward process that turns any image into Gaussian noise, then trains a network to reverse it — so generation starts from pure noise and denoises step by step, and denoising is easy near the data but hard far from it.",
  },
  "model-evaluation": {
    component: ModelEvaluationViz,
    title: "One Model, Many Operating Points: The Threshold Sweep",
    subtitle: "Drag the decision threshold and watch the confusion matrix, precision, recall, and F1 all move while the pink dot slides along a fixed ROC curve. The model never changes — only where you choose to operate it does.",
    insight: "Classification quality is not one number: the threshold trades precision against recall, the confusion matrix counts both error types, and threshold-independent summaries like ROC-AUC describe the model while you still must choose an operating point.",
  },
  "gradient-boosting": {
    component: GradientBoostingViz,
    title: "Add Trees That Fix What's Left Over",
    subtitle: "Start from the mean and add shallow trees one at a time, each fit to the yellow residuals. Raise the tree count to watch the green ensemble curve bend toward the data, and change the learning rate to feel the shrinkage trade-off between smooth fitting and chasing noise.",
    insight: "Gradient boosting descends the loss one shallow tree at a time, each fit to the current residuals; a small learning rate with many trees regularizes by averaging out noise instead of letting any one tree overfit.",
  },
  "optimization-optimizers": {
    component: OptimizationOptimizersViz,
    title: "Same Gradient, Different Step: SGD vs Momentum vs Adam",
    subtitle: "Drop an optimizer into a narrow loss valley that is steep across and flat along. Plain SGD crawls down the flat floor; momentum builds speed and cancels the side-to-side bounce; Adam rescales each direction. Switch optimizers and nudge the learning rate to see why the update rule matters as much as the gradient.",
    insight: "Backprop gives the gradient, but the optimizer decides the step: momentum accelerates consistent directions while adaptive methods like Adam rescale each parameter, so they cut through ill-conditioned ravines that stall plain SGD.",
  },
  "object-detection": {
    component: ObjectDetectionViz,
    title: "From a Mess of Boxes to One Per Object",
    subtitle: "Every real object (dashed) is wrapped in a cluster of redundant predicted boxes. Raise the confidence threshold to drop weak and background boxes, then tune the NMS IoU to collapse each cluster — too high leaves duplicates, too low merges nearby objects.",
    insight: "Detection emits many redundant scored boxes per object; a confidence threshold drops weak ones and non-maximum suppression keeps the best box per cluster, so the post-processing thresholds materially change the final detections.",
  },
  "cnn-architectures": {
    component: CnnArchitecturesViz,
    title: "Why Residual Connections Unlocked Depth",
    subtitle: "Backpropagate from output to input and watch the gradient bars. A plain deep stack multiplies sub-1 factors, so the signal vanishes before reaching the early layers; a residual network's identity skips keep it intact. Crank the depth and flip the architecture to feel the difference.",
    insight: "In a plain deep network the gradient is a product of per-layer factors that vanishes with depth (the degradation problem), but a residual connection adds a +1 identity path that preserves the gradient, making hundreds of layers trainable.",
  },
  "self-supervised-vision": {
    component: SelfSupervisedVisionViz,
    title: "Learn by Filling in the Blanks — No Labels Needed",
    subtitle: "Hide a fraction of the image patches and reconstruct them from what is left. A low mask ratio is trivially solved by copying neighbors; push it to MAE's ~75% and the only way to rebuild the gaps is to actually understand the object — and the encoder only processes the visible patches.",
    insight: "Self-supervised pretraining manufactures a training signal from unlabeled images: masked image modeling hides most patches and reconstructs them, forcing the encoder to learn transferable structure that a small labeled set later fine-tunes.",
  },
  "vision-language-models": {
    component: VisionLanguageModelsViz,
    title: "One Shared Space for Pictures and Words",
    subtitle: "Each cell is the similarity between an image and a text prompt. Training only pushes the diagonal (true image–caption pairs) up. Pick a query image and the brightest cell in its row is the zero-shot prediction — classifying by words alone, with no labels.",
    insight: "CLIP aligns images and text in one embedding space via contrastive training on web pairs, so classification becomes nearest-text-prompt matching — open-vocabulary and zero-shot, though confusable categories still trip it up.",
  },
};

const configs: Record<string, VizMetadata> = {
  "calculus": {
    title: "The Derivative Is the Steepness of the Hill",
    subtitle: "Read the curve as a hill. The slope of the line touching it tells you how steep the ground is — climbing, flat at the summit, or descending.",
    insight: "A derivative is the steepness of the hill under your feet: positive climbing, zero at the summit, negative descending.",
    legend: [
      { label: "The hill f(x)", color: COLORS.cyan },
      { label: "Tangent (steepness here)", color: COLORS.pink },
      { label: "Chord & rise/run", color: COLORS.yellow },
    ],
  },
  "linear-algebra": {
    title: "How Embeddings Find What's Similar",
    subtitle: "Drag a query vector through an embedding space; the dot product (as cosine similarity) ranks which items point the same way — the engine behind search, recommendations, and attention.",
    insight: "A dot product scores how much two vectors point the same way, so ranking items by it is how embeddings retrieve the most similar one.",
    legend: [
      { label: "Query", color: COLORS.yellow },
      { label: "Items", color: COLORS.cyan },
      { label: "Top match", color: COLORS.pink },
    ],
  },
  "probability-theory": {
    title: "Every Column of Data Has a Shape",
    subtitle: "Pick something a model might measure — heights, conversions, arrivals, wait times — and watch its probability distribution reshape as you drag the parameters. Draw samples and they fill in under the curve.",
    insight: "A probability distribution captures the whole shape of a data column with just a parameter or two; draw enough samples and they converge onto that shape — the Law of Large Numbers.",
    legend: [
      { label: "Distribution (theory)", color: COLORS.pink },
      { label: "Samples drawn", color: COLORS.cyan },
      { label: "Mean", color: COLORS.yellow },
    ],
  },
  "maximum-likelihood": {
    title: "Likelihood Pulls the Model Toward Observations",
    subtitle: "The model mean moves under the observations while likelihood stems show each point's density.",
    insight: "Maximum likelihood chooses parameters that make the observed data collectively least surprising.",
    legend: [
      { label: "Model density", color: COLORS.pink },
      { label: "Observations", color: COLORS.cyan },
      { label: "Likelihood stems", color: COLORS.yellow },
    ],
  },
  "bayesian-inference": {
    title: "A/B Test: Which Variant Really Wins?",
    subtitle: "Start unsure which variant converts better. Each visitor reshapes a belief curve over its true rate, until P(B beats A) is high enough to decide.",
    insight: "Bayesian inference turns a trickle of noisy data into calibrated confidence — wide, overlapping beliefs sharpen and separate into a decision.",
    legend: [
      { label: "Belief: Variant A", color: COLORS.cyan },
      { label: "Belief: Variant B", color: COLORS.pink },
    ],
  },
  "linear-regression": {
    title: "Predicting From Many Features at Once",
    subtitle: "A model predicts house price from several features. Train it and watch every prediction slide onto the predicted-equals-actual diagonal as the per-feature weights settle.",
    insight: "Linear regression is a weighted sum of features; training tunes all the weights together to minimize total squared error.",
    legend: [
      { label: "Predictions", color: COLORS.pink },
      { label: "Residuals", color: COLORS.yellow },
      { label: "Perfect fit", color: COLORS.cyan },
    ],
  },
  "logistic-regression": {
    title: "From Score to Probability to Decision",
    subtitle: "Predict the probability of passing from hours studied. The sigmoid bends a linear score into a 0–1 probability; a movable threshold turns it into a yes/no — trading misses against false alarms.",
    insight: "Logistic regression outputs a calibrated probability via the sigmoid; the decision threshold is a separate knob you tune for the cost of each error.",
    legend: [
      { label: "Passed", color: COLORS.cyan },
      { label: "Failed", color: COLORS.pink },
      { label: "P(pass) curve", color: COLORS.yellow },
    ],
  },
  "knn": {
    title: "Tag a New Song by Its Nearest Neighbours",
    subtitle: "Drop a new track on the tempo–energy map; the k closest tagged songs vote on its genre.",
    insight: "KNN never trains — it just asks the k most similar stored examples to vote; k controls crowd vs single neighbour.",
    legend: [
      { label: "New track", color: COLORS.yellow },
      { label: "Lo-fi", color: COLORS.cyan },
      { label: "EDM", color: COLORS.pink },
    ],
  },
  "instance-based-trees": {
    title: "A Loan Tree Is a Flowchart of Yes/No Questions",
    subtitle: "Drop an applicant on the income–credit map and watch it fall through the questions to an Approve/Deny verdict.",
    insight: "A tree carves the space into axis-aligned boxes; adding a question (more depth) fits finer regions and fixes the dumb one-rule mistakes.",
    legend: [
      { label: "Applicant being judged", color: COLORS.yellow },
      { label: "Repaid / Approve", color: COLORS.cyan },
      { label: "Defaulted / Deny", color: COLORS.pink },
    ],
  },
  "support-vector-machines": {
    title: "The Kernel Trick: Lifting Data Until It Splits",
    subtitle: "A ring of one class traps the other in 2D. Lift each point by its distance from the centre and a single flat plane suddenly separates them.",
    insight: "When no line can separate classes, projecting into a higher dimension can make them linearly separable — and that flat boundary maps back to a curve.",
    legend: [
      { label: "Inner core", color: COLORS.pink },
      { label: "Outer ring", color: COLORS.cyan },
      { label: "Separating plane", color: COLORS.yellow },
    ],
  },
  "clustering": {
    title: "Find Customer Segments in Unlabelled Data",
    subtitle: "Customers plotted by spend and visits, with no labels. Run k-means and watch it discover the segments — and read off who they are.",
    insight: "Clustering is unsupervised: with no labels, k-means alternates assign-to-nearest and move-to-mean until raw points resolve into nameable groups.",
    legend: [
      { label: "Occasional shoppers", color: COLORS.cyan },
      { label: "Loyal regulars", color: COLORS.pink },
      { label: "VIP big-spenders", color: COLORS.yellow },
    ],
  },
  "ensemble-learning": {
    title: "A Committee of Weak Rules Beats Any One Expert",
    subtitle: "No single straight rule can flag fraud along a diagonal boundary. Add weak threshold rules and watch their majority vote carve an accurate staircase.",
    insight: "Each weak learner is barely better than chance; because their mistakes are uncorrelated, the majority vote cancels them and committee error drops toward zero.",
    legend: [
      { label: "Weak rule cut", color: COLORS.yellow },
      { label: "Legit", color: COLORS.cyan },
      { label: "Fraud", color: COLORS.pink },
    ],
  },
  "dimensionality-reduction": {
    title: "How Few Ingredients Still Look Like the Picture",
    subtitle: "Rebuild an image from only its top-k pattern components. A handful already keep most of the variance — the rest is fine detail.",
    insight: "A few high-variance components carry most of the structure, so keeping only those reconstructs the data while storing far less.",
    legend: [
      { label: "Reconstruction", color: COLORS.pink },
      { label: "Variance kept", color: COLORS.yellow },
    ],
  },
  "mcmc": {
    title: "MCMC Explores a Target Distribution by Walking",
    subtitle: "Accepted and rejected proposals show how a local random walk builds samples from a global density.",
    insight: "MCMC turns a hard distribution into a sequence of dependent samples with the right long-run density.",
    legend: [
      { label: "Target", color: COLORS.pink },
      { label: "Accepted", color: COLORS.cyan },
      { label: "Rejected", color: COLORS.yellow },
    ],
  },
  "neural-networks": {
    title: "Hidden Layers Bend a Boundary a Line Can't",
    subtitle: "These two classes form an XOR checkerboard no straight line can separate. Add hidden neurons one at a time and watch each one fold the decision boundary until it wraps every cluster.",
    insight: "A single neuron can only draw a straight line; each hidden neuron adds a fold, so stacking them lets the network carve any shape — that is what depth buys over a linear model.",
    legend: [
      { label: "Class A", color: COLORS.cyan },
      { label: "Class B", color: COLORS.pink },
      { label: "Misclassified", color: COLORS.yellow },
    ],
  },
  "cnn": {
    title: "CNN Kernels Scan Local Patterns",
    subtitle: "A moving kernel window links an input patch to a feature-map activation.",
    insight: "Convolutions reuse a small local filter across space, detecting the same feature wherever it appears.",
    legend: [
      { label: "Kernel", color: COLORS.yellow },
      { label: "Input", color: COLORS.cyan },
      { label: "Feature map", color: COLORS.pink },
    ],
  },
  "computer-vision": {
    title: "A Filter Slides Over Pixels and Finds Edges",
    subtitle: "An image is a grid of numbers. Paint a shape, then watch a 3×3 kernel convolve across it — lighting up exactly where brightness jumps. Edit the kernel weights and the feature it detects changes.",
    insight: "Convolution slides a small weight kernel over the pixel grid; the right weights make it a feature detector (here, vertical edges), and a CNN simply learns those weights.",
    legend: [
      { label: "Pixels", color: COLORS.cyan },
      { label: "Edge response", color: COLORS.pink },
      { label: "Kernel", color: COLORS.yellow },
    ],
  },
  "nlp": {
    title: "Embeddings Turn Words Into Geometry",
    subtitle: "Token neighborhoods and analogy arrows show semantic relationships as vector directions.",
    insight: "Embedding spaces make linguistic similarity measurable with distance and direction.",
    legend: [
      { label: "Tokens", color: COLORS.cyan },
      { label: "Selected", color: COLORS.pink },
      { label: "Analogy", color: COLORS.yellow },
    ],
  },
  "autoencoders": {
    title: "The Bottleneck That Cleans Up Noise",
    subtitle: "Feed a speckled image through a tiny latent code and a clean one comes out. The bottleneck is too small to store the random noise, so the decoder rebuilds only the real signal — until you over-squeeze it.",
    insight: "Forcing data through a few latent numbers makes the network keep only essential structure; random noise won't fit, so a denoising autoencoder hands back the clean original.",
    legend: [
      { label: "Noisy input", color: COLORS.cyan },
      { label: "Latent code z", color: COLORS.yellow },
      { label: "Reconstruction", color: COLORS.pink },
    ],
  },
  "transformers": {
    title: "Attention: How \"it\" Knows What It Means",
    subtitle: "The pronoun \"it\" is meaningless alone. Self-attention lets it look across the sentence and bind to the right word — and flipping the final adjective flips the referent.",
    insight: "Self-attention scores how relevant every other word is to each word, so an ambiguous token like \"it\" is resolved by whichever context word it attends to most.",
    legend: [
      { label: "Query word", color: COLORS.pink },
      { label: "Strongest attention", color: COLORS.yellow },
      { label: "Attention arcs", color: COLORS.cyan },
    ],
  },
  "llms": {
    title: "Temperature: The Creativity Dial",
    subtitle: "An LLM picks each word by sampling from a probability distribution over tokens. Drag temperature and watch one tall spike (predictable) melt into flat bars (anything goes) — then add words to build a sentence.",
    insight: "Dividing every logit by the temperature before softmax is the single knob that trades predictable, repetitive output for diverse, creative, riskier output.",
    legend: [
      { label: "Top token", color: COLORS.pink },
      { label: "Alternatives", color: COLORS.cyan },
    ],
  },
  "reinforcement-learning": {
    title: "Reward Floods Back From the Goal",
    subtitle: "The agent has no map and no labels — only a reward at the goal. Auto-explore and watch value spread backward cell by cell until the policy arrows form a route that steps around the trap.",
    insight: "Q-learning solves long-horizon credit assignment by backing value up one step at a time, so a single delayed reward ripples outward into a policy that knows which way to go from anywhere.",
    legend: [
      { label: "High value", color: COLORS.green },
      { label: "Policy / agent", color: COLORS.yellow },
      { label: "Trap", color: COLORS.pink },
    ],
  },
  "generative-models": {
    title: "Walk the Latent Space and Watch Faces Morph",
    subtitle: "A 2-D latent code decodes into a face. Walk a straight line between two codes and one face morphs smoothly into another.",
    insight: "Generative models organise data into a continuous latent space, so points between known samples decode into new, plausible ones.",
    legend: [
      { label: "Latent walk", color: COLORS.yellow },
      { label: "Start face z", color: COLORS.cyan },
      { label: "End face z", color: COLORS.pink },
    ],
  },
  "regularization": {
    title: "Why L1 Zeros Weights and L2 Just Shrinks Them",
    subtitle: "A weight budget pulls the best fit back to its edge. The diamond's corners sit on the axes, so L1 snaps a weight to exactly zero; the smooth circle never does.",
    insight: "L1's cornered budget lands solutions on the axes — sparsity and free feature selection; L2's round budget only shrinks weights.",
    legend: [
      { label: "Best fit + loss", color: COLORS.pink },
      { label: "Weight budget", color: COLORS.cyan },
      { label: "Solution w*", color: COLORS.yellow },
    ],
  },
};

export interface VisualizationRegistryEntry {
  component: React.ComponentType;
  title: string;
  subtitle: string;
  insight: string;
  accessibleLabel: string;
  legend?: VizMetadata["legend"];
}

const visualizationComponents: Record<string, React.ComponentType> = {
  "linear-regression": LinearRegressionViz,
  "logistic-regression": LogisticRegressionViz,
  knn: KNNViz,
  "decision-trees": DecisionTreeViz,
  "support-vector-machines": SVMViz,
  "naive-bayes": NaiveBayesViz,
  "ensemble-learning": EnsembleViz,
  clustering: KMeansViz,
  "gmm-em": GMMEMViz,
  "dimensionality-reduction": PCAViz,
  mcmc: MCMCViz,
  regularization: RegularizationViz,
  "neural-networks": NeuralNetworkViz,
  cnn: CNNViz,
  "computer-vision": ComputerVisionViz,
  nlp: NLPEmbeddingsViz,
  autoencoders: AutoencoderViz,
  transformers: TransformerViz,
  llms: LLMViz,
  "reinforcement-learning": RLViz,
  "generative-models": GenerativeViz,
  backpropagation: BackpropagationViz,
  "sequence-models": SequenceModelsViz,
  "embeddings-tokenization": EmbeddingsTokenizationViz,
  rag: RAGViz,
  "ai-agents": AIAgentsViz,
  "fine-tuning": FineTuningViz,
  "llm-evaluation-safety": LLMEvalSafetyViz,
  "ai-inference": AIInferenceViz,
  "image-segmentation": ImageSegmentationViz,
  "vision-transformers": VisionTransformersViz,
  "diffusion-models": DiffusionViz,
  "model-evaluation": ModelEvaluationViz,
  "gradient-boosting": GradientBoostingViz,
  "optimization-optimizers": OptimizationOptimizersViz,
  "object-detection": ObjectDetectionViz,
  "cnn-architectures": CnnArchitecturesViz,
  "self-supervised-vision": SelfSupervisedVisionViz,
  "vision-language-models": VisionLanguageModelsViz,
};

const accessibleLabels: Record<string, string> = {
  "linear-regression": "Multivariable Linear Regression Fit",
  "logistic-regression": "Logistic Regression Probability Curve",
  knn: "K-Nearest Neighbors Genre Vote",
  "decision-trees": "Decision Tree Loan Approval",
  "support-vector-machines": "SVM Kernel Trick Lift to 3D",
  "naive-bayes": "Naive Bayes Spam Evidence Tug of War",
  "ensemble-learning": "Ensemble Weak Learners Committee Vote",
  clustering: "K-Means Customer Segmentation",
  "gmm-em": "GMM EM Fit Visualizer",
  "dimensionality-reduction": "Low-Rank Image Reconstruction",
  mcmc: "MCMC Metropolis-Hastings Walker",
  regularization: "Regularization Loss Contours",
  "neural-networks": "Neural Network Decision Boundary",
  cnn: "Convolutional Neural Network Scanner",
  "computer-vision": "Computer Vision Sandbox",
  nlp: "NLP Embeddings Analogy Grid",
  autoencoders: "Autoencoder Bottleneck Compression",
  transformers: "Transformer Self-Attention",
  llms: "LLM Temperature Sampling",
  "reinforcement-learning": "Q-Learning Reinforcement Learning Gridworld",
  "generative-models": "Generative Models Latent Space Walk",
  backpropagation: "Backpropagation Credit Assignment",
  "sequence-models": "Sequence Models Gradient Flow Through Time",
  "embeddings-tokenization": "Subword Tokenization",
  rag: "RAG Pipeline Flow Diagram",
  "ai-agents": "AI Agent ReAct Loop Step-Through Diagram",
  "fine-tuning": "LoRA vs Full Fine-Tuning Parameter Update Diagram",
  "llm-evaluation-safety": "LLM Model Scores Bar Chart",
  "ai-inference": "AI inference memory and throughput calculator",
  "image-segmentation": "Semantic Segmentation Mask and Dice Score",
  "vision-transformers": "Vision Transformer Patch Attention Map",
  "diffusion-models": "Diffusion Forward Noising and Reverse Denoising",
  "model-evaluation": "ROC Curve and Confusion Matrix Threshold Sweep",
  "gradient-boosting": "Gradient Boosting Stage-wise Residual Fitting",
  "optimization-optimizers": "Optimizer Descent Trajectory on a Loss Surface",
  "object-detection": "Object Detection Anchor Boxes and Non-Maximum Suppression",
  "cnn-architectures": "Gradient Flow Through Network Depth: Plain vs Residual",
  "self-supervised-vision": "Masked Image Modeling Reconstruction",
  "vision-language-models": "CLIP Image-Text Similarity Matrix and Zero-Shot Match",
};

const legacyConfigId: Record<string, string> = {
  "decision-trees": "instance-based-trees",
};

export const visualizationRegistry: Record<string, VisualizationRegistryEntry> =
  Object.fromEntries(
    Object.entries(visualizationComponents).map(([moduleId, component]) => {
      const extended = extendedVisualizations[moduleId];
      const config = configs[legacyConfigId[moduleId] ?? moduleId];
      const metadata = extended ?? config;

      if (!metadata) {
        throw new Error(`Missing visualization metadata for "${moduleId}"`);
      }

      return [
        moduleId,
        {
          component,
          title: metadata.title,
          subtitle: metadata.subtitle,
          insight: metadata.insight,
          accessibleLabel: accessibleLabels[moduleId],
          legend: config?.legend,
        },
      ];
    }),
  );

export default function D3Visualization({ algorithmId }: { algorithmId: string }) {
  const entry = visualizationRegistry[algorithmId];

  if (!entry) {
    return (
      <div
        role="alert"
        className="border border-error bg-error/5 p-6 text-on-surface"
        data-testid="visualization-error"
      >
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-error">
          Visualization unavailable
        </p>
        <p className="mt-2 text-sm text-on-surface-variant">
          No interactive diagram is registered for module{" "}
          <code className="font-mono text-on-surface">{algorithmId}</code>.
        </p>
      </div>
    );
  }

  const Visualization = entry.component;

  return (
    <VisualizationShell
      title={entry.title}
      subtitle={entry.subtitle}
      insight={entry.insight}
      legend={entry.legend}
    >
      <Visualization />
    </VisualizationShell>
  );
}
