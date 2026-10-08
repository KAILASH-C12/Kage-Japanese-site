import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useMousePosition } from '../../hooks/useMousePosition';
import { getGlowTexture } from '../utils/texture';
import { sound } from '../../audio/SoundEngine';

// Preload the Draco-compressed anatomical brain model
useGLTF.preload('/models/brain.glb', '/draco/');

const PARTICLE_SAMPLE_COUNT = 28000;
const NEURAL_LINE_COUNT = 1200;
const SIGNAL_PULSE_COUNT = 65;

// Anatomical cerebrum center and scale calibrated to match reference view
const BRAIN_CENTER = new THREE.Vector3(0, 1.635, -0.012);
const BRAIN_SCALE = 16.5;

function createSeededRandom(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface ActionPotential {
  startIndex: number;
  endIndex: number;
  progress: number;
  speed: number;
  color: THREE.Color;
}

export function AnatomicalBrain() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const signalsRef = useRef<THREE.Points>(null);

  const { normalized } = useMousePosition();
  const glowTexture = useMemo(() => getGlowTexture(), []);

  // Cognitive surge state on click/stimulate
  const surgeRef = useRef({
    active: false,
    radius: 0,
    progress: 0,
  });

  // Track window scroll progress directly in the frame loop (no React re-renders)
  const scrollRef = useRef({
    progress: 0,
    targetProgress: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollRef.current.targetProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load genuine anatomical brain model with Draco decoder
  const { scene } = useGLTF('/models/brain.glb', '/draco/');

  // Glistening smoked crystal obsidian glass with pure white clearcoat specular rim glints
  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#101418'),
      emissive: new THREE.Color('#06090D'),
      roughness: 0.06,
      metalness: 0.16,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      ior: 1.54,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, []);

  // Apply glass material to all anatomical cortical meshes
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = glassMaterial;
      }
    });
  }, [scene, glassMaterial]);

  // Extract vertices and generate luminous diamond-white stardust particles & neural connections
  const { positions, basePositions, colors, baseColors, sizes, linePositions, axonPairs } = useMemo(() => {
    const allVertices: THREE.Vector3[] = [];

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const geom = mesh.geometry;
        const posAttr = geom.attributes.position;

        if (posAttr) {
          const v = new THREE.Vector3();
          for (let i = 0; i < posAttr.count; i += 2) {
            v.fromBufferAttribute(posAttr, i);
            if (v.y > 1.54) {
              const centered = new THREE.Vector3(
                (v.x - BRAIN_CENTER.x) * BRAIN_SCALE,
                (v.y - BRAIN_CENTER.y) * BRAIN_SCALE,
                (v.z - BRAIN_CENTER.z) * BRAIN_SCALE
              );
              allVertices.push(centered);
            }
          }
        }
      }
    });

    const totalAvailable = allVertices.length;
    const rng = createSeededRandom(918273);

    const pos = new Float32Array(PARTICLE_SAMPLE_COUNT * 3);
    const basePos = new Float32Array(PARTICLE_SAMPLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_SAMPLE_COUNT * 3);
    const baseCol = new Float32Array(PARTICLE_SAMPLE_COUNT * 3);
    const sz = new Float32Array(PARTICLE_SAMPLE_COUNT);

    // Luminous Crystalline White & Kage Palette:
    // Pure diamond white, bone sage, crystalline ice, starlight cyan, vermilion spark, temple gold
    const colorWhitePure   = new THREE.Color('#FFFFFF'); // 100% Brilliant Pure Diamond White
    const colorWhiteGlint  = new THREE.Color('#F6FAF8'); // Luminous Crisp White
    const colorBoneSage    = new THREE.Color('#DFE7E0'); // Kage pale sage white
    const colorIceDiamond  = new THREE.Color('#D8EFF8'); // Crystalline Ice Starlight
    const colorStarlight   = new THREE.Color('#A8E2FA'); // Pale ethereal cyan
    const colorVermilion   = new THREE.Color('#E0231C'); // Kage vermilion red
    const colorTempleGold  = new THREE.Color('#C9A24A'); // Kyoto gold ember

    for (let i = 0; i < PARTICLE_SAMPLE_COUNT; i++) {
      const i3 = i * 3;
      const srcIdx = Math.floor(rng() * totalAvailable);
      const srcV = allVertices[srcIdx] || new THREE.Vector3(0, 0, 0);

      // Microscopic sulcal jitter
      const jitter = 0.012;
      const x = srcV.x + (rng() - 0.5) * jitter;
      const y = srcV.y + (rng() - 0.5) * jitter;
      const z = srcV.z + (rng() - 0.5) * jitter;

      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;

      basePos[i3] = x;
      basePos[i3 + 1] = y;
      basePos[i3 + 2] = z;

      // Distance from center determines gyral crest vs deep sulcus
      const distFromCore = Math.sqrt(x * x + y * y + z * z);
      const isCrest = distFromCore > 1.35; // outer ridges get pure brilliant white

      let color = colorWhitePure;
      const cPick = rng();

      if (isCrest && rng() < 0.72) {
        // High gyral crest: radiant pure white
        color = rng() < 0.85 ? colorWhitePure : colorWhiteGlint;
      } else {
        // General cortical distribution: heavily weighted to white/bone/ice
        if (cPick < 0.45) {
          color = colorWhitePure;
        } else if (cPick < 0.65) {
          color = colorBoneSage;
        } else if (cPick < 0.80) {
          color = colorIceDiamond;
        } else if (cPick < 0.90) {
          color = colorStarlight;
        } else if (cPick < 0.96) {
          color = colorVermilion; // Kyoto blood moon spark
        } else {
          color = colorTempleGold; // Lantern gold ember
        }
      }

      col[i3] = color.r;
      col[i3 + 1] = color.g;
      col[i3 + 2] = color.b;

      baseCol[i3] = color.r;
      baseCol[i3 + 1] = color.g;
      baseCol[i3 + 2] = color.b;

      // Pinpoint star scale (gyral crests get slightly larger stardust glints)
      sz[i] = (isCrest ? 0.038 : 0.026) + rng() * 0.022;
    }

    // Sparse neural axon lines
    const linePos = new Float32Array(NEURAL_LINE_COUNT * 6);
    const pairs: Array<[number, number]> = [];
    let lineIdx = 0;

    for (let i = 0; i < PARTICLE_SAMPLE_COUNT && lineIdx < NEURAL_LINE_COUNT; i += 5) {
      const ax = basePos[i * 3];
      const ay = basePos[i * 3 + 1];
      const az = basePos[i * 3 + 2];

      for (let j = i + 1; j < Math.min(i + 40, PARTICLE_SAMPLE_COUNT); j++) {
        const bx = basePos[j * 3];
        const by = basePos[j * 3 + 1];
        const bz = basePos[j * 3 + 2];

        const d2 = (bx - ax) ** 2 + (by - ay) ** 2 + (bz - az) ** 2;
        if (d2 > 0.002 && d2 < 0.032 && rng() < 0.70) {
          const l6 = lineIdx * 6;
          linePos[l6] = ax;
          linePos[l6 + 1] = ay;
          linePos[l6 + 2] = az;
          linePos[l6 + 3] = bx;
          linePos[l6 + 4] = by;
          linePos[l6 + 5] = bz;

          pairs.push([i, j]);
          lineIdx++;
          if (lineIdx >= NEURAL_LINE_COUNT) break;
        }
      }
    }

    return {
      positions: pos,
      basePositions: basePos,
      colors: col,
      baseColors: baseCol,
      sizes: sz,
      linePositions: linePos,
      axonPairs: pairs,
    };
  }, [scene]);

  // Traveling Action Potential Pulses along neural axons
  const signals = useMemo<ActionPotential[]>(() => {
    const sigs: ActionPotential[] = [];
    const colorWhite = new THREE.Color('#FFFFFF');
    const colorIce = new THREE.Color('#D8EFF8');
    const colorVermilion = new THREE.Color('#E0231C');
    const colorGold = new THREE.Color('#C9A24A');

    for (let i = 0; i < SIGNAL_PULSE_COUNT; i++) {
      const pair = axonPairs[i % Math.max(1, axonPairs.length)] || [0, 1];
      const pickColor =
        i % 4 === 0
          ? colorWhite
          : i % 4 === 1
          ? colorIce
          : i % 4 === 2
          ? colorVermilion
          : colorGold;

      sigs.push({
        startIndex: pair[0],
        endIndex: pair[1],
        progress: i / SIGNAL_PULSE_COUNT,
        speed: 0.85 + (i % 3) * 0.28,
        color: pickColor,
      });
    }
    return sigs;
  }, [axonPairs]);

  const signalPositions = useMemo(() => new Float32Array(SIGNAL_PULSE_COUNT * 3), []);
  const signalColors = useMemo(() => {
    const arr = new Float32Array(SIGNAL_PULSE_COUNT * 3);
    signals.forEach((s, i) => {
      arr[i * 3] = s.color.r;
      arr[i * 3 + 1] = s.color.g;
      arr[i * 3 + 2] = s.color.b;
    });
    return arr;
  }, [signals]);

  // Cognitive surge listener
  useEffect(() => {
    const handleStimulate = () => {
      surgeRef.current.active = true;
      surgeRef.current.radius = 0;
      surgeRef.current.progress = 0;
      sound.playCognitiveSurge();
    };
    window.addEventListener('nexus-stimulate-brain', handleStimulate);
    return () => window.removeEventListener('nexus-stimulate-brain', handleStimulate);
  }, []);

  // Frame Loop: Multi-chapter scroll kinematics, inertial physics, white flare interactivity
  useFrame((state, delta) => {
    if (!groupRef.current || !pointsRef.current) return;

    const time = state.clock.elapsedTime;
    const mx = normalized.current.x;
    const my = normalized.current.y;

    // Smooth scroll interpolation
    scrollRef.current.progress = THREE.MathUtils.damp(
      scrollRef.current.progress,
      scrollRef.current.targetProgress,
      4.2,
      delta
    );
    const sp = scrollRef.current.progress;

    // ─── 1. MULTI-CHAPTER SCROLL TRAJECTORY ───
    // As the user scrolls through Kage chapters:
    // Chapter 0 (0.00 - 0.18): Hero lateral view on the right
    // Chapter 1 (0.18 - 0.42): The Sanmon — elevated dorsal view on left
    // Chapter 2 (0.42 - 0.65): Still Gardens — expansive posterior network on right
    // Chapter 3 (0.65 - 0.85): Sacred Craft — dense synaptic view on left
    // Chapter 4 (0.85 - 1.00): Afterlight — centered ascending corona
    const isDesktop = state.size.width > 960;

    let targetX = isDesktop ? 0.42 : 0;
    let targetY = isDesktop ? 0.04 : 0;
    let targetZ = 0;
    let targetRotY = -Math.PI / 2;
    let targetRotX = 0.22;
    let baseScale = isDesktop ? 1.08 : 0.88;

    if (sp <= 0.18) {
      // Chapter 0: Hero
      const t = sp / 0.18;
      targetX = isDesktop ? THREE.MathUtils.lerp(0.42, 0.10, t) : 0;
      targetY = isDesktop ? THREE.MathUtils.lerp(0.04, 0.08, t) : 0;
      targetZ = THREE.MathUtils.lerp(0, 0.1, t);
      targetRotY = THREE.MathUtils.lerp(-Math.PI / 2, -Math.PI / 2 + 0.35, t);
      targetRotX = THREE.MathUtils.lerp(0.22, 0.32, t);
      baseScale = (isDesktop ? 1.08 : 0.88);
    } else if (sp <= 0.42) {
      // Chapter 1: The Sanmon (left column)
      const t = (sp - 0.18) / (0.42 - 0.18);
      targetX = isDesktop ? THREE.MathUtils.lerp(0.10, -0.40, t) : 0;
      targetY = isDesktop ? THREE.MathUtils.lerp(0.08, 0.12, t) : 0.05;
      targetZ = THREE.MathUtils.lerp(0.1, 0.25, t);
      targetRotY = THREE.MathUtils.lerp(-Math.PI / 2 + 0.35, -Math.PI * 0.15, t);
      targetRotX = THREE.MathUtils.lerp(0.32, 0.45, t); // tilt forward to reveal dorsal gyri
      baseScale = (isDesktop ? 1.15 : 0.92);
    } else if (sp <= 0.65) {
      // Chapter 2: Still Gardens (right side)
      const t = (sp - 0.42) / (0.65 - 0.42);
      targetX = isDesktop ? THREE.MathUtils.lerp(-0.40, 0.46, t) : 0;
      targetY = isDesktop ? THREE.MathUtils.lerp(0.12, -0.06, t) : -0.04;
      targetZ = THREE.MathUtils.lerp(0.25, -0.15, t);
      targetRotY = THREE.MathUtils.lerp(-Math.PI * 0.15, Math.PI * 0.6, t);
      targetRotX = THREE.MathUtils.lerp(0.45, 0.18, t);
      baseScale = (isDesktop ? 1.05 : 0.86);
    } else if (sp <= 0.85) {
      // Chapter 3: Sacred Craft (left side)
      const t = (sp - 0.65) / (0.85 - 0.65);
      targetX = isDesktop ? THREE.MathUtils.lerp(0.46, -0.38, t) : 0;
      targetY = isDesktop ? THREE.MathUtils.lerp(-0.06, 0.08, t) : 0.04;
      targetZ = THREE.MathUtils.lerp(-0.15, 0.18, t);
      targetRotY = THREE.MathUtils.lerp(Math.PI * 0.6, Math.PI * 1.1, t);
      targetRotX = THREE.MathUtils.lerp(0.18, 0.35, t);
      baseScale = (isDesktop ? 1.18 : 0.94);
    } else {
      // Chapter 4: Afterlight (centered ascending corona)
      const t = (sp - 0.85) / (1.0 - 0.85);
      targetX = isDesktop ? THREE.MathUtils.lerp(-0.38, 0.0, t) : 0;
      targetY = THREE.MathUtils.lerp(0.08, 0.22, t);
      targetZ = THREE.MathUtils.lerp(0.18, 0.40, t);
      targetRotY = THREE.MathUtils.lerp(Math.PI * 1.1, Math.PI * 1.5, t);
      targetRotX = THREE.MathUtils.lerp(0.35, 0.20, t);
      baseScale = (isDesktop ? 1.25 : 1.05);
    }

    // Zero-gravity harmonic levitation
    const floatY = Math.sin(time * 0.75) * 0.035;
    const floatX = Math.cos(time * 0.55) * 0.015;

    // Apply smooth position damping
    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      targetX + floatX,
      3.8,
      delta
    );
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      targetY + floatY,
      3.8,
      delta
    );
    groupRef.current.position.z = THREE.MathUtils.damp(
      groupRef.current.position.z,
      targetZ,
      3.8,
      delta
    );

    // ─── 2. INERTIAL MOUSE PHYSICS & 3D TILT ───
    const mouseRotY = mx * 0.36;
    const mouseRotX = -my * 0.24;
    const mouseRollZ = -mx * 0.08;

    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetRotY + mouseRotY,
      4.2,
      delta
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetRotX + mouseRotX,
      4.2,
      delta
    );
    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      mouseRollZ,
      4.2,
      delta
    );

    // Organic breathing scale
    const breathe = Math.sin(time * 0.85) * 0.012;
    groupRef.current.scale.setScalar(baseScale + breathe);

    // ─── 3. COGNITIVE SURGE SHOCKWAVE EXPANSION ───
    if (surgeRef.current.active) {
      surgeRef.current.progress += delta * 1.5;
      surgeRef.current.radius = surgeRef.current.progress * 3.4;
      if (surgeRef.current.progress >= 1) {
        surgeRef.current.active = false;
      }
    }

    // ─── 4. TRAVELING ACTION POTENTIAL SIGNALS ───
    if (signalsRef.current) {
      const sigPosAttr = signalsRef.current.geometry.attributes.position;
      const sigPosArr = sigPosAttr.array as Float32Array;

      signals.forEach((sig, sIdx) => {
        sig.progress += delta * sig.speed;
        if (sig.progress >= 1) {
          sig.progress = 0;
        }

        const a3 = sig.startIndex * 3;
        const b3 = sig.endIndex * 3;
        const ax = basePositions[a3];
        const ay = basePositions[a3 + 1];
        const az = basePositions[a3 + 2];
        const bx = basePositions[b3];
        const by = basePositions[b3 + 1];
        const bz = basePositions[b3 + 2];

        const t = sig.progress;
        const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        const s3 = sIdx * 3;
        sigPosArr[s3] = ax + (bx - ax) * easedT;
        sigPosArr[s3 + 1] = ay + (by - ay) * easedT;
        sigPosArr[s3 + 2] = az + (bz - az) * easedT;
      });

      sigPosAttr.needsUpdate = true;
    }

    // ─── 5. TACTILE PROXIMITY EXCITATION & BRILLIANT WHITE FLARES ───
    const szAttr = pointsRef.current.geometry.attributes['size'];
    const posAttr = pointsRef.current.geometry.attributes.position;
    const colAttr = pointsRef.current.geometry.attributes.color;

    if (szAttr && posAttr && colAttr) {
      const szArr = szAttr.array as Float32Array;
      const posArr = posAttr.array as Float32Array;
      const colArr = colAttr.array as Float32Array;
      const surgeActive = surgeRef.current.active;
      const surgeR = surgeRef.current.radius;

      // Unproject pointer into brain's approximate local coordinate space
      const mouseLocalX = (mx * 2.0 - groupRef.current.position.x);
      const mouseLocalY = (my * 2.0 - groupRef.current.position.y);

      // Stride through particles for high-performance 60fps responsiveness
      const sampleStride = 4;
      for (let i = 0; i < PARTICLE_SAMPLE_COUNT; i += sampleStride) {
        const i3 = i * 3;
        const bx = basePositions[i3];
        const by = basePositions[i3 + 1];
        const bz = basePositions[i3 + 2];

        let offsetMag = 0;
        let scaleBoost = 1.0;
        let whiteGlowBoost = 0;

        // Shockwave expansion on play / click: pure brilliant white pulse
        if (surgeActive) {
          const distFromCore = Math.sqrt(bx * bx + by * by + bz * bz);
          const surgeDelta = Math.abs(distFromCore - surgeR);
          if (surgeDelta < 0.32) {
            const shockIntensity = 1 - surgeDelta / 0.32;
            scaleBoost += shockIntensity * 3.2;
            offsetMag += shockIntensity * 0.08;
            whiteGlowBoost = Math.max(whiteGlowBoost, shockIntensity * 1.5);
          }
        }

        // Mouse cursor proximity excitation & parting
        const dx = bx - mouseLocalX;
        const dy = by - mouseLocalY;
        const mouseDist = Math.sqrt(dx * dx + dy * dy);
        if (mouseDist < 0.75) {
          const mouseInfl = Math.pow(1 - mouseDist / 0.75, 2);
          scaleBoost += mouseInfl * 2.6;
          offsetMag += mouseInfl * 0.06;
          whiteGlowBoost = Math.max(whiteGlowBoost, mouseInfl * 1.2);
        }

        // Apply physical displacement & size
        if (offsetMag > 0.001) {
          const pushX = dx !== 0 ? (dx / (mouseDist || 1)) * offsetMag : 0;
          const pushY = dy !== 0 ? (dy / (mouseDist || 1)) * offsetMag : 0;
          posArr[i3] = bx + pushX;
          posArr[i3 + 1] = by + pushY;
          szArr[i] = sizes[i] * scaleBoost;
        } else {
          posArr[i3] = bx;
          posArr[i3 + 1] = by;
          szArr[i] = sizes[i];
        }

        // White flare boost: brighten particles towards pure 1.0 white
        if (whiteGlowBoost > 0) {
          colArr[i3] = Math.min(1.0, baseColors[i3] + (1.0 - baseColors[i3]) * whiteGlowBoost);
          colArr[i3 + 1] = Math.min(1.0, baseColors[i3 + 1] + (1.0 - baseColors[i3 + 1]) * whiteGlowBoost);
          colArr[i3 + 2] = Math.min(1.0, baseColors[i3 + 2] + (1.0 - baseColors[i3 + 2]) * whiteGlowBoost);
        } else {
          colArr[i3] = baseColors[i3];
          colArr[i3 + 1] = baseColors[i3 + 1];
          colArr[i3 + 2] = baseColors[i3 + 2];
        }
      }

      szAttr.needsUpdate = true;
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={[0.42, 0.04, 0]}>
      {/* 1. Underlying Anatomical Cortical Gyri Membrane (Smoked Crystal Glass with white clearcoat) */}
      <primitive
        object={scene}
        position={[-BRAIN_CENTER.x * BRAIN_SCALE, -BRAIN_CENTER.y * BRAIN_SCALE, -BRAIN_CENTER.z * BRAIN_SCALE]}
        scale={[BRAIN_SCALE, BRAIN_SCALE, BRAIN_SCALE]}
      />

      {/* 2. Prismatic Diamond-White Stardust Point Cloud (Tracing exact sulci & crests) */}
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
          size={0.045}
          map={glowTexture}
          vertexColors
          transparent
          opacity={0.94}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 3. Subtle Neural Axon Lines (Pale Silver-White & Bone) */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#E2ECE5"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* 4. Action Potential Signal Pulses (Radiant traveling white & vermilion sparks) */}
      <points ref={signalsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[signalPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[signalColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.095}
          map={glowTexture}
          vertexColors
          transparent
          opacity={0.98}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
