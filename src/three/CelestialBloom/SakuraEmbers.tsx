import { useRef, useMemo, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getPetalTexture, getGlowTexture } from '../utils/texture';

const AMBIENT_PETAL_COUNT = 140;
const AMBIENT_EMBER_COUNT = 90;
const BURST_COUNT = 70;

function createSeededRandom(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * SakuraEmbers — Kyoto Night Temple Flora & Golden Embers
 * Drifting cherry blossom petals and glowing golden fireflies,
 * complete with tactile cursor raycast bursts on user interaction.
 */
export function SakuraEmbers() {
  const { camera, size } = useThree();
  const petalPointsRef = useRef<THREE.Points>(null);
  const emberPointsRef = useRef<THREE.Points>(null);
  const burstPointsRef = useRef<THREE.Points>(null);

  const petalTexture = useMemo(() => getPetalTexture(), []);
  const glowTexture = useMemo(() => getGlowTexture(), []);

  // 1. Ambient drifting sakura petals data (stored in ref for mutable performance)
  const petalsRef = useRef(() => {
    const rng = createSeededRandom(42817);
    const pos = new Float32Array(AMBIENT_PETAL_COUNT * 3);
    const sizes = new Float32Array(AMBIENT_PETAL_COUNT);
    const speeds = new Float32Array(AMBIENT_PETAL_COUNT);
    const sways = new Float32Array(AMBIENT_PETAL_COUNT);
    const phases = new Float32Array(AMBIENT_PETAL_COUNT);

    for (let i = 0; i < AMBIENT_PETAL_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (rng() - 0.5) * 14;      // X
      pos[i3 + 1] = (rng() - 0.5) * 12;  // Y
      pos[i3 + 2] = (rng() - 0.5) * 8;   // Z

      sizes[i] = 0.22 + rng() * 0.26;
      speeds[i] = 0.18 + rng() * 0.25;
      sways[i] = 0.35 + rng() * 0.45;
      phases[i] = rng() * Math.PI * 2;
    }

    return { pos, sizes, speeds, sways, phases };
  });
  const petals = useMemo(() => petalsRef.current(), []);

  // 2. Ambient golden temple fireflies / lantern embers data
  const embersRef = useRef(() => {
    const rng = createSeededRandom(88123);
    const pos = new Float32Array(AMBIENT_EMBER_COUNT * 3);
    const colors = new Float32Array(AMBIENT_EMBER_COUNT * 3);
    const sizes = new Float32Array(AMBIENT_EMBER_COUNT);

    const warmGold = new THREE.Color('#f9d342');
    const vermilion = new THREE.Color('#e0231c');
    const lunarWhite = new THREE.Color('#eef5f0');

    for (let i = 0; i < AMBIENT_EMBER_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (rng() - 0.5) * 10;
      pos[i3 + 1] = (rng() - 0.5) * 9;
      pos[i3 + 2] = (rng() - 0.5) * 7;

      sizes[i] = 0.08 + rng() * 0.12;

      const pick = rng();
      const col = pick < 0.65 ? warmGold : pick < 0.85 ? vermilion : lunarWhite;
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    return { pos, colors, sizes };
  });
  const embers = useMemo(() => embersRef.current(), []);

  // 3. Dynamic interactive burst pool
  const burstDataRef = useRef(() => {
    const pos = new Float32Array(BURST_COUNT * 3);
    const vel = new Float32Array(BURST_COUNT * 3);
    const life = new Float32Array(BURST_COUNT);
    const maxLife = new Float32Array(BURST_COUNT);
    const sizes = new Float32Array(BURST_COUNT);

    for (let i = 0; i < BURST_COUNT; i++) {
      pos[i * 3] = 9999;
      pos[i * 3 + 1] = 9999;
      pos[i * 3 + 2] = 9999;
      life[i] = 0;
      maxLife[i] = 1.6;
      sizes[i] = 0.28;
    }

    return { pos, vel, life, maxLife, sizes, head: 0 };
  });
  const burstData = useMemo(() => burstDataRef.current(), []);

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const intersect = useMemo(() => new THREE.Vector3(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);

  const spawnBurst = useCallback((origin: THREE.Vector3) => {
    for (let k = 0; k < 25; k++) {
      const i = burstData.head;
      burstData.head = (burstData.head + 1) % BURST_COUNT;
      const i3 = i * 3;

      burstData.pos[i3] = origin.x + (Math.random() - 0.5) * 0.2;
      burstData.pos[i3 + 1] = origin.y + (Math.random() - 0.5) * 0.2;
      burstData.pos[i3 + 2] = origin.z + (Math.random() - 0.5) * 0.2;

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 1.6;
      const elevation = (Math.random() - 0.3) * 1.2;

      burstData.vel[i3] = Math.cos(angle) * speed;
      burstData.vel[i3 + 1] = Math.sin(angle) * speed + 0.4;
      burstData.vel[i3 + 2] = elevation;

      burstData.life[i] = 1.0;
      burstData.maxLife[i] = 1.2 + Math.random() * 0.8;
      burstData.sizes[i] = 0.24 + Math.random() * 0.2;
    }
  }, [burstData]);

  useEffect(() => {
    const handleBurstEvent = (e: CustomEvent<{ x?: number; y?: number }>) => {
      if (e.detail?.x !== undefined && e.detail?.y !== undefined) {
        ndc.x = (e.detail.x / size.width) * 2 - 1;
        ndc.y = -(e.detail.y / size.height) * 2 + 1;
        raycaster.setFromCamera(ndc, camera);
        if (raycaster.ray.intersectPlane(plane, intersect)) {
          spawnBurst(intersect);
          return;
        }
      }
      // Fallback: burst outward from center
      spawnBurst(new THREE.Vector3(0, 0, 0));
    };

    window.addEventListener('nexus-synaptic-burst' as any, handleBurstEvent as any);
    window.addEventListener('nexus-stimulate-brain' as any, handleBurstEvent as any);
    window.addEventListener('nexus-stimulate-blossom' as any, handleBurstEvent as any);

    return () => {
      window.removeEventListener('nexus-synaptic-burst' as any, handleBurstEvent as any);
      window.removeEventListener('nexus-stimulate-brain' as any, handleBurstEvent as any);
      window.removeEventListener('nexus-stimulate-blossom' as any, handleBurstEvent as any);
    };
  }, [camera, size, plane, raycaster, intersect, ndc, spawnBurst]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    // 1. Update ambient falling sakura petals
    if (petalPointsRef.current) {
      const pos = petals.pos;
      for (let i = 0; i < AMBIENT_PETAL_COUNT; i++) {
        const i3 = i * 3;
        // Slow downward drift
        pos[i3 + 1] -= petals.speeds[i] * dt;
        // Horizontal breeze sway
        pos[i3] += Math.sin(time * 0.8 + petals.phases[i]) * petals.sways[i] * dt * 0.6;
        // Subtle forward-back swirl
        pos[i3 + 2] += Math.cos(time * 0.6 + petals.phases[i]) * 0.15 * dt;

        // Wrap around boundary
        if (pos[i3 + 1] < -6) {
          pos[i3 + 1] = 6;
          pos[i3] = (Math.random() - 0.5) * 14;
        }
      }
      petalPointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Update ambient golden embers
    if (emberPointsRef.current) {
      const pos = embers.pos;
      for (let i = 0; i < AMBIENT_EMBER_COUNT; i++) {
        const i3 = i * 3;
        // Upward buoyant drift
        pos[i3 + 1] += 0.1 * dt;
        pos[i3] += Math.sin(time * 1.2 + i * 0.5) * 0.08 * dt;
        pos[i3 + 2] += Math.cos(time * 0.9 + i * 0.4) * 0.08 * dt;

        if (pos[i3 + 1] > 5) {
          pos[i3 + 1] = -5;
          pos[i3] = (Math.random() - 0.5) * 10;
        }
      }
      emberPointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Update interactive burst petals
    if (burstPointsRef.current) {
      const pos = burstData.pos;
      const vel = burstData.vel;
      const life = burstData.life;
      const maxLife = burstData.maxLife;

      for (let i = 0; i < BURST_COUNT; i++) {
        if (life[i] > 0) {
          life[i] -= dt / maxLife[i];
          if (life[i] <= 0) {
            pos[i * 3] = 9999;
          } else {
            const i3 = i * 3;
            pos[i3] += vel[i3] * dt;
            pos[i3 + 1] += vel[i3 + 1] * dt;
            pos[i3 + 2] += vel[i3 + 2] * dt;

            // Drag and gentle gravity
            vel[i3] *= 0.95;
            vel[i3 + 1] -= 0.35 * dt; // gravity
            vel[i3 + 2] *= 0.95;
          }
        }
      }
      burstPointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Ambient Drifting Sakura Petals */}
      <points ref={petalPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[petals.pos, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[petals.sizes, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.28}
          map={petalTexture}
          transparent
          opacity={0.82}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>

      {/* Ambient Golden Lantern Embers */}
      <points ref={emberPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[embers.pos, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[embers.colors, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[embers.sizes, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          map={glowTexture}
          vertexColors
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Interactive Burst Sakura Petals */}
      <points ref={burstPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[burstData.pos, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[burstData.sizes, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.34}
          map={petalTexture}
          transparent
          opacity={0.92}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>
    </>
  );
}
