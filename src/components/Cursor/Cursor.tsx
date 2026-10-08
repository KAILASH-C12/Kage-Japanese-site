import { useEffect, useRef, useState, useCallback } from 'react';
import { hasFinePointer } from '../../utils/performance';
import { CursorContext } from './CursorContext';
import type { CursorVariant } from './CursorContext';
import './Cursor.css';

interface CursorProviderProps {
  children: React.ReactNode;
}

export function CursorProvider({ children }: CursorProviderProps) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const mouse = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  const [variant, setVariant] = useState<CursorVariant>('default');
  const [label, setLabel] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const isFinePointer = useRef(true);

  const setCursorVariant = useCallback((v: CursorVariant) => setVariant(v), []);
  const setCursorLabel = useCallback((l: string) => setLabel(l), []);

  useEffect(() => {
    isFinePointer.current = hasFinePointer();
    if (!isFinePointer.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isFinePointer.current) return;

    let animId: number;
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Delta-time invariant exponential tracking (identical across 60Hz / 120Hz / 144Hz)
      const dotFactor = 1 - Math.exp(-28 * dt);
      const ringFactor = 1 - Math.exp(-14 * dt);

      dotPos.current.x += (mouse.current.x - dotPos.current.x) * dotFactor;
      dotPos.current.y += (mouse.current.y - dotPos.current.y) * dotFactor;

      ringPos.current.x += (mouse.current.x - ringPos.current.x) * ringFactor;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * ringFactor;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x.toFixed(1)}px, ${dotPos.current.y.toFixed(1)}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x.toFixed(1)}px, ${ringPos.current.y.toFixed(1)}px, 0)`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${(ringPos.current.x + 24).toFixed(1)}px, ${(ringPos.current.y - 24).toFixed(1)}px, 0)`;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  if (!isFinePointer.current && typeof window !== 'undefined' && !hasFinePointer()) {
    return (
      <CursorContext.Provider value={{ setCursorVariant, setCursorLabel }}>
        {children}
      </CursorContext.Provider>
    );
  }

  return (
    <CursorContext.Provider value={{ setCursorVariant, setCursorLabel }}>
      {children}

      <div
        ref={dotRef}
        className={`nexus-cursor-dot ${variant} ${isVisible ? 'visible' : ''}`}
        aria-hidden="true"
      />

      <div
        ref={ringRef}
        className={`nexus-cursor-ring ${variant} ${isVisible ? 'visible' : ''}`}
        aria-hidden="true"
      />

      {label && (
        <div
          ref={labelRef}
          className={`nexus-cursor-label ${isVisible ? 'visible' : ''}`}
          aria-hidden="true"
        >
          {label}
        </div>
      )}
    </CursorContext.Provider>
  );
}
