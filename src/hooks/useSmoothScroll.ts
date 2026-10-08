import { useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export interface ScrollEventData {
  scroll: number;
  limit: number;
  velocity: number;
  direction: number;
  progress: number;
}

let globalLenis: Lenis | null = null;
let instanceCount = 0;
let rafId: number | null = null;
const scrollListeners = new Set<(e: ScrollEventData) => void>();

export function getGlobalLenis(): Lenis | null {
  return globalLenis;
}

export function subscribeToScroll(cb: (e: ScrollEventData) => void): () => void {
  scrollListeners.add(cb);
  return () => scrollListeners.delete(cb);
}

/**
 * useSmoothScroll
 * Initializes and manages a singleton Lenis instance with 60fps RAF driver,
 * momentum damping, and smooth anchor routing.
 */
export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(globalLenis);

  const scrollTo = useCallback((target: number | string | HTMLElement, options?: { offset?: number; duration?: number; immediate?: boolean }) => {
    if (globalLenis) {
      globalLenis.scrollTo(target, options);
    } else if (typeof target === 'string') {
      const el = document.querySelector(target);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    instanceCount++;

    if (!globalLenis) {
      const lenis = new Lenis({
        duration: 1.25,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.5,
      });

      globalLenis = lenis;

      lenis.on('scroll', (e: ScrollEventData) => {
        scrollListeners.forEach((fn) => fn(e));
      });

      const onRaf = (time: number) => {
        globalLenis?.raf(time);
        rafId = requestAnimationFrame(onRaf);
      };
      rafId = requestAnimationFrame(onRaf);
    }

    lenisRef.current = globalLenis;

    return () => {
      instanceCount--;
      if (instanceCount <= 0) {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        globalLenis?.destroy();
        globalLenis = null;
        scrollListeners.clear();
        instanceCount = 0;
      }
      lenisRef.current = null;
    };
  }, []);

  return { lenis: lenisRef, scrollTo };
}
