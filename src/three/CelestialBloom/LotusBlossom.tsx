import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createLotusPetalGeometry } from './LotusPetalGeometry';

interface LotusBlossomProps {
  bloomRef?: React.RefObject<number>;
  surgeRef?: React.RefObject<number>;
  bloomFactor?: number;
  surgeFactor?: number;
}

/**
 * Sacred Kyoto Lotus Blossom
 * Placed proudly and upright as a blooming sacred flower, with natural
 * overlapping petal whorls, glowing golden heart, and jade green calyx.
 */
export function LotusBlossom({
  bloomRef,
  surgeRef,
  bloomFactor = 0.5,
  surgeFactor = 0,
}: LotusBlossomProps) {
  const rootRef = useRef<THREE.Group>(null);
  const flowerHeadRef = useRef<THREE.Group>(null);
  const innerTierRef = useRef<THREE.Group>(null);
  const midTier1Ref = useRef<THREE.Group>(null);
  const midTier2Ref = useRef<THREE.Group>(null);
  const outerTierRef = useRef<THREE.Group>(null);
  const sepalTierRef = useRef<THREE.Group>(null);
  const heartLightRef = useRef<THREE.PointLight>(null);
  const stamensRef = useRef<THREE.Group>(null);

  // Translucent porcelain-silk physical material for petals
  const petalMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.22,
      metalness: 0.04,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      transmission: 0.32,
      thickness: 0.38,
      ior: 1.48,
      sheen: 1.0,
      sheenColor: new THREE.Color('#ffb6c1'),
      sheenRoughness: 0.25,
      transparent: true,
      opacity: 0.96,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
  }, []);

  // Calyx basal petals material (porcelain silk matching the bloom)
  const sepalMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.24,
      metalness: 0.05,
      clearcoat: 0.88,
      clearcoatRoughness: 0.12,
      transmission: 0.28,
      thickness: 0.32,
      ior: 1.46,
      sheen: 0.95,
      sheenColor: new THREE.Color('#ffc1cc'),
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });
  }, []);

  // Golden stamen & pistil material
  const goldMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f5b041'),
      emissive: new THREE.Color('#e67e22'),
      emissiveIntensity: 0.65,
      metalness: 0.85,
      roughness: 0.2,
    });
  }, []);

  const coreReceptacleMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f9e79f'),
      emissive: new THREE.Color('#d4ac0d'),
      emissiveIntensity: 0.45,
      roughness: 0.32,
      metalness: 0.12,
    });
  }, []);

  // Flower stem material (descending beneath the flower in dark lacquer)
  const stemMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1c2228'),
      roughness: 0.5,
      metalness: 0.15,
    });
  }, []);

  // 1. Inner Bud Tier (8 overlapping petals, cupped gently around stamens)
  const innerPetalGeo = useMemo(() => {
    return createLotusPetalGeometry({
      length: 1.15,
      width: 0.68,
      curl: 0.36,
      cup: 0.38,
      tipCurl: -0.06,
      asymmetry: 0.12,
      palette: 'inner',
      waveAmp: 0.015,
    });
  }, []);

  // 2. Middle Tier 1 (8 petals, broader girth, shingling)
  const midPetalGeo1 = useMemo(() => {
    return createLotusPetalGeometry({
      length: 1.55,
      width: 0.82,
      curl: 0.46,
      cup: 0.32,
      tipCurl: -0.12,
      asymmetry: 0.1,
      palette: 'blossom',
      waveAmp: 0.02,
    });
  }, []);

  // 3. Middle Tier 2 (10 petals, blooming outward)
  const midPetalGeo2 = useMemo(() => {
    return createLotusPetalGeometry({
      length: 1.85,
      width: 0.92,
      curl: 0.54,
      cup: 0.28,
      tipCurl: -0.16,
      asymmetry: 0.09,
      palette: 'blossom',
      waveAmp: 0.022,
    });
  }, []);

  // 4. Outer Tier (14 broad petals, fully open bloom, classical lotus silhouette)
  const outerPetalGeo = useMemo(() => {
    return createLotusPetalGeometry({
      length: 2.15,
      width: 0.98,
      curl: 0.62,
      cup: 0.24,
      tipCurl: -0.22,
      droop: 0.0, // Upright, open lotus posture
      asymmetry: 0.08,
      palette: 'blossom',
      waveAmp: 0.025,
    });
  }, []);

  // 5. Basal Calyx Petals (6 supporting petals cradling flower base from underneath)
  const sepalGeo = useMemo(() => {
    return createLotusPetalGeometry({
      length: 1.4,
      width: 0.65,
      curl: 0.42,
      cup: 0.26,
      tipCurl: -0.12,
      droop: 0.0,
      palette: 'blossom',
      waveAmp: 0.015,
    });
  }, []);

  // Curved Stem Geometry (descends naturally downward beneath the flower base)
  const stemCurve = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.02, -0.45, -0.04),
      new THREE.Vector3(-0.03, -0.95, -0.08),
      new THREE.Vector3(0.01, -1.6, -0.12),
    ]);
    return new THREE.TubeGeometry(curve, 32, 0.048, 12, false);
  }, []);

  // Golden Stamens (36 golden filaments)
  const stamenData = useMemo(() => {
    const count = 36;
    const items = [];
    const radius = 0.32;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = radius + (Math.sin(i * 3) * 0.035);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const height = 0.44 + Math.sin(i * 2.5) * 0.06;
      const tilt = 0.14 + (i % 2) * 0.08;
      items.push({ x, z, angle, height, tilt });
    }
    return items;
  }, []);

  // Seed pores
  const seedPores = useMemo(() => {
    const pores = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.2;
      const dist = (i < 5) ? 0.09 : 0.18;
      pores.push({
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
      });
    }
    return pores;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const breath = Math.sin(time * 0.85) * 0.035;
    const bFactor = bloomRef ? bloomRef.current : bloomFactor;
    const sFactor = surgeRef ? surgeRef.current : surgeFactor;
    const effectiveBloom = bFactor + sFactor * 0.45 + breath;

    // Poised upright flower posture with subtle ambient breeze sway
    if (flowerHeadRef.current) {
      // Natural 3/4 viewing angle (approx 12-14 degrees forward tilt so the blooming face is fully visible)
      const swayX = Math.sin(time * 0.9) * 0.025;
      const swayZ = Math.cos(time * 0.7) * 0.02;
      flowerHeadRef.current.rotation.x = 0.22 + swayX;
      flowerHeadRef.current.rotation.z = swayZ;
    }

    // 1. Inner petals unfolding
    if (innerTierRef.current) {
      const targetAngle = 0.24 + effectiveBloom * 0.26;
      innerTierRef.current.children.forEach((child, idx) => {
        const flutter = Math.sin(time * 1.8 + idx * 0.8) * 0.015;
        child.rotation.x = targetAngle + flutter;
      });
    }

    // 2. Middle tier 1 unfolding
    if (midTier1Ref.current) {
      const targetAngle = 0.48 + effectiveBloom * 0.32;
      midTier1Ref.current.children.forEach((child, idx) => {
        const flutter = Math.sin(time * 1.6 + idx * 0.6) * 0.018;
        child.rotation.x = targetAngle + flutter;
      });
    }

    // 3. Middle tier 2 unfolding
    if (midTier2Ref.current) {
      const targetAngle = 0.72 + effectiveBloom * 0.38;
      midTier2Ref.current.children.forEach((child, idx) => {
        const flutter = Math.sin(time * 1.5 + idx * 0.5) * 0.022;
        child.rotation.x = targetAngle + flutter;
      });
    }

    // 4. Outer tier blooming wide open
    if (outerTierRef.current) {
      const targetAngle = 0.96 + effectiveBloom * 0.44;
      outerTierRef.current.children.forEach((child, idx) => {
        const flutter = Math.sin(time * 1.3 + idx * 0.45) * 0.025;
        child.rotation.x = targetAngle + flutter;
      });
    }

    // 5. Sepal tier cradling the base
    if (sepalTierRef.current) {
      const targetAngle = 1.18 + effectiveBloom * 0.25;
      sepalTierRef.current.children.forEach((child, idx) => {
        const flutter = Math.sin(time * 1.1 + idx * 0.4) * 0.015;
        child.rotation.x = targetAngle + flutter;
      });
    }

    // Golden stamens rotation & heart light
    if (stamensRef.current) {
      stamensRef.current.rotation.y = time * 0.035;
    }

    if (heartLightRef.current) {
      heartLightRef.current.intensity = 2.0 + effectiveBloom * 1.6 + Math.sin(time * 2.2) * 0.4 + sFactor * 4.2;
    }
  });

  return (
    <group ref={rootRef}>
      {/* Elegantly placed upright flower assembly */}
      <group ref={flowerHeadRef} position={[0, -0.05, 0]}>
        {/* Descending stem anchoring the flower */}
        <mesh geometry={stemCurve} material={stemMaterial} position={[0, -0.05, 0]} />

        {/* Central Golden Receptacle Pod (Lotus Heart) */}
        <group position={[0, 0.08, 0]}>
          <mesh material={coreReceptacleMaterial} position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.26, 0.2, 0.16, 24]} />
          </mesh>
          {seedPores.map((pore, i) => (
            <mesh key={i} position={[pore.x, 0.105, pore.z]} material={goldMaterial}>
              <sphereGeometry args={[0.022, 10, 10]} />
            </mesh>
          ))}
        </group>

        {/* Golden Stamens */}
        <group ref={stamensRef} position={[0, 0.08, 0]}>
          {stamenData.map((st, i) => (
            <group
              key={i}
              position={[st.x, 0, st.z]}
              rotation={[st.tilt, -st.angle, 0]}
            >
              <mesh position={[0, st.height * 0.5, 0]} material={goldMaterial}>
                <cylinderGeometry args={[0.007, 0.009, st.height, 6]} />
              </mesh>
              <mesh position={[0, st.height, 0]} material={goldMaterial}>
                <sphereGeometry args={[0.02, 8, 8]} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Inner Warm Heart Point Light */}
        <pointLight
          ref={heartLightRef}
          position={[0, 0.25, 0]}
          intensity={2.2}
          distance={4.8}
          color="#ffe29a"
        />

        {/* ==================== TIER 1: INNER PETALS (8) ==================== */}
        {/* Shingled spiral overlap around golden heart */}
        <group ref={innerTierRef} position={[0, 0.05, 0]}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const azimuth = (i / 8) * Math.PI * 2;
            const rOffset = (i % 2 === 0) ? 0.17 : 0.145;
            const twist = (i % 2 === 0 ? 0.08 : -0.08);
            return (
              <group key={`inner-${i}`} rotation={[0, azimuth, twist]}>
                <group position={[0, 0, rOffset]}>
                  <mesh geometry={innerPetalGeo} material={petalMaterial} castShadow receiveShadow />
                </group>
              </group>
            );
          })}
        </group>

        {/* ==================== TIER 2: MID PETALS 1 (8) ==================== */}
        <group ref={midTier1Ref} position={[0, 0.03, 0]}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const azimuth = (i / 8) * Math.PI * 2 + (Math.PI / 8);
            const rOffset = (i % 2 === 0) ? 0.22 : 0.195;
            const twist = (i % 2 === 0 ? -0.06 : 0.06);
            return (
              <group key={`mid1-${i}`} rotation={[0, azimuth, twist]}>
                <group position={[0, 0, rOffset]}>
                  <mesh geometry={midPetalGeo1} material={petalMaterial} castShadow receiveShadow />
                </group>
              </group>
            );
          })}
        </group>

        {/* ==================== TIER 3: MID PETALS 2 (10) ==================== */}
        <group ref={midTier2Ref} position={[0, 0.015, 0]}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
            const azimuth = (i / 10) * Math.PI * 2 + (Math.PI / 10);
            const rOffset = (i % 2 === 0) ? 0.27 : 0.245;
            const twist = (i % 2 === 0 ? 0.05 : -0.05);
            return (
              <group key={`mid2-${i}`} rotation={[0, azimuth, twist]}>
                <group position={[0, 0, rOffset]}>
                  <mesh geometry={midPetalGeo2} material={petalMaterial} castShadow receiveShadow />
                </group>
              </group>
            );
          })}
        </group>

        {/* ==================== TIER 4: OUTER OPEN PETALS (14) ==================== */}
        {/* Full open lotus bloom with shingled overlapping petals */}
        <group ref={outerTierRef} position={[0, 0, 0]}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => {
            const azimuth = (i / 14) * Math.PI * 2 + (Math.PI / 14);
            const rOffset = (i % 2 === 0) ? 0.32 : 0.29;
            const twist = (i % 2 === 0 ? -0.05 : 0.05);
            return (
              <group key={`outer-${i}`} rotation={[0, azimuth, twist]}>
                <group position={[0, 0, rOffset]}>
                  <mesh geometry={outerPetalGeo} material={petalMaterial} castShadow receiveShadow />
                </group>
              </group>
            );
          })}
        </group>

        {/* ==================== TIER 5: JADE CALYX SEPALS (6) ==================== */}
        {/* Deep green protective sepals cradling the flower from underneath */}
        <group ref={sepalTierRef} position={[0, -0.05, 0]}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const azimuth = (i / 6) * Math.PI * 2 + (Math.PI / 6);
            return (
              <group key={`sepal-${i}`} rotation={[0, azimuth, 0]}>
                <group position={[0, 0, 0.25]}>
                  <mesh geometry={sepalGeo} material={sepalMaterial} castShadow receiveShadow />
                </group>
              </group>
            );
          })}
        </group>
      </group>
    </group>
  );
}
