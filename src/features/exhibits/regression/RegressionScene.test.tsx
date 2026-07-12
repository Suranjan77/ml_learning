import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RegressionScene from "./RegressionScene";

describe("RegressionScene", () => {
  it("applies the logistic guided preset", () => {
    render(<RegressionScene step={3} resetKey={0} />);
    expect(screen.getByRole("button", { name: "logistic" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("slider", { name: "Slope" })).toHaveValue("0.2");
    expect(screen.getAllByText(/Logistic boundary with slope 0.20/)).toHaveLength(2);
  });

  it("keeps both parameters directly manipulable", () => {
    render(<RegressionScene step={0} resetKey={0} />);
    fireEvent.change(screen.getByRole("slider", { name: "Slope" }), { target: { value: "0.8" } });
    fireEvent.change(screen.getByRole("slider", { name: "Intercept" }), { target: { value: "0.4" } });
    expect(screen.getAllByText(/Linear fit with slope 0.80, intercept 0.40/)).toHaveLength(2);
  });
});
