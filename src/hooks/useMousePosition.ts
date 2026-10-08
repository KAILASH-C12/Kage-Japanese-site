import { useEffect, useRef } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

/** Track raw mouse position using refs (no re-renders) */
export function useMousePosition() {
  const position = useRef<MousePosition>({ x: 0, y: 0 });
  const normalized = useRef<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      position.current.x = e.clientX;
      position.current.y = e.clientY;
      normalized.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      normalized.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return { position, normalized };
}
