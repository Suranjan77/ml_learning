import { describe, expect, it } from "vitest";
import { applySceneUrlState, enumParam, numberParam } from "./sceneUrlState";

describe("scene URL state", () => {
  it("adds non-default values, removes defaults, and preserves route state", () => {
    const url = new URL("https://example.test/visualisations/demo?embed=1&lr=0.4");
    applySceneUrlState(url, [
      { key: "lr", value: "0.1", defaultValue: "0.1" },
      { key: "surface", value: "valley", defaultValue: "bowl" },
    ]);

    expect(url.searchParams.toString()).toBe("embed=1&surface=valley");
  });

  it("accepts only finite, in-range values aligned to the control step", () => {
    expect(numberParam(new URLSearchParams("degree=7"), "degree", { min: 1, max: 14, step: 1 })).toBe(7);
    expect(numberParam(new URLSearchParams("degree=7.5"), "degree", { min: 1, max: 14, step: 1 })).toBeUndefined();
    expect(numberParam(new URLSearchParams("degree=99"), "degree", { min: 1, max: 14, step: 1 })).toBeUndefined();
  });

  it("rejects stale enum values", () => {
    const values = ["none", "top-k", "top-p"] as const;
    expect(enumParam(new URLSearchParams("truncate=top-p"), "truncate", values)).toBe("top-p");
    expect(enumParam(new URLSearchParams("truncate=legacy"), "truncate", values)).toBeUndefined();
  });
});
