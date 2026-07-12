"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import { NoToneMapping } from "three";
import { useEffect, useState, type ReactNode } from "react";
import { vizTokens } from "@/lib/vizTokens";

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // react-three-fiber needs a real WebGL context. Keeping the accessible shell
  // when WebGL is unavailable also makes the explanatory text and controls
  // useful in assistive/test environments instead of failing the whole scene.
  const canRenderWebGl = mounted && typeof WebGLRenderingContext !== "undefined";

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
        <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface)] p-6 text-center">
          <p className="max-w-xl text-sm leading-6 text-on-surface-variant">
            {mounted
              ? `The 3D view is unavailable in this browser. ${description ?? label}`
              : "Preparing the 3D visualisation…"}
          </p>
        </div>
      )}
    </div>
  );
}
