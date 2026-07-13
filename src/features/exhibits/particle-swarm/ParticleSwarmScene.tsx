"use client";

import { Line, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { VizCanvas } from "@/lib/three/VizCanvas";
import { vizTokens } from "@/lib/vizTokens";
import type { ExhibitSceneProps } from "../types";
import {
  DEFAULT_PARAMETERS,
  DOMAIN,
  evolveSwarm,
  initialSwarm,
  objective,
  particleForces,
  predatorAt,
  stepSwarm,
  type Point,
  type Repulsor,
  type SwarmParameters,
  type SwarmState,
} from "./model";

const STEP_ITERATIONS = [0, 1, 5, 14] as const;
const HEIGHT_SCALE = 0.05;
const SURFACE_LIFT = 0.055;
const FORCE_DISPLAY_SCALE = 1.65;
const INITIAL_CAMERA_RIGHT = { x: 0.744, y: -0.668 } as const;
const INITIAL_BEST_SCORE = initialSwarm().globalBestScore;

function heightAt(point: Point) {
  return objective(point) * HEIGHT_SCALE;
}

function scenePoint(point: Point, lift = SURFACE_LIFT): [number, number, number] {
  return [point.x, heightAt(point) + lift, point.y];
}

function buildLandscapeGeometry() {
  const segments = 82;
  const positions: number[] = [];
  const colours: number[] = [];
  const indices: number[] = [];
  const low = new THREE.Color("#F2EEE4");
  const middle = new THREE.Color("#D7CBB8");
  const high = new THREE.Color("#A86B61");

  for (let row = 0; row <= segments; row += 1) {
    const z = DOMAIN.min + (row / segments) * (DOMAIN.max - DOMAIN.min);
    for (let column = 0; column <= segments; column += 1) {
      const x = DOMAIN.min + (column / segments) * (DOMAIN.max - DOMAIN.min);
      const height = heightAt({ x, y: z });
      positions.push(x, height, z);
      const normalised = Math.min(1, objective({ x, y: z }) / 72);
      const colour = normalised < 0.5
        ? low.clone().lerp(middle, normalised * 2)
        : middle.clone().lerp(high, (normalised - 0.5) * 2);
      colours.push(colour.r, colour.g, colour.b);
    }
  }

  for (let row = 0; row < segments; row += 1) {
    for (let column = 0; column < segments; column += 1) {
      const a = row * (segments + 1) + column;
      const b = a + 1;
      const c = a + segments + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colours, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function Landscape() {
  const geometry = useMemo(() => buildLandscapeGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial vertexColors roughness={0.92} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geometry} position={[0, 0.008, 0]}>
        <meshBasicMaterial color={vizTokens.axis} wireframe transparent opacity={0.055} />
      </mesh>
    </group>
  );
}

function GroundGrid() {
  const lines = useMemo(() => {
    const result: [number, number, number][][] = [];
    for (let value = -5; value <= 5; value += 1) {
      result.push([[value, 0, DOMAIN.min], [value, 0, DOMAIN.max]]);
      result.push([[DOMAIN.min, 0, value], [DOMAIN.max, 0, value]]);
    }
    return result;
  }, []);

  return (
    <group>
      {lines.map((points, index) => <Line key={index} points={points} color={vizTokens.grid} lineWidth={1} transparent opacity={0.78} />)}
      <Line points={[[DOMAIN.min, 0, 0], [DOMAIN.max, 0, 0]]} color={vizTokens.axis} lineWidth={1.4} />
      <Line points={[[0, 0, DOMAIN.min], [0, 0, DOMAIN.max]]} color={vizTokens.axis} lineWidth={1.4} />
      <Line points={[[DOMAIN.min, 0, DOMAIN.min], [DOMAIN.min, 4.8, DOMAIN.min]]} color={vizTokens.axis} lineWidth={1.4} />
    </group>
  );
}

function FlockAgent({
  point,
  leader,
  reducedMotion,
}: {
  point: SwarmState["particles"][number];
  leader: boolean;
  reducedMotion: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const leftWing = useRef<THREE.Mesh>(null);
  const rightWing = useRef<THREE.Mesh>(null);
  const [initialPosition] = useState(() => scenePoint(point, 0.2));
  const target = useMemo(() => new THREE.Vector3(...scenePoint(point, 0.2)), [point]);
  const colour = leader ? vizTokens.path : point.id % 2 === 0 ? vizTokens.classA : vizTokens.classB;

  useFrame(({ clock }, delta) => {
    if (!root.current) return;
    const amount = reducedMotion ? 1 : 1 - Math.exp(-delta * 6.5);
    root.current.position.lerp(target, amount);
    const destinationYaw = Math.atan2(point.velocity.x, point.velocity.y);
    const yawDelta = Math.atan2(
      Math.sin(destinationYaw - root.current.rotation.y),
      Math.cos(destinationYaw - root.current.rotation.y),
    );
    root.current.rotation.y += yawDelta * amount;
    root.current.rotation.z = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 3.2 + point.id) * 0.07;
    const flap = reducedMotion ? 0.16 : 0.2 + Math.sin(clock.elapsedTime * 7.5 + point.id * 0.8) * 0.25;
    if (leftWing.current) leftWing.current.rotation.z = flap;
    if (rightWing.current) rightWing.current.rotation.z = -flap;
  });

  return (
    <group ref={root} position={initialPosition} scale={leader ? 1.35 : 1} renderOrder={leader ? 8 : 6}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.075, 0.34, 7]} />
        <meshStandardMaterial color={colour} roughness={0.42} depthTest={false} />
      </mesh>
      <mesh ref={leftWing} position={[-0.12, 0, 0.015]} rotation={[0.06, -0.18, 0.2]}>
        <boxGeometry args={[0.25, 0.018, 0.095]} />
        <meshStandardMaterial color={colour} roughness={0.5} depthTest={false} />
      </mesh>
      <mesh ref={rightWing} position={[0.12, 0, 0.015]} rotation={[0.06, 0.18, -0.2]}>
        <boxGeometry args={[0.25, 0.018, 0.095]} />
        <meshStandardMaterial color={colour} roughness={0.5} depthTest={false} />
      </mesh>
      {leader ? (
        <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.12, 0.18, 24]} />
          <meshBasicMaterial color={vizTokens.path} side={THREE.DoubleSide} depthTest={false} />
        </mesh>
      ) : null}
    </group>
  );
}

