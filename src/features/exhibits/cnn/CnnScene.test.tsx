import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import CnnScene from "./CnnScene";

describe("CnnScene", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/visualisations/cnn-feature-maps");
  });

  it("moves the receptive field with arrow keys and shares the cell", () => {
    render(<CnnScene step={0} resetKey={0} />);
    const diagram = screen.getByRole("img", { name: /feature-map calculation/i });

    fireEvent.keyDown(diagram, { key: "ArrowRight" });

    const params = new URL(window.location.href).searchParams;
    expect(params.get("row")).toBeNull();
    expect(params.get("column")).toBe("3");
    expect(screen.getByText(/selected output cell row 1, column 3/i)).toBeInTheDocument();
  });

  it("shares a manually selected filter", () => {
    render(<CnnScene step={0} resetKey={0} />);
    fireEvent.click(screen.getByRole("button", { name: "sharpen" }));

    expect(screen.getByRole("button", { name: "sharpen" })).toHaveAttribute("aria-pressed", "true");
    expect(new URL(window.location.href).searchParams.get("filter")).toBe("sharpen");
  });

  it("restores filter and receptive-field coordinates from the URL", () => {
    window.history.replaceState({}, "", "/visualisations/cnn-feature-maps?filter=sharpen&row=4&column=5");
    render(<CnnScene step={0} resetKey={0} />);

    expect(screen.getByRole("button", { name: "sharpen" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/selected output cell row 4, column 5/i)).toBeInTheDocument();
  });
});
