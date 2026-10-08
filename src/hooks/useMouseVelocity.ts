import { useEffect, useRef } from 'react';

/** Track mouse velocity using refs */
export function useMouseVelocity() {
  const velocity = useRef({ x: 0, y: 0, magnitude: 0 });
  const prevPosition = useRef({ x: 0, y: 0 });
  const prevTime = useRef(Date.now());

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = Math.max(now - prevTime.current, 1);

      velocity.current.x = (e.clientX - prevPosition.current.x) / dt * 16;
      velocity.current.y = (e.clientY - prevPosition.current.y) / dt * 16;
      velocity.current.magnitude = Math.sqrt(
        velocity.current.x * velocity.current.x +
        velocity.current.y * velocity.current.y
      );

      prevPosition.current.x = e.clientX;
      prevPosition.current.y = e.clientY;
      prevTime.current = now;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return velocity;
}
