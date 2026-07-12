import { LearningModule } from "./learningModuleTypes";

export const llmSynthesis: LearningModule = {
  id: "llm-synthesis",
  title: "Synthesis: LLM System Architecture",
  category: "Machine Learning Concepts",
  prerequisites: ["rag", "fine-tuning", "llm-evaluation-safety"],
  learningObjectives: [
    'Synthesize the entire LLM pipeline from pre-training and fine-tuning to RAG and inference.',
    'Analyze the trade-offs between fine-tuning a model versus using Prompt Engineering and RAG.',
    'Evaluate the risks, safety, and deployment costs associated with modern Large Language Models.'
  ],
  misconceptions: [
    {
      claim: 'Fine-tuning an LLM is the best way to teach it new factual knowledge.',
      correction: 'Fine-tuning is excellent for teaching an LLM a new *format* or *behavior* (like adhering to a specific JSON schema). For injecting factual knowledge, RAG is far more reliable and easier to update.'
    },
    {
      claim: 'Larger models always produce better results for every task.',
      correction: 'For highly constrained, specific tasks (e.g., extracting names from text), a heavily fine-tuned small model (like a 7B parameter model) can often outperform a generic massive model (like a 175B model) while costing a fraction of the compute.'
    }
  ],
  references: [
    {
      title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
      authors: 'Lewis et al.',
      url: 'https://arxiv.org/abs/2005.11401',
      type: 'paper'
    },
    {
      title: 'State of GPT',
      authors: 'Andrej Karpathy',
      url: 'https://www.youtube.com/watch?v=bZQun8Y4L2A',
      type: 'video'
    }
  ],
  failureModes: [
    {
      name: 'Prompt Injection & Jailbreaks',
      description: 'Deploying an LLM application without safeguards, allowing users to trick the model into revealing system prompts or generating inappropriate content.',
      mitigation: 'Implement robust input/output filtering (e.g., Llama Guard), enforce strict system prompts, and use adversarial testing before deployment.'
    }
  ],

  shortDescription: "A milestone case study synthesizing RAG, Fine-tuning, Inference, and Safety to design production-grade LLM systems.",
  fullDescription: `
This final milestone module focuses on the engineering architecture of modern Large Language Model systems. 

Building an LLM product rarely means training a foundation model from scratch. Instead, it involves a complex orchestration of **Retrieval-Augmented Generation (RAG)**, **Fine-Tuning (LoRA)**, **Prompt Engineering**, **KV Cache Management**, and **Guardrails**. Deciding which tool to use for a specific problem is the defining skill of a modern AI engineer.
  `,
  intuition: `
### The Knowledge vs. Behavior Paradigm

When a model fails to perform a task, you must diagnose if it is a **Knowledge** failure or a **Behavior** failure.

*   **RAG (Retrieval):** Solves *Knowledge* failures. If the model doesn't know your company's internal HR policies, you don't fine-tune it; you inject the policy into the prompt via RAG.
*   **Fine-Tuning:** Solves *Behavior* failures. If the model knows the answer but writes it in a highly verbose, unhelpful format instead of the strict JSON schema you require, you fine-tune it to learn the desired output structure.
*   **Prompt Engineering:** The cheapest and fastest baseline for both, but breaks down when context windows overflow or complex multi-step reasoning is required.
  `,
  mathematics: `
### System-Level Mathematical Constraints

1.  **Context Window Costs:** The cost and latency of inference scale linearly with input tokens and quadratically in attention mechanisms. Dumping a 100-page document into the prompt is often vastly more expensive than running a vector search over 100 pages and only passing the top 3 paragraphs to the LLM.
2.  **Fine-Tuning Parameter Count:** Full fine-tuning of a 70B parameter model requires updating $7 \\times 10^{10}$ weights, requiring massive VRAM. LoRA mathematically decomposes this into low-rank matrices, reducing the trainable parameters by $10,000\\times$, making it feasible on a single GPU.
  `,
  pros: ['Forces synthesis of diverse classical methods', 'Highlights edge cases that test deep understanding'],
  cons: ['Higher cognitive load than typical modules', 'May frustrate beginners if attempted too early'],
  hasVisualization: false,
  difficulty: 4,
  estimatedMinutes: 20,
  tracks: ['modern-ai'],
  
  caseStudies: [
    {
      title: "Building an Internal Coding Assistant",
      scenario: "A company wants an AI coding assistant that understands their massive, undocumented legacy, proprietary codebase. The engineering team suggests fine-tuning Llama-3 on all the code.",
      approach: "Fine-tuning is rejected because it is notoriously bad at fact-recall. The model will likely hallucinate function names. Instead, a complex RAG pipeline is built: codebase files are chunked, embedded, and stored in a vector database. When a user asks a question, the relevant code snippets are retrieved and injected into the prompt.",
      outcome: "The RAG system achieves 95% accuracy in answering codebase queries, whereas the fine-tuned model suffered from severe hallucination and catastrophic forgetting."
    }
  ],


  shortAnswerQuestions: [
    {
      question: "Design an end-to-end architecture for a highly regulated Medical Diagnostic Assistant. The system must process patient symptoms, reference the latest 2026 medical journals (which are updated daily), provide a diagnosis, and guarantee zero toxic/harmful outputs. Detail your choices regarding RAG, Fine-Tuning, Inference, and Safety.",
      expectedAnswerRubric: `
**Self-Grading Rubric:**
1.  **Dynamic Knowledge:** Did you propose a **RAG** system connected to a vector database of the medical journals? (Fine-tuning is incorrect here because journals update daily, and re-training daily is infeasible).
2.  **Domain Behavior:** Did you propose **Fine-Tuning** (Instruction Tuning) a base model on a high-quality dataset of doctor-patient interactions so the tone is empathetic and professional?
3.  **Safety/Guardrails:** Did you include a dedicated **Safety Evaluation/Guardrail** mechanism? (e.g., an independent "Judge LLM" or rule-based classifier that intercepts the output before it reaches the patient to scan for high-risk medical advice or toxicity).
4.  **Inference Considerations:** Did you address inference reliability? (e.g., setting temperature to 0.0 for deterministic, factual outputs rather than creative hallucinations).
      `
    }
  ]
};
