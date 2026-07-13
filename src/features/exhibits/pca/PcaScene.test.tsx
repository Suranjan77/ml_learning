import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import PcaScene from "./PcaScene";
import { POINTS, normalizeAxisAngle, principalAngle } from "./model";

const optimalDegrees = Math.round(principalAngle(POINTS) * 180 / Math.PI);
const perpendicularDegrees = Math.round(normalizeAxisAngle(principalAngle(POINTS) + Math.PI / 2) * 180 / Math.PI);

describe("PcaScene", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/visualisations/pca");
  });

  it("normalises the perpendicular preset into the native slider range", () => {
    render(<PcaScene step={0} resetKey={0} />);

    const slider = screen.getByRole("slider", { name: "Projection angle" }) as HTMLInputElement;
    expect(slider.value).toBe(String(perpendicularDegrees));
    expect(Number(slider.value)).toBeGreaterThanOrEqual(-90);
    expect(Number(slider.value)).toBeLessThanOrEqual(90);
  });

  it("shares and restores a chosen projection angle", () => {
    const { unmount } = render(<PcaScene step={0} resetKey={0} />);
    fireEvent.change(screen.getByRole("slider", { name: "Projection angle" }), { target: { value: "12" } });
    expect(new URL(window.location.href).searchParams.get("angle")).toBe("12");
    unmount();

    window.history.replaceState({}, "", "/visualisations/pca?angle=-23");
    render(<PcaScene step={0} resetKey={0} />);
    expect((screen.getByRole("slider", { name: "Projection angle" }) as HTMLInputElement).value).toBe("-23");
  });

  it("aligns to the computed principal axis and shares that state", () => {
    render(<PcaScene step={0} resetKey={0} />);
    fireEvent.click(screen.getByRole("button", { name: "Align principal axis" }));

    expect((screen.getByRole("slider", { name: "Projection angle" }) as HTMLInputElement).value).toBe(String(optimalDegrees));
    expect(new URL(window.location.href).searchParams.get("angle")).toBe(String(optimalDegrees));
  });
});
