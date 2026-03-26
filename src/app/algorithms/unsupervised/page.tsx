import AlgorithmCategoryPage from "@/components/ui/AlgorithmCategoryPage";
import { algorithms } from "@/data/algorithms";

export default function UnsupervisedPage() {
  const filteredAlgorithms = algorithms.filter(
    (algorithm) => algorithm.category === "Unsupervised",
  );

  return (
    <AlgorithmCategoryPage
      title="Unsupervised Learning"
      eyebrow="Category"
      description="Unsupervised learning works with unlabeled data, helping you uncover hidden structure, group similar examples, compress information, and discover meaningful patterns without predefined targets."
      category="Unsupervised"
      algorithms={filteredAlgorithms}
    />
  );
}
