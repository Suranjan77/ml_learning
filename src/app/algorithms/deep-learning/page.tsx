import AlgorithmCategoryPage from "@/components/ui/AlgorithmCategoryPage";
import { algorithms } from "@/data/algorithms";

export default function DeepLearningPage() {
  const filteredAlgorithms = algorithms.filter(
    (algorithm) => algorithm.category === "Deep Learning",
  );

  return (
    <AlgorithmCategoryPage
      title="Deep Learning"
      eyebrow="Category"
      description="Deep learning studies neural architectures that learn layered representations from data. Instead of relying on hand-crafted features, these models transform raw inputs through multiple stages, making them powerful for vision, language, speech, and sequence modeling tasks."
      category="Deep Learning"
      algorithms={filteredAlgorithms}
    />
  );
}
