import AlgorithmCategoryPage from "@/components/ui/AlgorithmCategoryPage";
import { algorithms } from "@/data/algorithms";

export default function SupervisedPage() {
  const supervisedAlgorithms = algorithms.filter(
    (algorithm) => algorithm.category === "Supervised",
  );

  return (
    <AlgorithmCategoryPage
      title="Supervised Learning"
      eyebrow="Category"
      description="Supervised learning uses labeled examples to learn a mapping from inputs to outputs. It powers tasks such as classification, regression, ranking, and probability estimation, making it one of the most practical and widely used branches of machine learning."
      category="Supervised"
      algorithms={supervisedAlgorithms}
    />
  );
}