function Predator({ point, reducedMotion }: { point: Point; reducedMotion: boolean }) {
  const root = useRef<THREE.Group>(null);
  const [initialPosition] = useState(() => scenePoint(point, 0.72));
  const target = useMemo(() => new THREE.Vector3(...scenePoint(point, 0.72)), [point]);

  useFrame(({ clock }, delta) => {
    if (!root.current) return;
    root.current.position.lerp(target, reducedMotion ? 1 : 1 - Math.exp(-delta * 4));
    if (!reducedMotion) root.current.position.y += Math.sin(clock.elapsedTime * 3.5) * 0.002;
    root.current.rotation.y = -clock.elapsedTime * 0.22;
  });

  const surface = scenePoint(point, 0.045);
  return (
    <group>
      <Line points={[surface, target.toArray() as [number, number, number]]} color={vizTokens.error} lineWidth={1.5} dashed dashSize={0.08} gapSize={0.06} transparent opacity={0.65} />
      <mesh position={surface} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.68, 42]} />
        <meshBasicMaterial color={vizTokens.error} side={THREE.DoubleSide} transparent opacity={0.7} />
      </mesh>
      <group ref={root} position={initialPosition} scale={1.35} renderOrder={10}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.12, 0.48, 4]} />
          <meshStandardMaterial color={vizTokens.ink} roughness={0.35} depthTest={false} />
        </mesh>
        <mesh position={[-0.2, 0, 0.03]} rotation={[0, -0.2, -0.3]}>
          <boxGeometry args={[0.38, 0.025, 0.13]} />
          <meshStandardMaterial color={vizTokens.error} depthTest={false} />
        </mesh>
        <mesh position={[0.2, 0, 0.03]} rotation={[0, 0.2, 0.3]}>
          <boxGeometry args={[0.38, 0.025, 0.13]} />
          <meshStandardMaterial color={vizTokens.error} depthTest={false} />
        </mesh>
      </group>
    </group>
  );
}

