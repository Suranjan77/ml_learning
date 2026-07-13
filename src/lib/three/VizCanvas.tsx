"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import { NoToneMapping } from "three";
import { useEffect, useState, type ReactNode } from "react";
import { vizTokens } from "@/lib/vizTokens";

type WebGlCapability = "checking" | "available" | "unavailable";

function detectWebGlCapability(): WebGlCapability {
  if (typeof WebGLRenderingContext === "undefined") return "unavailable";

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!context) return "unavailable";
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return "available";
  } catch {
    return "unavailable";
  }
}

interface VizCanvasProps {
  /** Everything rendered inside the WebGL scene (meshes, lights, controls). */
  children: ReactNode;
  /** Accessible name for the scene — mirrors the role="img" pattern used by the SVG exhibits. */
  label: string;
  /** Optional longer screen-reader description, rendered visually hidden. */
  description?: string;
  className?: string;
  camera?: CanvasProps["camera"];
  /**
   * "always" renders every frame (for continuous motion); "demand" only renders
   * on invalidation. Exhibits should pass "demand" when honouring reduced motion.
   */
  frameloop?: CanvasProps["frameloop"];
}

/**
 * Themed react-three-fiber canvas for the visualisation library. Bakes in the
 * shared canvas background, flat colour management (so materials read as the
 * exact `vizTokens` values rather than tone-mapped), and the same
 * role="img" + sr-only-description accessibility shape the SVG scenes use.
 *
 * Client-only by construction (WebGL); safe under `output: "export"` because
 * the <Canvas> mounts and initialises its context on the client after hydration.
 */
export function VizCanvas({
  children,
  label,
  description,
  className,
  camera,
  frameloop = "always",
}: VizCanvasProps) {
  const [capability, setCapability] = useState<WebGlCapability>("checking");
  useEffect(() => setCapability(detectWebGlCapability()), []);

  // A WebGL global can exist even when context creation fails (for example on
  // restricted or software-rendered devices), so probe a real context first.
  const canRenderWebGl = capability === "available";

  return (
    <div role="img" aria-label={label} className={className ?? "h-full w-full"}>
      {description ? <span className="sr-only">{description}</span> : null}
      {canRenderWebGl ? (
        <Canvas
          aria-hidden
          dpr={[1, 2]}
          frameloop={frameloop}
          camera={camera ?? { position: [0, 0, 6], fov: 45 }}
          gl={{ antialias: true, toneMapping: NoToneMapping }}
        >
          <color attach="background" args={[vizTokens.canvas]} />
          {children}
        </Canvas>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface)] px-6 pb-16 pt-40 text-center sm:p-6">
          <p className="max-w-xl text-sm leading-6 text-on-surface-variant">
            {capability === "unavailable"
              ? `The 3D view is unavailable in this browser. ${description ?? label}`
              : "Preparing the 3D visualisation…"}
          </p>
        </div>
      )}
    </div>
  );
}
