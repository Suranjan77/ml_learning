import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import KMeansScene from "./KMeansScene";

describe("KMeansScene", () => {
  it("alternates the phase button and updates the live status as phases run", () => {
    render(<KMeansScene step={0} resetKey={0} />);

    const phaseButton = screen.getByRole("button", { name: "Assign points" });
    expect(screen.getByText(/Ready to assign points/i)).toBeInTheDocument();

    fireEvent.click(phaseButton);
    expect(screen.getByRole("button", { name: "Move centroids" })).toBeInTheDocument();
    expect(screen.getByText(/Iteration 1, assign phase/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Move centroids" }));
    expect(screen.getByRole("button", { name: "Assign points" })).toBeInTheDocument();
    expect(screen.getByText(/Iteration 1, update phase/)).toBeInTheDocument();
  });

  it("resets the run when the k selector changes", () => {
    render(<KMeansScene step={1} resetKey={0} />);
    expect(screen.getByText(/Iteration 1, assign phase/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/ready to assign points/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Assign points" })).toBeInTheDocument();
  });

  it("applies deterministic presets for each guided step", () => {
    const { rerender } = render(<KMeansScene step={0} resetKey={0} />);
    expect(screen.getByRole("button", { name: "Assign points" })).toBeInTheDocument();
    expect(screen.getByText(/ready to assign points/i)).toBeInTheDocument();

    rerender(<KMeansScene step={1} resetKey={0} />);
    expect(screen.getByRole("button", { name: "Move centroids" })).toBeInTheDocument();
    expect(screen.getByText(/Iteration 1, assign phase/)).toBeInTheDocument();

    rerender(<KMeansScene step={2} resetKey={0} />);
    expect(screen.getByRole("button", { name: "Assign points" })).toBeInTheDocument();
    expect(screen.getByText(/Iteration 1, update phase/)).toBeInTheDocument();
    const stepTwoLabel = screen.getByTestId("kmeans-stage").getAttribute("aria-label");

    rerender(<KMeansScene step={3} resetKey={0} />);
    expect(screen.getByRole("button", { name: "Assign points" })).toBeInTheDocument();
    expect(screen.getByText(/Iteration 1, update phase/)).toBeInTheDocument();
    const stepThreeLabel = screen.getByTestId("kmeans-stage").getAttribute("aria-label");

    // Step 3 uses a deliberately poor start, so its centroid position differs from step 2's.
    expect(stepThreeLabel).not.toEqual(stepTwoLabel);
  });

  it("supports keyboard selection and movement, and restores on reset", () => {
    const { rerender } = render(<KMeansScene step={0} resetKey={0} />);
    const stage = screen.getByTestId("kmeans-stage");
    expect(stage).toHaveAttribute("aria-label", expect.stringContaining("Centroid 1 of 3 selected, at x -1.50, y -0.50"));

    fireEvent.keyDown(stage, { key: "ArrowRight" });
    expect(stage).toHaveAttribute("aria-label", expect.stringContaining("x -1.34, y -0.50"));

    fireEvent.keyDown(stage, { key: "2" });
    expect(stage).toHaveAttribute("aria-label", expect.stringContaining("Centroid 2 of 3 selected, at x 0.50, y 2.00"));

    fireEvent.keyDown(stage, { key: "ArrowUp", shiftKey: true });
    expect(stage).toHaveAttribute("aria-label", expect.stringContaining("x 0.50, y 2.40"));

    rerender(<KMeansScene step={0} resetKey={1} />);
    expect(stage).toHaveAttribute("aria-label", expect.stringContaining("Centroid 1 of 3 selected, at x -1.50, y -0.50"));
  });

  it("stops advancing and reports convergence once the run settles", () => {
    render(<KMeansScene step={0} resetKey={0} />);
    const phaseButtonName = () => screen.getByRole("button", { name: /Assign points|Move centroids/ });

    for (let clicks = 0; clicks < 40; clicks += 1) {
      const button = phaseButtonName();
      if ((button as HTMLButtonElement).disabled) break;
      fireEvent.click(button);
    }

    expect(screen.getByText(/Converged/)).toBeInTheDocument();
    expect(phaseButtonName()).toBeDisabled();
  });
});
