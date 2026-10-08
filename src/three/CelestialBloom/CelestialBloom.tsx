import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LotusBlossom } from './LotusBlossom';
import { SilkVeil } from './SilkVeil';
import { SakuraEmbers } from './SakuraEmbers';
import { useMousePosition } from '../../hooks/useMousePosition';
import { subscribeToScroll } from '../../hooks/useSmoothScroll';

// Chapter kinematics checkpoints
interface ChapterPose {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  bloom: number;
}

const CHAPTER_POSES: ChapterPose[] = [
  // 0: Hero (Placed proudly as a flower, open and serene in midnight stillness)
  { pos: [0, -0.22, 0], rot: [0.18, 0, 0], scale: 0.94, bloom: 0.45 },
  // 1: The Hidden Gate / Temples (Drifts right, petals unfolding)
  { pos: [1.25, -0.16, -0.3], rot: [0.22, -0.45, 0.08], scale: 0.98, bloom: 0.65 },
  // 2: Still Gardens / Pathways (Drifts left, wide open bloom)
  { pos: [-1.3, -0.12, -0.25], rot: [0.2, 0.52, -0.1], scale: 1.02, bloom: 0.82 },
  // 3: Sacred Craft / Rituals (Elevated view revealing glowing golden stamen heart)
  { pos: [1.18, -0.18, -0.3], rot: [0.28, -0.32, 0.12], scale: 1.04, bloom: 0.94 },
  // 4: Night Rituals / Afterlight (Ascends gently towards the moon in full celestial bloom)
  { pos: [0, 0.22, -0.5], rot: [0.15, 0.22, 0.0], scale: 0.95, bloom: 1.0 },
];

/**
 * CelestialBloom
 * Central 3D centerpiece for KAGE: Sacred Kyoto Lotus Blossom,
 * flowing Hagoromo silk veil ribbons, and drifting sakura embers.
 * Orchestrates multi-chapter scroll trajectories and interactive gestures.
 */
export function CelestialBloom() {
  const groupRef = useRef<THREE.Group>(null);
  const { normalized } = useMousePosition();

  // Scroll tracking state
  const scrollRef = useRef({
    currentProgress: 0,
    targetProgress: 0,
  });

  // Surge impulse state on click / stimulus (ref-based for 0-rerender 60fps performance)
  const surgeRef = useRef(0);

  // Dynamic bloom factor (ref-based)
  const bloomRef = useRef(0.4);

  // Track window scroll progress synced with Lenis smooth scroll
  useEffect(() => {
    // 1. Direct Lenis smooth scroll subscription
    const unsubscribeLenis = subscribeToScroll((e) => {
      scrollRef.current.targetProgress = e.progress;
    });

    // 2. Native scroll listener fallback
    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollRef.current.targetProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      unsubscribeLenis();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Listen to stimulate events
  useEffect(() => {
    const handleStimulate = () => {
      surgeRef.current = 1.0;
    };

    window.addEventListener('nexus-stimulate-brain', handleStimulate);
    window.addEventListener('nexus-stimulate-blossom', handleStimulate);

    return () => {
      window.removeEventListener('nexus-stimulate-brain', handleStimulate);
      window.removeEventListener('nexus-stimulate-blossom', handleStimulate);
    };
  }, []);

  // Frame animation loop
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    // Smooth scroll interpolation (delta-time damped)
    const scroll = scrollRef.current;
    scroll.currentProgress += (scroll.targetProgress - scroll.currentProgress) * (1 - Math.exp(-3.8 * dt));

    // Determine interpolated chapter pose
    const totalChapters = CHAPTER_POSES.length - 1;
    const scrollIndex = scroll.currentProgress * totalChapters;
    const idxA = Math.min(totalChapters, Math.floor(scrollIndex));
    const idxB = Math.min(totalChapters, idxA + 1);
    const blend = scrollIndex - idxA;

    const poseA = CHAPTER_POSES[idxA];
    const poseB = CHAPTER_POSES[idxB];

    // Smoothstep blend curve
    const smoothBlend = blend * blend * (3 - 2 * blend);

    // Target position
    const targetX = poseA.pos[0] + (poseB.pos[0] - poseA.pos[0]) * smoothBlend;
    const targetY = poseA.pos[1] + (poseB.pos[1] - poseA.pos[1]) * smoothBlend;
    const targetZ = poseA.pos[2] + (poseB.pos[2] - poseA.pos[2]) * smoothBlend;

    // Target rotation
    const targetRotX = poseA.rot[0] + (poseB.rot[0] - poseA.rot[0]) * smoothBlend;
    const targetRotY = poseA.rot[1] + (poseB.rot[1] - poseA.rot[1]) * smoothBlend;
    const targetRotZ = poseA.rot[2] + (poseB.rot[2] - poseA.rot[2]) * smoothBlend;

    // Target scale
    const targetScale = poseA.scale + (poseB.scale - poseA.scale) * smoothBlend;

    // Target bloom
    const targetBloom = poseA.bloom + (poseB.bloom - poseA.bloom) * smoothBlend;

    // Mouse parallax tracking
    const mouseTiltX = normalized.current.y * 0.28;
    const mouseTiltY = normalized.current.x * 0.38;

    // Idle organic float
    const idleY = Math.sin(time * 0.9) * 0.06;
    const idleRotY = Math.sin(time * 0.5) * 0.08;

    // Lerp group transform
    const lambda = 1 - Math.exp(-4.2 * dt);
    groupRef.current.position.x += (targetX - groupRef.current.position.x) * lambda;
    groupRef.current.position.y += (targetY + idleY - groupRef.current.position.y) * lambda;
    groupRef.current.position.z += (targetZ - groupRef.current.position.z) * lambda;

    groupRef.current.rotation.x += (targetRotX + mouseTiltX - groupRef.current.rotation.x) * lambda;
    groupRef.current.rotation.y += (targetRotY + idleRotY + mouseTiltY - groupRef.current.rotation.y) * lambda;
    groupRef.current.rotation.z += (targetRotZ - groupRef.current.rotation.z) * lambda;

    const currentScale = groupRef.current.scale.x;
    const newScale = currentScale + (targetScale - currentScale) * lambda;
    groupRef.current.scale.set(newScale, newScale, newScale);

    // Decay surge impulse
    if (surgeRef.current > 0.001) {
      surgeRef.current *= Math.exp(-2.8 * dt);
    } else {
      surgeRef.current = 0;
    }

    bloomRef.current = targetBloom;
  });

  return (
    <>
      {/* Drifting Petals & Golden Lantern Embers */}
      <SakuraEmbers />

      {/* Main Celestial Blossom & Silk Veil Group */}
      <group ref={groupRef}>
        <LotusBlossom bloomRef={bloomRef} surgeRef={surgeRef} />
        <SilkVeil surgeRef={surgeRef} />
      </group>
    </>
  );
}