function ForceArrow({ from, to, colour }: { from: [number, number, number]; to: [number, number, number]; colour: string }) {
  const direction = new THREE.Vector3(...to).sub(new THREE.Vector3(...from));
  const length = direction.length();
  if (length < 0.025) return null;
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());

  return <group>
    <Line points={[from, to]} color={colour} lineWidth={4} depthTest={false} />
    <mesh position={to} quaternion={quaternion} renderOrder={12}>
      <coneGeometry args={[0.085, 0.25, 12]} />
      <meshBasicMaterial color={colour} depthTest={false} />
    </mesh>
  </group>;
}

function Swarm3D({ state, preview, parameters, reducedMotion, repulsor }: { state: SwarmState; preview: SwarmState; parameters: SwarmParameters; reducedMotion: boolean; repulsor?: Repulsor }) {
  const best = scenePoint(state.globalBest, 0.1);
  const leaderId = state.particles.reduce((winner, particle) => particle.bestScore < winner.bestScore ? particle : winner).id;
  const focusParticle = state.particles.reduce((winner, candidate) => {
    const forces = particleForces(state, candidate, DEFAULT_PARAMETERS);
    const winnerForces = particleForces(state, winner, DEFAULT_PARAMETERS);
    const score = Math.abs(forces.inertia.x * INITIAL_CAMERA_RIGHT.x + forces.inertia.y * INITIAL_CAMERA_RIGHT.y)
      + Math.abs(forces.cognitive.x * INITIAL_CAMERA_RIGHT.x + forces.cognitive.y * INITIAL_CAMERA_RIGHT.y)
      + Math.abs(forces.social.x * INITIAL_CAMERA_RIGHT.x + forces.social.y * INITIAL_CAMERA_RIGHT.y);
    const winnerScore = Math.abs(winnerForces.inertia.x * INITIAL_CAMERA_RIGHT.x + winnerForces.inertia.y * INITIAL_CAMERA_RIGHT.y)
      + Math.abs(winnerForces.cognitive.x * INITIAL_CAMERA_RIGHT.x + winnerForces.cognitive.y * INITIAL_CAMERA_RIGHT.y)
      + Math.abs(winnerForces.social.x * INITIAL_CAMERA_RIGHT.x + winnerForces.social.y * INITIAL_CAMERA_RIGHT.y);
    return score > winnerScore ? candidate : winner;
  });
  const focus = { particle: focusParticle, forces: particleForces(state, focusParticle, parameters, repulsor) };
  const forceHeight = heightAt(focus.particle) + 1.18;
  const forceStart: [number, number, number] = [focus.particle.x, forceHeight, focus.particle.y];
  const focusPosition = scenePoint(focus.particle, 0.18);
  const inertiaEnd: [number, number, number] = [forceStart[0] + focus.forces.inertia.x * FORCE_DISPLAY_SCALE, forceHeight, forceStart[2] + focus.forces.inertia.y * FORCE_DISPLAY_SCALE];
  const cognitiveEnd: [number, number, number] = [inertiaEnd[0] + focus.forces.cognitive.x * FORCE_DISPLAY_SCALE, forceHeight, inertiaEnd[2] + focus.forces.cognitive.y * FORCE_DISPLAY_SCALE];
  const socialEnd: [number, number, number] = [cognitiveEnd[0] + focus.forces.social.x * FORCE_DISPLAY_SCALE, forceHeight, cognitiveEnd[2] + focus.forces.social.y * FORCE_DISPLAY_SCALE];
  const repulsionEnd: [number, number, number] = [socialEnd[0] + focus.forces.repulsion.x * FORCE_DISPLAY_SCALE, forceHeight, socialEnd[2] + focus.forces.repulsion.y * FORCE_DISPLAY_SCALE];
  const forecastEnd: [number, number, number] = [forceStart[0] + focus.forces.velocity.x * FORCE_DISPLAY_SCALE, forceHeight, forceStart[2] + focus.forces.velocity.y * FORCE_DISPLAY_SCALE];

  return (
    <VizCanvas
      label="Three-dimensional particle swarm landscape"
      description="A rotatable Rastrigin cost surface with many local basins. One ringed particle shows its inertia, personal-best pull, shared-best pull, and combined next move as uniformly enlarged arrows. The whole swarm shares one gold leader; an optional predator adds a repulsive component."
      camera={{ position: [10.6, 8.2, 11.8], fov: 44, near: 0.1, far: 80 }}
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <ambientLight intensity={1.45} />
      <directionalLight position={[6, 10, 7]} intensity={2.35} />
      <directionalLight position={[-7, 4, -4]} intensity={0.45} />
      <GroundGrid />
      <Landscape />

      {state.particles.map((particle, index) => {
        const position = scenePoint(particle, 0.11);
        const personalBest = scenePoint(particle.best, 0.075);
        const forecast = scenePoint(preview.particles[index], 0.11);
        return (
          <group key={particle.id}>
            <Line points={[position, personalBest]} color={vizTokens.classA} lineWidth={1} dashed dashSize={0.08} gapSize={0.06} transparent opacity={0.42} />
            <Line points={[position, forecast]} color={vizTokens.path} lineWidth={1.2} transparent opacity={0.28} />
            <mesh position={personalBest} renderOrder={3}>
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshBasicMaterial color={vizTokens.classA} depthTest={false} />
            </mesh>
            <FlockAgent point={particle} leader={particle.id === leaderId} reducedMotion={reducedMotion} />
          </group>
        );
      })}

      <mesh position={forceStart} rotation={[-Math.PI / 2, 0, 0]} renderOrder={11}>
        <ringGeometry args={[0.25, 0.34, 24]} />
        <meshBasicMaterial color={vizTokens.ink} side={THREE.DoubleSide} depthTest={false} />
      </mesh>
      <Line points={[focusPosition, forceStart]} color={vizTokens.ink} lineWidth={1.5} dashed dashSize={0.08} gapSize={0.06} transparent opacity={0.58} depthTest={false} />
      <ForceArrow from={forceStart} to={inertiaEnd} colour={vizTokens.mutedInk} />
      <ForceArrow from={inertiaEnd} to={cognitiveEnd} colour={vizTokens.classA} />
      <ForceArrow from={cognitiveEnd} to={socialEnd} colour={vizTokens.path} />
      {repulsor ? <ForceArrow from={socialEnd} to={repulsionEnd} colour={vizTokens.error} /> : null}
      <ForceArrow from={forceStart} to={forecastEnd} colour={vizTokens.selection} />

      {repulsor ? <Predator point={repulsor} reducedMotion={reducedMotion} /> : null}

      <Line points={[[0, 0.04, 0], [0, 0.62, 0]]} color={vizTokens.classA} lineWidth={1.5} dashed dashSize={0.07} gapSize={0.05} transparent opacity={0.72} />
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.3, 32]} />
        <meshBasicMaterial color={vizTokens.classA} side={THREE.DoubleSide} />
      </mesh>

      <Line points={[[best[0], 0, best[2]], best]} color={vizTokens.path} lineWidth={1.5} dashed dashSize={0.08} gapSize={0.055} transparent opacity={0.7} />
      <mesh position={best} rotation={[-Math.PI / 2, 0, 0]} renderOrder={5}>
        <ringGeometry args={[0.16, 0.27, 32]} />
        <meshBasicMaterial color={vizTokens.path} side={THREE.DoubleSide} depthTest={false} />
      </mesh>
      <mesh position={best} renderOrder={6}>
        <sphereGeometry args={[0.09, 18, 18]} />
        <meshBasicMaterial color={vizTokens.path} depthTest={false} />
      </mesh>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={8}
        maxDistance={23}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.08}
        target={[0, 1.25, 0]}
      />
    </VizCanvas>
  );
}

