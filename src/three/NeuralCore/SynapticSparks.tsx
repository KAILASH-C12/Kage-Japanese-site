import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getGlowTexture } from '../utils/texture';

const MAX_SPARKS = 400;

/**
 * SynapticSparks
 * Emits glowing stardust particles from cursor motion and click bursts,
 * matching the pollen/spray emitter from the Sylva / Manus motion primitives.
 */
export function SynapticSparks() {
  const { camera, size } = useThree();
  const pointsRef = useRef<THREE.Points>(null);
  const glowTexture = useMemo(() => getGlowTexture(), []);

  const data = useMemo(() => {
    const pos = new Float32Array(MAX_SPARKS * 3);
    const vel = new Float32Array(MAX_SPARKS * 3);
    const life = new Float32Array(MAX_SPARKS);
    const maxLife = new Float32Array(MAX_SPARKS);
    const colors = new Float32Array(MAX_SPARKS * 3);

    for (let i = 0; i < MAX_SPARKS; i++) {
      pos[i * 3] = 9999;
      pos[i * 3 + 1] = 9999;
      pos[i * 3 + 2] = 9999;
      life[i] = 0;
      maxLife[i] = 1.5;
    }

    return { pos, vel, life, maxLife, colors, head: 0 };
  }, []);

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const intersect = useMemo(() => new THREE.Vector3(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);

  const spawnSpark = (origin: THREE.Vector3, boost = 1) => {
    const i = data.head;
    data.head = (data.head + 1) % MAX_SPARKS;
    const i3 = i * 3;

    data.pos[i3] = origin.x + (Math.random() - 0.5) * 0.1 * boost;
    data.pos[i3 + 1] = origin.y + (Math.random() - 0.5) * 0.1 * boost;
    data.pos[i3 + 2] = origin.z + (Math.random() - 0.5) * 0.15;

    data.vel[i3] = (Math.random() - 0.5) * 0.8 * boost;
    data.vel[i3 + 1] = (Math.random() * 0.6 + 0.1) * boost;
    data.vel[i3 + 2] = (Math.random() - 0.5) * 0.5 * boost;

    data.life[i] = 1.0;
    data.maxLife[i] = 0.8 + Math.random() * 0.8;

    // Cyan / Violet iridescent sparks
    const isCyan = Math.random() > 0.4;
    data.colors[i3] = isCyan ? 0.0 : 0.6;
    data.colors[i3 + 1] = isCyan ? 0.95 : 0.4;
    data.colors[i3 + 2] = 1.0;
  };

  useEffect(() => {
    const handleBurst = (e: CustomEvent<{ x: number; y: number }>) => {
      const { x, y } = e.detail;
      ndc.x = (x / size.width) * 2 - 1;
      ndc.y = -(y / size.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(plane, intersect)) {
        for (let i = 0; i < 35; i++) {
          spawnSpark(intersect, 2.2);
        }
      }
    };

    window.addEventListener('nexus-synaptic-burst' as any, handleBurst as any);
    return () => {
      window.removeEventListener('nexus-synaptic-burst' as any, handleBurst as any);
    };
  }, [camera, size, plane, raycaster, intersect, ndc]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const dt = Math.min(delta, 0.05);

    // Update particles
    for (let i = 0; i < MAX_SPARKS; i++) {
      if (data.life[i] > 0) {
        data.life[i] -= dt / data.maxLife[i];
        if (data.life[i] <= 0) {
          data.pos[i * 3] = 9999;
        } else {
          const i3 = i * 3;
          data.pos[i3] += data.vel[i3] * dt;
          data.pos[i3 + 1] += data.vel[i3 + 1] * dt;
          data.pos[i3 + 2] += data.vel[i3 + 2] * dt;
          data.vel[i3 + 1] += 0.15 * dt; // Slow buoyant upward drift
        }
      }
    }

    const geo = pointsRef.current.geometry;
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[data.pos, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[data.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.065}
        map={glowTexture}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
