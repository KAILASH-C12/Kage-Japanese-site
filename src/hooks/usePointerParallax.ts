import { useEffect } from 'react';

/**
 * Global Pointer Parallax Hook
 * Implements the single-RAF eased pointer parallax engine from Manus / Sylva.
 * Writes --px and --py (-1 to 1) onto documentElement or target element,
 * enabling GPU-composited perspective 3D transforms (.par) with zero layout thrashing.
 */
export function usePointerParallax(targetRef?: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let targetEl = targetRef?.current || document.documentElement;
    const pointer = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    let lastX = 9999;
    let lastY = 9999;
    let animId = 0;
    let isRunning = true;

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      // Convert to normalized coordinates (-1 to 1)
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const handlePointerLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };

    const loop = () => {
      if (!isRunning) return;

      // Asymmetric spring/lerp easing
      smooth.x += (pointer.x - smooth.x) * 0.055;
      smooth.y += (pointer.y - smooth.y) * 0.055;

      const nx = Math.round(smooth.x * 1000) / 1000;
      const ny = Math.round(smooth.y * 1000) / 1000;

      if (nx !== lastX || ny !== lastY) {
        lastX = nx;
        lastY = ny;
        targetEl = targetRef?.current || document.documentElement;
        targetEl.style.setProperty('--px', String(nx));
        targetEl.style.setProperty('--py', String(ny));
      }

      animId = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    animId = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [targetRef]);
}
