import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import BackpropScene from "./BackpropScene";

describe("BackpropScene", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/visualisations/backpropagation");
  });

  it("shares deterministic applied updates", () => {
    render(<BackpropScene step={3} resetKey={0} />);
    fireEvent.click(screen.getByRole("button", { name: "Apply update" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply update" }));

    expect(new URL(window.location.href).searchParams.get("updates")).toBe("2");
    expect(screen.getByText(/2 updates applied/i)).toBeInTheDocument();
  });

  it("resets update history when the evidence changes", () => {
    render(<BackpropScene step={3} resetKey={0} />);
    fireEvent.click(screen.getByRole("button", { name: "Apply update" }));
    fireEvent.change(screen.getByRole("slider", { name: "Input x1" }), { target: { value: "0.4" } });

    const params = new URL(window.location.href).searchParams;
    expect(params.get("x1")).toBe("0.4");
    expect(params.has("updates")).toBe(false);
    expect(screen.getByText(/0 updates applied/i)).toBeInTheDocument();
  });

  it("restores inputs, target, rate, and update count", () => {
    window.history.replaceState({}, "", "/visualisations/backpropagation?x1=0.4&x2=0.6&target=0&lr=0.2&updates=3");
    render(<BackpropScene step={3} resetKey={0} />);

    expect(screen.getByRole("slider", { name: "Input x1" })).toHaveValue("0.4");
    expect(screen.getByRole("slider", { name: "Input x2" })).toHaveValue("0.6");
    expect(screen.getByRole("slider", { name: "Learning rate" })).toHaveValue("0.2");
    expect(screen.getByRole("button", { name: "Target 0" })).toBeInTheDocument();
    expect(screen.getByText(/3 updates applied/i)).toBeInTheDocument();
  });
});