export default function ParticleSwarmScene({ step, resetKey, playing = false }: ExhibitSceneProps) {
  const initialIteration = STEP_ITERATIONS[Math.max(0, Math.min(STEP_ITERATIONS.length - 1, step))];
  const reducedMotion = Boolean(useReducedMotion());
  const [parameters, setParameters] = useState<SwarmParameters>(DEFAULT_PARAMETERS);
  const [state, setState] = useState<SwarmState>(() => evolveSwarm(initialIteration));
  const [running, setRunning] = useState(false);
  const [predatorActive, setPredatorActive] = useState(step >= 3);

  useEffect(() => {
    setParameters(DEFAULT_PARAMETERS);
    const preset = evolveSwarm(initialIteration);
    setState(preset);
    setRunning(false);
    setPredatorActive(step >= 3);
  }, [initialIteration, resetKey, step]);

  useEffect(() => {
    if (!playing) return;
    setRunning(true);
    return () => setRunning(false);
  }, [initialIteration, playing, resetKey]);

  useEffect(() => {
    if (!running || state.iteration >= 30) return;
    const timer = window.setTimeout(() => setState((current) => {
      const predator = predatorActive ? { ...predatorAt(current.iteration), radius: 2.15, strength: 1.35 } : undefined;
      return stepSwarm(current, parameters, predator);
    }), 420);
    return () => window.clearTimeout(timer);
  }, [parameters, predatorActive, running, state.iteration]);

  const repulsor = useMemo(
    () => predatorActive ? { ...predatorAt(state.iteration), radius: 2.15, strength: 1.35 } : undefined,
    [predatorActive, state.iteration],
  );
  const preview = useMemo(() => stepSwarm(
    state,
    parameters,
    repulsor,
  ), [parameters, repulsor, state]);
  const exploration = state.particles.reduce((sum, particle) => sum + Math.hypot(particle.x - state.globalBest.x, particle.y - state.globalBest.y), 0) / state.particles.length;
  const improvement = Math.max(0, INITIAL_BEST_SCORE - state.globalBestScore);

  function restart() {
    const initial = initialSwarm();
    setState(initial);
    setRunning(false);
  }

  function takeStep() {
    setRunning(false);
    setState((current) => {
      const predator = predatorActive ? { ...predatorAt(current.iteration), radius: 2.15, strength: 1.35 } : undefined;
      return stepSwarm(current, parameters, predator);
    });
  }

  const status = `Iteration ${state.iteration}. Best objective ${state.globalBestScore.toFixed(3)} at x ${state.globalBest.x.toFixed(2)}, y ${state.globalBest.y.toFixed(2)}. Mean swarm distance ${exploration.toFixed(2)}. Force weights: inertia ${parameters.inertia.toFixed(2)}, personal pull ${parameters.cognitive.toFixed(2)}, shared pull ${parameters.social.toFixed(2)}.${predatorActive ? " Repulsion is active." : ""}`;

  return (
    <section aria-label="Particle swarm optimisation visualisation" className="grid h-full min-h-[22rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border border-outline bg-surface">
      <div className="relative min-h-0 overflow-hidden">
        <Swarm3D state={state} preview={preview} parameters={parameters} reducedMotion={reducedMotion} repulsor={repulsor} />

        <div className="pointer-events-none absolute left-3 top-3 hidden border border-outline bg-surface/92 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.08em] text-on-surface-variant backdrop-blur-sm sm:block">
          <span>position x₁, x₂</span><span className="px-2 text-outline-dark">→</span><span className="text-primary">height = objective cost</span>
        </div>
        <div className="pointer-events-none absolute right-3 top-3 w-44 border border-outline bg-surface/94 p-2 backdrop-blur-sm sm:right-4 sm:top-4 sm:w-64 sm:p-3">
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface-variant">
            <span>Swarm state</span><span className="text-primary">iteration {state.iteration}</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-outline pt-2 font-mono text-[9px] sm:gap-x-4 sm:border-y sm:py-2 sm:text-[10px]">
            <span className="text-on-surface-variant">shared best</span><span className="text-right text-primary">{state.globalBestScore.toFixed(3)}</span>
            <span className="hidden text-on-surface-variant sm:inline">mean spread</span><span className="hidden text-right text-warning sm:inline">{exploration.toFixed(2)}</span>
            <span className="hidden text-on-surface-variant sm:inline">cost reduced</span><span className="hidden text-right text-on-surface sm:inline">{improvement.toFixed(2)}</span>
          </div>
          <div className="mt-2 hidden grid-cols-[auto_1fr] gap-x-2 gap-y-1 font-mono text-[8px] uppercase tracking-[0.06em] text-on-surface-variant sm:grid">
            <span><span className="text-primary">◆</span> <span className="text-error">◆</span></span><span>two scouting wings</span>
            <span className="text-on-surface">◎</span><span>focused forces · enlarged</span>
            <span className="text-on-surface-variant">→</span><span>inertia component</span>
            <span className="text-primary">→</span><span>personal-best pull</span>
            <span className="text-warning">→</span><span>shared-best pull</span>
            <span className="text-error">→</span><span>combined next move</span>
            {predatorActive ? <><span className="text-error">→</span><span>repulsion component</span></> : null}
            <span className="text-warning">◎</span><span>shared leader / global best</span>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-3 left-3 border border-outline bg-surface/90 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-on-surface-variant backdrop-blur-sm sm:left-4 sm:text-[9px]">
          Drag to orbit · lower basins are better · birds point along velocity
        </div>
        <p className="sr-only" aria-live="polite">{status}</p>
      </div>

      <div className="grid gap-2 border-t border-outline bg-surface-container-low p-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end sm:px-3">
        {(["inertia", "cognitive", "social"] as const).map((key) => (
          <label key={key} className="min-w-0">
            <span className="flex justify-between font-mono text-[9px] uppercase tracking-label text-on-surface-variant"><span>{key}</span><span className="text-primary">{parameters[key].toFixed(2)}</span></span>
            <input aria-label={key} type="range" min="0" max="2.2" step="0.05" value={parameters[key]} onChange={(event) => setParameters((current) => ({ ...current, [key]: Number(event.target.value) }))} />
          </label>
        ))}
        <div className="flex gap-2">
          <button type="button" onClick={takeStep} className="min-h-9 border border-primary bg-primary px-3 text-xs text-on-primary">Step</button>
          <button type="button" onClick={() => setRunning((value) => !value)} className="min-h-9 border border-outline bg-surface px-3 text-xs hover:border-primary">{running ? "Pause" : "Run"}</button>
          <button type="button" aria-pressed={predatorActive} onClick={() => setPredatorActive((value) => !value)} className={`min-h-9 border px-3 text-xs ${predatorActive ? "border-error bg-error text-on-error" : "border-outline bg-surface hover:border-error"}`}>{predatorActive ? "Recall predator" : "Release predator"}</button>
          <button type="button" onClick={restart} className="min-h-9 border border-outline bg-surface px-3 text-xs hover:border-primary">Restart</button>
        </div>
      </div>
    </section>
  );
}
