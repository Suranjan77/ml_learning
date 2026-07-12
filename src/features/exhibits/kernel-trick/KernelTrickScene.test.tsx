import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import KernelTrickScene from "./KernelTrickScene";

describe("KernelTrickScene", () => {
  it("keeps the feature-space control and accessible scene description together", () => {
    render(<KernelTrickScene step={0} resetKey={0} />);

    expect(screen.getByRole("img", { name: /radial feature-space transformation/i })).toBeTruthy();
    const lift = screen.getByRole("slider", { name: /feature-space lift/i }) as HTMLInputElement;
    expect(lift.value).toBe("0");

    fireEvent.change(lift, { target: { value: "0.8" } });
    expect(lift.value).toBe("0.8");
    expect(screen.getByText("80%")).toBeTruthy();
  });

  it("uses the authored step as the deterministic reset state", () => {
    const { rerender } = render(<KernelTrickScene step={2} resetKey={0} />);
    expect((screen.getByRole("slider", { name: /feature-space lift/i }) as HTMLInputElement).value).toBe("1");

    fireEvent.change(screen.getByRole("slider"), { target: { value: "0.3" } });
    rerender(<KernelTrickScene step={2} resetKey={1} />);
    expect((screen.getByRole("slider", { name: /feature-space lift/i }) as HTMLInputElement).value).toBe("1");
  });
});
