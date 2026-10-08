import { useRef, useCallback, useEffect } from 'react';
import { useCursor } from '../Cursor/CursorContext';
import { sound } from '../../audio/SoundEngine';
import './MagneticButton.css';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  ariaLabel?: string;
}

export function MagneticButton({ children, className = '', onClick, href, ariaLabel }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
  const animRef = useRef<number>(0);
  const isReduced = useRef(false);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const { setCursorVariant } = useCursor();

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReduced.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      isReduced.current = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => {
      mq.removeEventListener('change', handler);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isReduced.current) return;
    const el = buttonRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    target.current.x = (e.clientX - cx) * 0.28;
    target.current.y = (e.clientY - cy) * 0.28;

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.12;
      current.current.y += (target.current.y - current.current.y) * 0.12;

      if (buttonRef.current) {
        buttonRef.current.style.transform = `translate3d(${current.current.x.toFixed(2)}px, ${current.current.y.toFixed(2)}px, 0)`;
      }

      if (
        Math.abs(current.current.x - target.current.x) > 0.05 ||
        Math.abs(current.current.y - target.current.y) > 0.05
      ) {
        animRef.current = requestAnimationFrame(tick);
      }
    };

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(tick);
  }, []);

  const handleMouseLeave = useCallback(() => {
    target.current.x = 0;
    target.current.y = 0;
    setCursorVariant('default');

    if (isReduced.current) {
      if (buttonRef.current) buttonRef.current.style.transform = '';
      return;
    }

    const resetTick = () => {
      current.current.x += (0 - current.current.x) * 0.1;
      current.current.y += (0 - current.current.y) * 0.1;

      if (buttonRef.current) {
        buttonRef.current.style.transform = `translate3d(${current.current.x.toFixed(2)}px, ${current.current.y.toFixed(2)}px, 0)`;
      }

      if (Math.abs(current.current.x) > 0.05 || Math.abs(current.current.y) > 0.05) {
        animRef.current = requestAnimationFrame(resetTick);
      } else if (buttonRef.current) {
        buttonRef.current.style.transform = '';
      }
    };

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(resetTick);
  }, [setCursorVariant]);

  const handleMouseEnter = useCallback(() => {
    setCursorVariant('button');
    sound.playHover(2100);
  }, [setCursorVariant]);

  const Tag = href ? 'a' : 'button';

  return (
    <Tag
      ref={buttonRef}
      className={`magnetic-button ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      href={href}
      aria-label={ariaLabel}
    >
      {children}
    </Tag>
  );
}
