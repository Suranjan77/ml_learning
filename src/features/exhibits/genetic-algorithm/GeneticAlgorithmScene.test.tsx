import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GeneticAlgorithmScene from "./GeneticAlgorithmScene";

describe("GeneticAlgorithmScene", () => {
  it("describes the displayed crossover and mutation example", () => {
    render(<GeneticAlgorithmScene step={1} resetKey={0} />);

    expect(screen.getByText(/Example child crossed after bit \d+ and changed bits/i)).toBeInTheDocument();
    expect(screen.getByText(/changed bits across the population/i)).toBeInTheDocument();
  });
});
