import * as THREE from 'three';

export interface PetalGeometryOptions {
  length?: number;
  width?: number;
  curl?: number;
  cup?: number;
  tipCurl?: number;
  droop?: number;
  waveAmp?: number;
  asymmetry?: number; // Slight diagonal slant for natural shingling overlap
  palette?: 'blossom' | 'sepal' | 'inner';
  uSegments?: number;
  vSegments?: number;
}

/**
 * Creates an organic 3D petal geometry with authentic cupping,
 * shingling edge twist, downward droop reflex, and gradient vertex colors.
 */
export function createLotusPetalGeometry({
  length = 1.4,
  width = 0.75,
  curl = 0.35,
  cup = 0.32,
  tipCurl = -0.15,
  droop = 0.0,
  waveAmp = 0.02,
  asymmetry = 0.08,
  palette = 'blossom',
  uSegments = 24,
  vSegments = 32,
}: PetalGeometryOptions = {}): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();

  const numVertices = (uSegments + 1) * (vSegments + 1);
  const positions = new Float32Array(numVertices * 3);
  const uvs = new Float32Array(numVertices * 2);
  const colors = new Float32Array(numVertices * 3);
  const indices: number[] = [];

  // Color palettes
  const blossomBase = new THREE.Color('#f4f7f5'); // Lunar white
  const blossomMid = new THREE.Color('#f9cdd7');  // Sakura rose
  const blossomTip = new THREE.Color('#e0231c');  // Kyoto vermilion

  const sepalBase = new THREE.Color('#1b4332');   // Deep moss jade
  const sepalMid = new THREE.Color('#40916c');    // Bamboo green
  const sepalTip = new THREE.Color('#95d5b2');    // Soft lunar mint

  const innerBase = new THREE.Color('#fff9eb');   // Warm creamy jade
  const innerMid = new THREE.Color('#ffd1dc');    // Soft blush
  const innerTip = new THREE.Color('#ff4d6d');    // Vivid tip

  let vIdx = 0;

  for (let iv = 0; iv <= vSegments; iv++) {
    const v = iv / vSegments; // 0 at base, 1 at petal tip

    // Broad organic petal contour: generous width across mid-section for realistic overlap
    const wEnvelope = Math.sin(Math.PI * Math.pow(v, 0.68)) * (1.05 - 0.22 * v);
    const curWidth = width * Math.max(0.04, wEnvelope);

    // Longitudinal arch & downward droop reflex
    const y = v * length - droop * Math.pow(v, 1.8) * length * 0.45;
    const arch = Math.sin(v * Math.PI * 0.5) * curl * length;
    const reflex = Math.pow(v, 2.4) * tipCurl * length;
    const droopZ = -droop * Math.pow(v, 1.6) * length * 0.5;
    const zBase = arch + reflex + droopZ;

    for (let iu = 0; iu <= uSegments; iu++) {
      const uNorm = iu / uSegments; // 0 to 1 across width
      const uCentered = (uNorm - 0.5) * 2; // -1 to 1

      // Crosswise hollow cupping (spoon contour)
      const cupOffset = -Math.pow(uCentered, 2) * cup * Math.sin(v * Math.PI) * length;

      // Asymmetry slant for shingled overlap (one edge curls slightly inward, other outward)
      const overlapTwist = uCentered * asymmetry * Math.sin(v * Math.PI * 0.8) * length;

      // Subtle organic edge undulation
      const edgeFactor = Math.pow(Math.abs(uCentered), 1.5);
      const edgeWave = Math.sin(v * Math.PI * 8.0) * waveAmp * edgeFactor;

      const x = uCentered * (curWidth * 0.5) + (uCentered * 0.05 * v);
      const z = zBase + cupOffset + overlapTwist + edgeWave;

      positions[vIdx * 3] = x;
      positions[vIdx * 3 + 1] = y;
      positions[vIdx * 3 + 2] = z;

      uvs[vIdx * 2] = uNorm;
      uvs[vIdx * 2 + 1] = v;

      // Color mapping
      const tempCol = new THREE.Color();
      if (palette === 'sepal') {
        if (v < 0.5) {
          tempCol.lerpColors(sepalBase, sepalMid, v / 0.5);
        } else {
          tempCol.lerpColors(sepalMid, sepalTip, (v - 0.5) / 0.5);
        }
      } else if (palette === 'inner') {
        if (v < 0.4) {
          tempCol.lerpColors(innerBase, innerMid, v / 0.4);
        } else {
          tempCol.lerpColors(innerMid, innerTip, (v - 0.4) / 0.6);
        }
      } else {
        if (v < 0.42) {
          tempCol.lerpColors(blossomBase, blossomMid, v / 0.42);
        } else {
          tempCol.lerpColors(blossomMid, blossomTip, (v - 0.42) / 0.58);
        }
        if (edgeFactor > 0.35) {
          tempCol.lerp(blossomTip, (edgeFactor - 0.35) * 0.6);
        }
      }

      colors[vIdx * 3] = tempCol.r;
      colors[vIdx * 3 + 1] = tempCol.g;
      colors[vIdx * 3 + 2] = tempCol.b;

      vIdx++;
    }
  }

  // Generate triangle strip indices
  for (let iv = 0; iv < vSegments; iv++) {
    for (let iu = 0; iu < uSegments; iu++) {
      const a = iv * (uSegments + 1) + iu;
      const b = (iv + 1) * (uSegments + 1) + iu;
      const c = (iv + 1) * (uSegments + 1) + (iu + 1);
      const d = iv * (uSegments + 1) + (iu + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}
