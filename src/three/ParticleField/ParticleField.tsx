import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Points } from 'three';
import * as THREE from 'three';
import { useMousePosition } from '../../hooks/useMousePosition';
import { getGlowTexture } from '../utils/texture';

function createSeededRandom(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIELD_RADIUS = 28;

export function ParticleField() {
  const pointsRef = useRef<Points>(null);
  const { normalized } = useMousePosition();
  const glowTexture = useMemo(() => getGlowTexture(), []);
  const isTabVisible = useRef(true);

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const count = isMobile ? 500 : 1100;

  useEffect(() => {
    const handleVisibility = () => {
      isTabVisible.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const { positions, sizes, colors } = useMemo(() => {
    const rng = createSeededRandom(999111);
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const col = new Float32Array(count * 3);

    const dimMist = new THREE.Color('#14181f');
    const lunarWhite = new THREE.Color('#dfe7e0');
    const vermilionAccent = new THREE.Color('#e0231c');
    const lanternGold = new THREE.Color('#f9d342');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (rng() - 0.5) * FIELD_RADIUS * 2;
      pos[i3 + 1] = (rng() - 0.5) * FIELD_RADIUS * 2;
      pos[i3 + 2] = (rng() - 0.5) * FIELD_RADIUS;

      sz[i] = 0.03 + rng() * 0.04;

      const pick = rng();
      const c = pick < 0.16 ? lunarWhite : pick < 0.28 ? lanternGold : pick < 0.38 ? vermilionAccent : dimMist;
      col[i3] = c.r;
      col[i3 + 1] = c.g;
      col[i3 + 2] = c.b;
    }

    return { positions: pos, sizes: sz, colors: col };
  }, [count]);

  useFrame((state) => {
    if (!isTabVisible.current || !pointsRef.current) return;
    const time = state.clock.elapsedTime;

    // Delta-time based slow drift
    pointsRef.current.rotation.y = time * 0.008 + normalized.current.x * 0.02;
    pointsRef.current.rotation.x = time * 0.005 + normalized.current.y * 0.015;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        map={glowTexture}
        vertexColors
        transparent
        opacity={0.25}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
