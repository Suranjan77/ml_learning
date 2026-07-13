import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import AttentionScene from "./AttentionScene";

afterEach(() => window.history.replaceState({}, "", "/"));

describe("AttentionScene", () => {
  it("renders a spatial, accessible view of every weighted connection", () => {
    const { container } = render(<AttentionScene />);

    expect(screen.getByRole("img", { name: /attention connections from it/i })).toBeInTheDocument();
    expect(container.querySelectorAll("svg path")).toHaveLength(8);
    expect(screen.getByRole("list", { name: /context tokens and attention weights/i })).toBeInTheDocument();
    expect(screen.getByText(/QKᵀ \/ √6 → softmax · vectors authored/i)).toBeInTheDocument();
    expect(screen.getAllByText(/score /i).length).toBeGreaterThan(1);

    const widths = [...container.querySelectorAll("svg path")].map((path) =>
      Number(path.getAttribute("stroke-width")),
    );
    expect(new Set(widths).size).toBeGreaterThan(2);
    expect(container.querySelector("svg path[stroke-dasharray]")).not.toBeNull();
  });

  it("selects query tokens by hover, focus, click and arrow keys", () => {
    render(<AttentionScene />);
    const street = screen.getByRole("button", { name: "Use street as the query token" });
    const because = screen.getByRole("button", { name: "Use because as the query token" });

    fireEvent.mouseEnter(street);
    expect(street).toHaveAttribute("aria-pressed", "true");

    fireEvent.focus(because);
    expect(because).toHaveAttribute("aria-pressed", "true");

    fireEvent.keyDown(because, { key: "ArrowRight" });
    const it = screen.getByRole("button", { name: "Use it as the query token" });
    expect(it).toHaveAttribute("aria-pressed", "true");
    expect(it).toHaveFocus();

    fireEvent.click(street);
    expect(street).toHaveAttribute("aria-pressed", "true");
  });

  it("changes sentence context and restores the initial state with resetKey", () => {
    const { rerender } = render(<AttentionScene resetKey={0} />);

    fireEvent.click(screen.getByRole("button", { name: "Use sentence ending in wide" }));
    expect(screen.getByRole("button", { name: "Use sentence ending in wide" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getAllByText(/it pays most attention to street/i)).not.toHaveLength(0);

    fireEvent.click(
      screen.getByRole("button", { name: "Show Previous token attention pattern" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Use street as the query token" }));

    rerender(<AttentionScene resetKey={1} />);

    expect(screen.getByRole("button", { name: "Use sentence ending in tired" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Show Reference attention pattern" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Use it as the query token" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Keep tired" })).toHaveAttribute("aria-pressed", "false");
  });

  it("applies guided step presets for autoplay", () => {
    const { rerender } = render(<AttentionScene step={0} />);
    expect(screen.getByRole("button", { name: "Use sentence ending in tired" })).toHaveAttribute("aria-pressed", "true");

    rerender(<AttentionScene step={1} />);
    expect(screen.getByRole("button", { name: "Use sentence ending in wide" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Clear kept tired" })).toHaveAttribute("aria-pressed", "true");
    const comparison = screen.getByText(/it, tired → wide:/i);
    expect(comparison).toHaveTextContent(/Animal 45% → 5%/i);
    expect(comparison).toHaveTextContent(/street 5% → 45%/i);

    rerender(<AttentionScene step={2} />);
    expect(screen.getByRole("button", { name: "Show Previous token attention pattern" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shares the selected ending, head, and query token", () => {
    window.history.replaceState({}, "", "/visualisations/attention");
    render(<AttentionScene />);

    fireEvent.click(screen.getByRole("button", { name: "Use sentence ending in wide" }));
    fireEvent.click(screen.getByRole("button", { name: "Show Previous token attention pattern" }));
    fireEvent.click(screen.getByRole("button", { name: "Use street as the query token" }));

    const params = new URL(window.location.href).searchParams;
    expect(params.get("ending")).toBe("wide");
    expect(params.get("head")).toBe("previous-token");
    expect(params.get("query")).toBe("3");
    expect(params.get("compare")).toBe("on");
    expect(params.get("refEnding")).toBe("tired");
  });

  it("clears the guided ending comparison through URL state", () => {
    window.history.replaceState({}, "", "/visualisations/attention?step=1");
    render(<AttentionScene step={1} />);

    fireEvent.click(screen.getByRole("button", { name: "Clear kept tired" }));

    const params = new URL(window.location.href).searchParams;
    expect(params.get("compare")).toBe("off");
    expect(params.has("refEnding")).toBe(false);
  });
});
