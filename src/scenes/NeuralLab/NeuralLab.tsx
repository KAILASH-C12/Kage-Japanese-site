import { useRef, useEffect, useState, useCallback } from 'react';
import { SectionLabel } from '../../components/SectionLabel/SectionLabel';
import { useCursor } from '../../components/Cursor/CursorContext';
import { sound } from '../../audio/SoundEngine';
import './NeuralLab.css';

type BrainWaveMode = 'ALPHA' | 'BETA' | 'GAMMA';

const LOG_MESSAGES = [
  'Verifying non-linear reasoning branch [depth: 14]',
  'Synaptic action potential routed across corpus callosum',
  'Latent manifold gradient stabilized at 0.00042',
  'Multimodal cross-attention matrix converged',
  'Recursive self-reflection step confirmed valid',
  'Zero-shot spatial coordinate manifold compiled',
  'Byzantine consensus achieved across 10,240 agent nodes',
  'Theorem proof loop verified: Q.E.D. (Confidence 99.99%)',
];

export function NeuralLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [waveMode, setWaveMode] = useState<BrainWaveMode>('GAMMA');
  const [isSurging, setIsSurging] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    'System initialized in continuous cognitive mode',
    'Real-time synaptic monitor active',
    'Awaiting manual or autonomous neural stimulus',
  ]);
  const { setCursorVariant } = useCursor();

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);

  // Oscilloscope Canvas Rendering Loop (Damped, pauses when hidden)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;
    let isVisible = true;

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      t += 0.04;
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      ctx.fillStyle = 'rgba(4, 4, 6, 0.3)';
      ctx.fillRect(0, 0, width, height);

      // Grid background lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Base frequencies based on mode
      const freq = waveMode === 'GAMMA' ? 0.075 : waveMode === 'BETA' ? 0.042 : 0.022;
      const ampBase = waveMode === 'GAMMA' ? 24 : waveMode === 'BETA' ? 32 : 40;
      const surgeMultiplier = isSurging ? 2.0 : 1.0;

      // Draw primary brainwave
      ctx.beginPath();
      ctx.lineWidth = 1.75;
      ctx.strokeStyle = waveMode === 'GAMMA' ? '#00E5FF' : waveMode === 'BETA' ? '#7C5CFC' : '#9B7DFF';
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = isSurging ? 14 : 6;

      for (let x = 0; x < width; x += 2) {
        const noise = Math.sin(x * 0.12 + t * 3.5) * 3;
        const wave1 = Math.sin(x * freq + t * 2.8) * ampBase * surgeMultiplier;
        const wave2 = Math.cos(x * freq * 2.0 - t * 1.8) * (ampBase * 0.3) * surgeMultiplier;
        const y = midY + wave1 + wave2 + noise;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [waveMode, isSurging]);

  // Periodic telemetry log streamer
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.hidden) return;
      const nextMsg = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
      const timestamp = (performance.now() / 1000).toFixed(3);
      setLogs((prev) => [`[${timestamp}s] ${nextMsg}`, ...prev.slice(0, 4)]);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const handleStimulate = useCallback(() => {
    setIsSurging(true);
    sound.playCognitiveSurge();
    window.dispatchEvent(new CustomEvent('nexus-stimulate-brain'));

    const timestamp = (performance.now() / 1000).toFixed(3);
    setLogs((prev) => [`[${timestamp}s] ⚡ MANUAL SYNAPTIC SURGE TRIGGERED`, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setIsSurging(false);
    }, 1100);
  }, []);

  const handleModeChange = useCallback((mode: BrainWaveMode) => {
    setWaveMode(mode);
    sound.playSynapticPulse(mode === 'GAMMA' ? 1.3 : mode === 'BETA' ? 1.05 : 0.85);
  }, []);

  const handleClearLogs = useCallback(() => {
    sound.playClick();
    setLogs(['Buffer flushed. Resuming clean cognitive trace.']);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setCursorVariant('interactive');
  }, [setCursorVariant]);

  const handleMouseLeave = useCallback(() => {
    setCursorVariant('default');
  }, [setCursorVariant]);

  return (
    <section className="neural-lab section-blend" id="lab" aria-label="Neural Diagnostics Lab">
      <SectionLabel label="04 / NEURAL LAB" />
      <SectionLabel label="LIVE COGNITIVE OSCILLOSCOPE" align="right" />

      <div className="neural-lab__inner max-content">
        <header className="neural-lab__header">
          <span className="text-micro neural-lab__kicker">LIVE SYNAPTIC DIAGNOSTICS</span>
          <h2 className="neural-lab__title">
            INTERACTIVE <span className="neural-lab__title-accent">COGNITIVE LAB.</span>
          </h2>
          <p className="neural-lab__desc">
            Direct telemetry link to the neural core. Monitor bio-electrical frequency oscillations, stimulate synaptic
            pathways, and observe real-time trace telemetry.
          </p>
        </header>

        <div
          ref={containerRef}
          className="glass-card neural-lab__console"
          onMouseMove={handleCardMouseMove}
        >
          {/* Top toolbar */}
          <div className="neural-lab__toolbar">
            <div className="neural-lab__toolbar-left">
              <span className="neural-lab__indicator" />
              <span className="text-micro">FREQUENCY BAND:</span>
              <div className="neural-lab__mode-buttons">
                {(['ALPHA', 'BETA', 'GAMMA'] as BrainWaveMode[]).map((mode) => (
                  <button
                    key={mode}
                    className={`neural-lab__mode-btn ${waveMode === mode ? 'neural-lab__mode-btn--active' : ''}`}
                    onClick={() => handleModeChange(mode)}
                    onMouseEnter={() => {
                      handleMouseEnter();
                      sound.playHover(2000);
                    }}
                    onMouseLeave={handleMouseLeave}
                  >
                    {mode} ({mode === 'GAMMA' ? '40Hz' : mode === 'BETA' ? '20Hz' : '10Hz'})
                  </button>
                ))}
              </div>
            </div>

            <div className="neural-lab__toolbar-right">
              <button
                className="neural-lab__action-btn neural-lab__action-btn--surge"
                onClick={handleStimulate}
                onMouseEnter={() => {
                  handleMouseEnter();
                  sound.playHover(2400);
                }}
                onMouseLeave={handleMouseLeave}
              >
                <span>⚡ TRANSMIT SURGE</span>
              </button>
              <button
                className="neural-lab__action-btn"
                onClick={handleClearLogs}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                FLUSH
              </button>
            </div>
          </div>

          {/* Oscilloscope Canvas */}
          <div className="neural-lab__canvas-wrap">
            <canvas
              ref={canvasRef}
              width={1000}
              height={200}
              className="neural-lab__canvas"
              aria-label="Real-time brainwave oscilloscope"
            />
            <div className="neural-lab__canvas-overlay">
              <span className="text-micro">BAND: {waveMode}</span>
              <span className="text-micro">STATUS: {isSurging ? 'SURGE ACTIVE' : 'STEADY STATE'}</span>
            </div>
          </div>

          {/* Telemetry Stream Log */}
          <div className="neural-lab__terminal">
            <div className="neural-lab__terminal-header">
              <span className="text-micro">SYNAPTIC TRACE STREAM</span>
              <span className="text-micro neural-lab__terminal-blink">● LIVE RECORD</span>
            </div>
            <div className="neural-lab__terminal-body">
              {logs.map((log, index) => (
                <div key={index} className="neural-lab__log-line">
                  <span className="neural-lab__log-caret">›</span>
                  <span className="neural-lab__log-text">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
