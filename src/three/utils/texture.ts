import * as THREE from 'three';

let cachedGlowTexture: THREE.CanvasTexture | null = null;

/**
 * Creates a luminous circular point sprite texture with smooth radial falloff.
 * Prevents raw square point artifacts in Three.js PointsMaterial.
 */
export function getGlowTexture(): THREE.CanvasTexture {
  if (cachedGlowTexture) return cachedGlowTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    // Core hot spot
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    // Inner halo
    gradient.addColorStop(0.2, 'rgba(210, 225, 255, 0.85)');
    // Soft glow
    gradient.addColorStop(0.5, 'rgba(124, 92, 252, 0.4)');
    // Ethereal rim
    gradient.addColorStop(0.8, 'rgba(0, 240, 255, 0.1)');
    // Fade out to transparent
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  cachedGlowTexture = texture;

  return cachedGlowTexture;
}

let cachedPetalTexture: THREE.CanvasTexture | null = null;

/**
 * Creates a soft translucent organic petal sprite texture (Sakura / Lotus petal)
 * with delicate gradient shading and fine central vein translucency.
 */
export function getPetalTexture(): THREE.CanvasTexture {
  if (cachedPetalTexture) return cachedPetalTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, 128, 128);

    ctx.save();
    ctx.translate(64, 64);

    // Draw stylized curved petal path
    ctx.beginPath();
    ctx.moveTo(0, 52); // Base
    ctx.bezierCurveTo(-28, 40, -48, 10, -42, -22);
    ctx.bezierCurveTo(-38, -48, -12, -56, 0, -46); // Tip indent
    ctx.bezierCurveTo(12, -56, 38, -48, 42, -22);
    ctx.bezierCurveTo(48, 10, 28, 40, 0, 52);
    ctx.closePath();

    // Petal radial/linear gradient
    const grad = ctx.createRadialGradient(0, 20, 5, 0, -10, 65);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.35, 'rgba(255, 225, 235, 0.85)');
    grad.addColorStop(0.75, 'rgba(242, 138, 168, 0.7)');
    grad.addColorStop(0.95, 'rgba(224, 35, 28, 0.85)'); // Kyoto vermilion blush edge
    grad.addColorStop(1.0, 'rgba(224, 35, 28, 0)');

    ctx.fillStyle = grad;
    ctx.fill();

    // Delicate translucent central vein
    ctx.beginPath();
    ctx.moveTo(0, 48);
    ctx.quadraticCurveTo(-1, 0, 0, -40);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  cachedPetalTexture = texture;

  return cachedPetalTexture;
}

