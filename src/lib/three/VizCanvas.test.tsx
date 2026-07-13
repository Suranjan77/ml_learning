import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VizCanvas } from "./VizCanvas";

describe("VizCanvas", () => {
  it("shows an explanatory fallback when a WebGL context cannot be created", async () => {
    render(
      <VizCanvas label="Loss landscape" description="Height represents loss.">
        <mesh />
      </VizCanvas>,
    );

    expect(await screen.findByText("The 3D view is unavailable in this browser. Height represents loss.")).toBeVisible();
    expect(screen.queryByRole("img", { name: "Loss landscape" })).toBeVisible();
  });
});
