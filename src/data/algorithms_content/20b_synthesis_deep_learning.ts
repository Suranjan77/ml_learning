import { LearningModule } from "./learningModuleTypes";

export const dlSynthesis: LearningModule = {
  id: "dl-synthesis",
  title: "Synthesis: Deep Learning Architecture Choice",
  category: "Machine Learning Concepts",
  prerequisites: ["cnn", "sequence-models", "optimization-optimizers"],
  learningObjectives: [
    'Synthesize the architectural trade-offs between CNNs, RNNs, and basic Transformers.',
    'Select the correct deep learning architecture based on data modality (images, text, time-series) and hardware constraints.',
    'Identify bottlenecks in training deep neural networks and apply appropriate mitigations (regularization, skip connections).'
  ],
  misconceptions: [
    {
      claim: 'Deep Learning completely replaces the need for feature engineering.',
      correction: 'While DL reduces manual feature extraction (especially in vision/audio), domain-specific preprocessing, data augmentation, and careful handling of tabular data remain critical for performance.'
    },
    {
      claim: 'More layers always lead to a better model.',
      correction: 'Beyond a certain depth, models suffer from vanishing gradients and overfitting. Architectures require careful tuning, and techniques like ResNet (skip connections) are necessary to train very deep networks effectively.'
    }
  ],
  references: [
    {
      title: 'Deep Learning',
      authors: 'Yann LeCun, Yoshua Bengio & Geoffrey Hinton',
      url: 'https://www.nature.com/articles/nature14539',
      type: 'paper'
    },
    {
      title: 'A Recipe for Training Neural Networks',
      authors: 'Andrej Karpathy',
      url: 'https://karpathy.github.io/2019/04/25/recipe/',
      type: 'tutorial'
    }
  ],
  failureModes: [
    {
      name: 'Ignoring the Baseline',
      description: 'Applying a 100-layer CNN to a simple tabular dataset where a Random Forest would train in seconds and perform better.',
      mitigation: 'Only use Deep Learning when the data modality (unstructured data like images/audio/text) or dataset scale justifies the computational cost.'
    }
  ],

  shortDescription: "A milestone case study synthesizing and comparing deep learning architectures (CNNs, Transformers, RNNs, Autoencoders) under strict constraints.",
  fullDescription: `
This milestone module requires you to synthesize your knowledge of Deep Learning architectures. Rather than asking *how* a CNN or Transformer works, we focus on *when* to use them.

Modern Deep Learning offers incredible power, but with power comes massive computational and memory requirements. Choosing between a Vision Transformer and a ResNet50 is not just a matter of accuracy—it's a matter of inductive biases, parameter efficiency, and data availability.
  `,
  intuition: `
### Inductive Biases vs. Data

The fundamental trade-off in Deep Learning architectures is the relationship between **Inductive Bias** and **Data Requirements**:

*   **CNNs** have a strong inductive bias (translation invariance, local feature grouping). They are highly data-efficient and work well even on moderately sized datasets.
*   **RNNs/LSTMs** have a strong inductive bias for sequential, ordered data.
*   **Transformers** have almost *zero* inductive bias. They treat everything as a set of tokens and must learn the spatial or sequential relationships from scratch. Because of this, they require astronomically larger datasets to outperform CNNs/RNNs, but they have a much higher theoretical ceiling.
*   **Autoencoders** focus entirely on unsupervised representation learning, allowing you to leverage massive amounts of unlabeled data.
  `,
  mathematics: `
### Mathematical Constraints of DL

1.  **Transformer Scaling:** The self-attention mechanism in a Transformer scales $O(N^2)$ with the sequence length $N$. For an image of $1024 \\times 1024$ pixels treated as individual tokens, $N = 1,048,576$. $N^2$ is over $10^{12}$ operations per layer, making pixel-level ViTs impossible without patching.
2.  **CNN Receptive Fields:** The receptive field of a CNN grows linearly with depth unless pooling or dilated convolutions are used. Understanding this math is critical for dense prediction tasks like segmentation.
3.  **RNN Sequential Bottleneck:** The hidden state $h_t$ strictly requires $h_{t-1}$. This $O(N)$ sequential dependency mathematically prohibits the massive parallelization that makes Transformers fast on GPUs.
  `,
  pros: ['Forces synthesis of diverse classical methods', 'Highlights edge cases that test deep understanding'],
  cons: ['Higher cognitive load than typical modules', 'May frustrate beginners if attempted too early'],
  hasVisualization: false,
  difficulty: 3,
  estimatedMinutes: 20,
  tracks: ['practitioner', 'modern-ai'],
  
  caseStudies: [
    {
      title: "Medical Image Segmentation with Limited Data",
      scenario: "You have 500 labeled MRI scans for tumor segmentation. You have a massive GPU cluster. Your manager suggests using the latest Swin Transformer because it 'beat CNNs on ImageNet.'",
      approach: "You must reject the manager's suggestion. Transformers have almost no inductive bias and require millions of images to learn what a CNN knows by default (translation invariance). With only 500 images, a Transformer will heavily overfit.",
      outcome: "A U-Net (a specialized CNN) with heavy data augmentation is chosen instead, achieving state-of-the-art results on the small dataset."
    }
  ],


  shortAnswerQuestions: [
    {
      question: "You have an unlimited budget for GPU compute, but you only have 10,000 labeled images of defective circuit boards, and 10 million unlabeled images of normal circuit boards. Design a Deep Learning pipeline that maximizes the use of both datasets. Be specific about the architectures.",
      expectedAnswerRubric: `
**Self-Grading Rubric:**
1.  **Leveraging Unlabeled Data:** Did you propose using the 10 million unlabeled images? A correct answer must involve unsupervised or self-supervised learning.
2.  **Architecture Choice:** Did you propose an Autoencoder (e.g., a Convolutional Autoencoder) or a contrastive learning setup (like SimCLR) trained on the 10 million images to learn feature representations?
3.  **Transfer Learning:** Did you explicitly state that the encoder from step 2 should be frozen (or fine-tuned with a low learning rate) and a new classification head attached?
4.  **Handling the Labeled Data:** Did you explain that the 10,000 labeled images are now sufficient because they only need to train the final classification layer on top of the pre-learned representations?
      `
    }
  ]
};
