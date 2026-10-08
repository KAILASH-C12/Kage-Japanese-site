import { useRef, useEffect, useCallback } from 'react';
import { sound } from '../../audio/SoundEngine';
import './PortalCard.css';

interface PortalCardProps {
  label: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  variant: 'ethos' | 'note';
  delayMs?: number;
  onKnobClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export function PortalCard({
  label,
  title,
  imageSrc,
  imageAlt,
  variant,
  delayMs = 900,
  onKnobClick,
  style,
  className = '',
}: PortalCardProps) {
  const figureRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRef = useRef<HTMLSpanElement>(null);

  const handleKnob = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      sound.playClick();
      window.dispatchEvent(new CustomEvent('nexus-stimulate-brain'));
      window.dispatchEvent(
        new CustomEvent('nexus-synaptic-burst', {
          detail: { x: e.clientX, y: e.clientY },
        })
      );
      onKnobClick?.();
    },
    [onKnobClick]
  );

  const handleKnobEnter = useCallback(() => {
    sound.playHover(2500);
  }, []);

  useEffect(() => {
    const fig = figureRef.current;
    const img = imgRef.current;
    const canvasEl = canvasRef.current;
    const media = mediaRef.current;
    if (!fig || !img || !canvasEl || !media) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let animId = 0;
    const CUT_STEPS = 12;
    const CUT_MS = 1450;

    function launch() {
      setTimeout(() => {
        if (!canvasEl || !media || !img) return;
        const box = canvasEl.getBoundingClientRect();
        if (!box.width || !box.height) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvasEl.width = Math.max(1, Math.round(box.width * dpr));
        canvasEl.height = Math.max(1, Math.round(box.height * dpr));
        const ctx = canvasEl.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const cols = 52;
        const rows = Math.max(18, Math.round((cols * box.height) / box.width));

        const sample = document.createElement('canvas');
        sample.width = cols;
        sample.height = rows;
        const sg = sample.getContext('2d', { willReadFrequently: true });
        let rgba: Uint8ClampedArray | null = null;
        try {
          if (sg) {
            sg.drawImage(img, 0, 0, cols, rows);
            rgba = sg.getImageData(0, 0, cols, rows).data;
          }
        } catch {
          // Cross-origin fallback uses iridescent neural palette
        }

        const over = -media.offsetLeft;
        const span = media.offsetWidth;
        const reach = box.width;

        canvasEl.style.opacity = '1';
        const startedAt = performance.now();

        function paint(now: number) {
          const t = Math.min(1, (now - startedAt) / CUT_MS);
          const stepped = Math.floor(t * CUT_STEPS) / CUT_STEPS;
          const front = (stepped * span - over) / reach;
          const tailFade = t < 0.88 ? 1 : (1 - t) / 0.12;
          ctx!.clearRect(0, 0, box.width, box.height);

          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              const an = (x + 0.5) / cols;
              const delta = an - front;
              if (delta < -0.16 || delta > 0.16) continue;

              const band = 1 - Math.abs(delta) / 0.16;
              const pulse =
                0.68 + 0.32 * Math.sin(x * 2.71 + y * 1.93 + t * 26);
              const alpha = Math.max(0, band * pulse * tailFade);
              if (alpha < 0.08) continue;

              let r = 140,
                g = 220,
                b = 255; // Default cyan electric neural
              if (rgba) {
                const q = (y * cols + x) * 4;
                r = Math.min(255, rgba[q] * 1.25 + 30);
                g = Math.min(255, rgba[q + 1] * 1.25 + 30);
                b = Math.min(255, rgba[q + 2] * 1.25 + 30);
              }

              let px = ((x + 0.5) * box.width) / cols;
              let py = ((y + 0.5) * box.height) / rows;
              const jitter = (1 - band) * 5;
              px += Math.sin(y * 3.17 + x) * jitter;
              py += Math.cos(x * 2.41 - y) * jitter;
              const radius =
                (0.55 + band * 1.25) * Math.max(0.75, reach / 300);

              ctx!.fillStyle = `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${(alpha * 0.95).toFixed(3)})`;
              ctx!.beginPath();
              ctx!.arc(px, py, radius, 0, Math.PI * 2);
              ctx!.fill();
            }
          }

          if (t < 1) {
            animId = requestAnimationFrame(paint);
          } else {
            ctx!.clearRect(0, 0, box.width, box.height);
            canvasEl!.style.opacity = '0';
          }
        }

        animId = requestAnimationFrame(paint);
      }, delayMs);
    }

    if (img.complete && img.naturalWidth) {
      launch();
    } else {
      img.addEventListener('load', launch, { once: true });
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [delayMs]);

  return (
    <article
      className={`card card--${variant} mask ${className}`}
      style={style}
    >
      {variant === 'ethos' ? (
        <>
          <figure ref={figureRef} className="portal">
            <span ref={mediaRef} className="portal-media">
              <img
                ref={imgRef}
                crossOrigin="anonymous"
                src={imageSrc}
                alt={imageAlt}
                loading="eager"
                decoding="async"
              />
            </span>
            <canvas ref={canvasRef} className="pixel-reveal" aria-hidden="true" />
          </figure>
          <p className="label">{label}</p>
          <h2>{title}</h2>
          <button
            type="button"
            className="knob knob--about mask-circle"
            aria-label={`Inspect ${label}`}
            onClick={handleKnob}
            onMouseEnter={handleKnobEnter}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21v-7" />
              <path d="M12 14c0-3.3 2.4-6 5.5-6 .3 3.6-2.2 6.4-5.5 6Z" />
              <path d="M12 16c-.1-2.9-2.2-5.2-4.9-5.2C6.8 13.7 9 16 12 16Z" />
            </svg>
          </button>
        </>
      ) : (
        <>
          <p className="label">{label}</p>
          <h2>{title}</h2>
          <figure ref={figureRef} className="portal">
            <span ref={mediaRef} className="portal-media">
              <img
                ref={imgRef}
                crossOrigin="anonymous"
                src={imageSrc}
                alt={imageAlt}
                loading="eager"
                decoding="async"
              />
            </span>
            <canvas ref={canvasRef} className="pixel-reveal" aria-hidden="true" />
          </figure>
          <button
            type="button"
            className="knob"
            aria-label={`Open note: ${title}`}
            onClick={handleKnob}
            onMouseEnter={handleKnobEnter}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21v-7" />
              <path d="M12 14c0-3.3 2.4-6 5.5-6 .3 3.6-2.2 6.4-5.5 6Z" />
              <path d="M12 16c-.1-2.9-2.2-5.2-4.9-5.2C6.8 13.7 9 16 12 16Z" />
            </svg>
          </button>
        </>
      )}
    </article>
  );
}
