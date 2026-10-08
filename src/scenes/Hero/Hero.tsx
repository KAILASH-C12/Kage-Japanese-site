import { useRef, useEffect, useCallback } from 'react';
import { useCursor } from '../../components/Cursor/CursorContext';
import { LiquidButton } from '../../components/LiquidMetal/LiquidButton';
import { Dock } from '../../components/Dock/Dock';
import { Scene3D } from '../Scene3D';
import { usePointerParallax } from '../../hooks/usePointerParallax';
import { sound } from '../../audio/SoundEngine';
import './Hero.css';

/**
 * SylvaHero / Living Green preset with the 3D Human Brain
 * Implements the complete single-document renderer with native in-document controls,
 * hardware-accelerated pointer parallax, liquid metal shaders, and audio-reactive impulses.
 */
export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const { setCursorVariant } = useCursor();

  // Continuous pointer parallax engine publishing --px and --py onto .hero
  usePointerParallax(heroRef);

  useEffect(() => {
    // Add is-ready class to trigger staggered mask entrance wipes
    const timer = setTimeout(() => {
      document.body.classList.add('is-ready');
    }, 80);

    const doneTimer = setTimeout(() => {
      document.body.classList.add('intro-done');
    }, 2800);

    return () => {
      clearTimeout(timer);
      clearTimeout(doneTimer);
    };
  }, []);

  // Play button click: procedural Web Audio pulse and 3D brain action potential shockwave
  const handlePlayClick = useCallback((e?: React.MouseEvent) => {
    sound.playNeuralPulse();
    window.dispatchEvent(new CustomEvent('nexus-stimulate-brain'));
    if (e) {
      window.dispatchEvent(
        new CustomEvent('nexus-synaptic-burst', {
          detail: { x: e.clientX, y: e.clientY },
        })
      );
    }
  }, []);

  const handleInteractiveEnter = useCallback(() => {
    setCursorVariant('interactive');
    sound.playHover(2200);
  }, [setCursorVariant]);

  const handleInteractiveLeave = useCallback(() => {
    setCursorVariant('default');
  }, [setCursorVariant]);

  return (
    <main ref={heroRef} className="hero" id="hero" aria-label="Living Cortex Hero">
      {/* Three.js Canvas (z 3 — bathed in the floor light pool, above ghost, below stage copy) */}
      <Scene3D />

      {/* Floating Dynamic Dock Navigation (z 5) */}
      <Dock />

      {/* Centered 1600 × 880 Stage Frame */}
      <div className="stage" id="stage">
        {/* Column Guides (z 1) */}
        <div className="guides fade" style={{ ['--d' as string]: '900ms' }} aria-hidden="true">
          <i style={{ left: 'calc(405 * var(--u, 1px))' }} />
          <i style={{ left: 'calc(748 * var(--u, 1px))' }} />
          <i style={{ left: 'calc(1091 * var(--u, 1px))' }} />
        </div>

        {/* Ghost Wordmark (z 1) */}
        <div className="ghost fade" style={{ ['--d' as string]: '1150ms' }} aria-hidden="true">
          SYLVA
        </div>

        {/* Hero Headline (z 4) */}
        <h1
          className="headline par"
          style={{
            ['--pd' as string]: 18,
            ['--pr' as string]: 1.2,
          }}
          onMouseEnter={() => setCursorVariant('text')}
          onMouseLeave={() => setCursorVariant('default')}
        >
          <span>
            <i style={{ ['--d' as string]: '260ms' }}>Step into</i>
          </span>
          <span>
            <i style={{ ['--d' as string]: '360ms' }}>the living world</i>
          </span>
        </h1>

        {/* Subtitle / Lede (z 4) */}
        <p
          className="lede mask par"
          style={{
            ['--d' as string]: '480ms',
            ['--pd' as string]: 14,
            ['--pr' as string]: 1,
          }}
        >
          We restore wild places through patient design, native planting, and a deeper kind of stewardship.
        </p>

        {/* Primary CTA: Liquid Metal Dispersion Button (z 4) */}
        <div className="pill-clip">
          <div
            className="pill mask par"
            style={{
              ['--d' as string]: '600ms',
              ['--pd' as string]: 15,
              ['--pr' as string]: 1.4,
            }}
          >
            <LiquidButton
              variant="explore"
              label="Explore the work"
              onClick={() => {
                sound.playNeuralPulse();
                window.dispatchEvent(new CustomEvent('nexus-stimulate-brain'));
              }}
            />
          </div>
        </div>

        {/* Play Button with Concentric Halo Rings (z 4) — Fires Audio Pulse on Click */}
        <span
          className="play-wrap par"
          style={{ ['--pd' as string]: 20 }}
          onMouseEnter={handleInteractiveEnter}
          onMouseLeave={handleInteractiveLeave}
        >
          <span className="play-clip">
            <span className="play-glass mask-circle" style={{ ['--d' as string]: '900ms' }}>
              <LiquidButton
                variant="play"
                aria-label="Play the film and trigger neural sound"
                onClick={handlePlayClick}
              />
            </span>
          </span>
          <span
            className="play-ring mask-circle"
            style={{ ['--d' as string]: '840ms' }}
            aria-hidden="true"
          />
        </span>

        {/* Stat A (z 4) */}
        <dl
          className="stat stat--a mask par"
          style={{
            ['--d' as string]: '700ms',
            ['--pd' as string]: 12,
          }}
        >
          <span className="mark" aria-hidden="true">
            <svg
              viewBox="0 0 30 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            >
              <circle cx="15" cy="15" r="10.5" strokeDasharray="0.6 3.6" />
              <circle cx="15" cy="15" r="5.6" strokeDasharray="0.6 3.2" />
              <circle cx="15" cy="15" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <div>
            <dt>Canopy restored</dt>
            <dd>282 ha</dd>
          </div>
        </dl>

        {/* Stat B (z 4) */}
        <dl
          className="stat stat--b mask par"
          style={{
            ['--d' as string]: '770ms',
            ['--pd' as string]: 13,
          }}
        >
          <span className="mark" aria-hidden="true">
            <svg
              viewBox="0 0 30 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            >
              <g id="rays">
                <path d="M15 3.5v5" />
                <path d="M15 21.5v5" />
                <path d="M3.5 15h5" />
                <path d="M21.5 15h5" />
                <path d="M6.9 6.9l3.5 3.5" />
                <path d="M19.6 19.6l3.5 3.5" />
                <path d="M23.1 6.9l-3.5 3.5" />
                <path d="M10.4 19.6l-3.5 3.5" />
              </g>
              <circle cx="15" cy="15" r="3.6" />
            </svg>
          </span>
          <div>
            <dt>Native species</dt>
            <dd>43 mapped</dd>
          </div>
        </dl>

        {/* Scroll Cue (z 4) */}
        <a
          className="scroll-cue mask par"
          style={{
            ['--d' as string]: '1040ms',
            ['--pd' as string]: 9,
          }}
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handlePlayClick();
          }}
        >
          Discover
          <span className="track" />
        </a>
      </div>
    </main>
  );
}
