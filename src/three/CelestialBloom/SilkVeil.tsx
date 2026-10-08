import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SilkVeilProps {
  surgeRef?: React.RefObject<number>;
  surgeFactor?: number;
}

interface RibbonData {
  basePositions: Float32Array;
  geometry: THREE.BufferGeometry;
  segments: number;
  widthSegments: number;
  speed: number;
  waveFreq: number;
  waveAmp: number;
}

/**
 * Celestial Silk Veil ("Hagoromo" - 羽衣)
 * Translucent flowing lunar-white & vermilion silk ribbons that swirl weightlessly around the sacred blossom,
 * rippling with sinusoidal cloth physics and glistening with pearl-sheen specular glints.
 */
export function SilkVeil({ surgeRef, surgeFactor = 0 }: SilkVeilProps) {
  const meshRef1 = useRef<THREE.Mesh>(null);
  const meshRef2 = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Sheer gossamer silk material with satin sheen and rim translucency
  const lunarSilkMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#fdfefe'),
      emissive: new THREE.Color('#280d16'),
      roughness: 0.12,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      sheen: 1.0,
      sheenColor: new THREE.Color('#ffaec2'),
      sheenRoughness: 0.2,
      transmission: 0.44,
      thickness: 0.25,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.NormalBlending,
      vertexColors: true,
    });
  }, []);

  // Helper to build a ribbon buffer geometry along a 3D parametric curve
  const createRibbon = (
    curveFn: (t: number) => THREE.Vector3,
    ribbonWidth = 0.58,
    segments = 84,
    widthSegments = 6,
    speed = 1.0,
    waveFreq = 3.5,
    waveAmp = 0.14
  ): RibbonData => {
    const geo = new THREE.BufferGeometry();
    const numVerts = (segments + 1) * (widthSegments + 1);
    const pos = new Float32Array(numVerts * 3);
    const basePos = new Float32Array(numVerts * 3);
    const uvs = new Float32Array(numVerts * 2);
    const colors = new Float32Array(numVerts * 3);
    const indices: number[] = [];

    const lunarCenter = new THREE.Color('#f4f9f6');
    const vermilionEdge = new THREE.Color('#e0231c');

    let vIdx = 0;
    for (let is = 0; is <= segments; is++) {
      const s = is / segments; // 0 to 1 along ribbon length
      const p = curveFn(s);
      const pNext = curveFn(Math.min(1, s + 0.01));
      const tangent = new THREE.Vector3().subVectors(pNext, p).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      const binormal = new THREE.Vector3().crossVectors(tangent, up).normalize();
      if (binormal.lengthSq() < 0.001) {
        binormal.set(1, 0, 0);
      }

      // Taper ribbon width at both ends
      const taper = Math.sin(s * Math.PI) * (0.35 + 0.65 * Math.sin(s * Math.PI));
      const w = ribbonWidth * taper;

      for (let iw = 0; iw <= widthSegments; iw++) {
        const wNorm = iw / widthSegments; // 0 to 1
        const wCentered = (wNorm - 0.5) * 2; // -1 to 1

        const vert = p.clone().addScaledVector(binormal, wCentered * (w * 0.5));

        pos[vIdx * 3] = vert.x;
        pos[vIdx * 3 + 1] = vert.y;
        pos[vIdx * 3 + 2] = vert.z;

        basePos[vIdx * 3] = vert.x;
        basePos[vIdx * 3 + 1] = vert.y;
        basePos[vIdx * 3 + 2] = vert.z;

        uvs[vIdx * 2] = wNorm;
        uvs[vIdx * 2 + 1] = s;

        // Color: Lunar white center fading to delicate vermilion at borders
        const edgeIntensity = Math.pow(Math.abs(wCentered), 2.0);
        const col = lunarCenter.clone().lerp(vermilionEdge, edgeIntensity * 0.55);

        colors[vIdx * 3] = col.r;
        colors[vIdx * 3 + 1] = col.g;
        colors[vIdx * 3 + 2] = col.b;

        vIdx++;
      }
    }

    for (let is = 0; is < segments; is++) {
      for (let iw = 0; iw < widthSegments; iw++) {
        const a = is * (widthSegments + 1) + iw;
        const b = (is + 1) * (widthSegments + 1) + iw;
        const c = (is + 1) * (widthSegments + 1) + (iw + 1);
        const d = is * (widthSegments + 1) + (iw + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return {
      basePositions: basePos,
      geometry: geo,
      segments,
      widthSegments,
      speed,
      waveFreq,
      waveAmp,
    };
  };

  // Ribbon 1: Ascending spiral wrapping around and under the flower
  const ribbon1 = useMemo(() => {
    return createRibbon(
      (s: number) => {
        const angle = s * Math.PI * 3.2 - Math.PI * 0.5;
        const radius = 1.45 + Math.sin(s * Math.PI) * 0.75;
        const x = Math.cos(angle) * radius;
        const y = (s - 0.5) * 2.3 + Math.sin(s * Math.PI * 2) * 0.35;
        const z = Math.sin(angle) * radius;
        return new THREE.Vector3(x, y, z);
      },
      0.62,
      84,
      6,
      1.1,
      4.2,
      0.16
    );
  }, []);

  // Ribbon 2: Counter-orbiting upper silk veil draping across the scene
  const ribbon2 = useMemo(() => {
    return createRibbon(
      (s: number) => {
        const angle = -s * Math.PI * 2.8 + Math.PI * 0.8;
        const radius = 1.68 + Math.cos(s * Math.PI) * 0.5;
        const x = Math.cos(angle) * radius;
        const y = 0.45 + (s - 0.5) * 1.9 + Math.cos(s * Math.PI * 1.5) * 0.4;
        const z = Math.sin(angle) * radius;
        return new THREE.Vector3(x, y, z);
      },
      0.55,
      76,
      6,
      0.9,
      3.8,
      0.14
    );
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const sFactor = surgeRef ? surgeRef.current : surgeFactor;

    // Slow celestial rotation of the entire veil system
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.055;
    }

    // Dynamic wave ripples across Ribbon 1
    if (meshRef1.current) {
      const posAttr = ribbon1.geometry.attributes.position;
      const positions = posAttr.array as Float32Array;
      const base = ribbon1.basePositions;
      const segs = ribbon1.segments;
      const wSegs = ribbon1.widthSegments;

      let idx = 0;
      for (let is = 0; is <= segs; is++) {
        const s = is / segs;
        const wave = Math.sin(time * 1.6 + s * 7.0) * (0.12 + sFactor * 0.25);
        const wave2 = Math.cos(time * 2.1 + s * 11.0) * 0.06;
        const dy = wave + wave2;

        for (let iw = 0; iw <= wSegs; iw++) {
          const i3 = idx * 3;
          positions[i3] = base[i3] + Math.sin(time + s * 4.0) * 0.04;
          positions[i3 + 1] = base[i3 + 1] + dy;
          positions[i3 + 2] = base[i3 + 2] + Math.cos(time * 1.2 + s * 5.0) * 0.05;
          idx++;
        }
      }
      posAttr.needsUpdate = true;
      ribbon1.geometry.computeVertexNormals();
    }

    // Dynamic wave ripples across Ribbon 2
    if (meshRef2.current) {
      const posAttr = ribbon2.geometry.attributes.position;
      const positions = posAttr.array as Float32Array;
      const base = ribbon2.basePositions;
      const segs = ribbon2.segments;
      const wSegs = ribbon2.widthSegments;

      let idx = 0;
      for (let is = 0; is <= segs; is++) {
        const s = is / segs;
        const wave = Math.cos(time * 1.4 + s * 6.5) * (0.11 + sFactor * 0.22);
        const wave2 = Math.sin(time * 1.9 + s * 9.0) * 0.05;
        const dy = wave + wave2;

        for (let iw = 0; iw <= wSegs; iw++) {
          const i3 = idx * 3;
          positions[i3] = base[i3] + Math.cos(time * 1.1 + s * 3.5) * 0.04;
          positions[i3 + 1] = base[i3 + 1] + dy;
          positions[i3 + 2] = base[i3 + 2] + Math.sin(time * 1.4 + s * 4.5) * 0.05;
          idx++;
        }
      }
      posAttr.needsUpdate = true;
      ribbon2.geometry.computeVertexNormals();
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef1}
        geometry={ribbon1.geometry}
        material={lunarSilkMaterial}
      />
      <mesh
        ref={meshRef2}
        geometry={ribbon2.geometry}
        material={lunarSilkMaterial}
      />
    </group>
  );
}
