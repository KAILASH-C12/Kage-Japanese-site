// ─── Performance Utilities ───

export type DeviceTier = 'high' | 'medium' | 'low';

/** Detect device performance tier based on available signals */
export function getDeviceTier(): DeviceTier {
  if (typeof window === 'undefined') return 'medium';

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) return 'low';

  const dpr = window.devicePixelRatio || 1;
  const cores = navigator.hardwareConcurrency || 4;

  if (cores >= 8 && dpr >= 1.5) return 'high';
  if (cores <= 2 || dpr < 1) return 'low';

  return 'medium';
}

/** Check if user prefers reduced motion */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Check if device has a fine pointer (mouse) */
export function hasFinePointer(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(pointer: fine)').matches;
}

/** Clamp device pixel ratio */
export function getClampedDPR(max: number = 2): number {
  return Math.min(window.devicePixelRatio || 1, max);
}
