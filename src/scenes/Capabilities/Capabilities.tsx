import { useState, useCallback } from 'react';
import { SectionLabel } from '../../components/SectionLabel/SectionLabel';
import { useCursor } from '../../components/Cursor/CursorContext';
import { sound } from '../../audio/SoundEngine';
import './Capabilities.css';

interface CapabilityItem {
  id: string;
  num: string;
  title: string;
  badge: string;
  highlight: string;
  benchmark: string;
  details: string[];
}

const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'reasoning',
    num: '01',
    title: 'Formal Deliberation',
    badge: 'LOGICAL SYNAPSE',
    highlight: '99.6% GSM8K • 92.4% Putnam',
    benchmark: 'Zero-shot formal theorem verification via internal proof-assistant loops.',
    details: [
      'Self-generated verification trees with dynamic backtracking',
      'Asynchronous parallel inference branches with truth consensus',
    ],
  },
  {
    id: 'vision',
    num: '02',
    title: 'Spatial Neuro-Field',
    badge: 'OCCIPITAL CORE',
    highlight: '60 FPS Volumetric',
    benchmark: 'Direct transformation of photonic arrays into continuous 3D coordinate meshes.',
    details: [
      'Zero-quantization 3D geometry and occluded volume estimation',
      'Sub-pixel physics simulation and collision prediction',
    ],
  },
  {
    id: 'code',
    num: '03',
    title: 'Recursive Synthesis',
    badge: 'NEURAL COMPILER',
    highlight: '97.2% HumanEval+ Verified',
    benchmark: 'Self-correcting code generation integrated with live sandboxed compiler telemetry.',
    details: [
      'Autonomous unit-test generation and edge-case fuzzing',
      'Memory-safety proof verification prior to execution',
    ],
  },
  {
    id: 'swarms',
    num: '04',
    title: 'Agentic Consensus',
    badge: 'COLLECTIVE MESH',
    highlight: '10,000+ Nodes Synchronized',
    benchmark: 'Decentralized swarm orchestration with cryptographic Byzantine fault tolerance.',
    details: [
      'Asynchronous communication via low-latency vector bus',
      'Sub-10ms swarm convergence on ambiguous problem spaces',
    ],
  },
];

export function Capabilities() {
  const [selectedId, setSelectedId] = useState('reasoning');
  const [synapticDensity, setSynapticDensity] = useState(84);
  const [depth, setDepth] = useState(8);
  const { setCursorVariant } = useCursor();

  const activeCap = CAPABILITIES.find((c) => c.id === selectedId) || CAPABILITIES[0];

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    sound.playHover(2000);
  }, []);

  const handleDensityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSynapticDensity(val);
    sound.playHover(1300 + val * 12);
  }, []);

  const handleDepthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setDepth(val);
    sound.playHover(1600 + val * 60);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setCursorVariant('interactive');
  }, [setCursorVariant]);

  const handleMouseLeave = useCallback(() => {
    setCursorVariant('default');
  }, [setCursorVariant]);

  const accuracy = (96.5 + synapticDensity * 0.035).toFixed(1);
  const latency = (0.24 - synapticDensity * 0.0012 + depth * 0.015).toFixed(2);
  const operationsPerSec = (synapticDensity * 1.8 * depth).toFixed(0);

  return (
    <section className="capabilities section-blend" id="capabilities" aria-label="Cognitive Capabilities">
      <SectionLabel label="03 / CAPABILITIES" />
      <SectionLabel label="PERFORMANCE BENCHMARKS" align="right" />

      <div className="capabilities__inner max-content">
        <header className="capabilities__header">
          <span className="text-micro capabilities__kicker">MULTIDIMENSIONAL BENCHMARKS</span>
          <h2 className="capabilities__title">
            EXTREME BENCHMARKS. <br />
            <span className="capabilities__title-dim">UNCOMPROMISING SPEED.</span>
          </h2>
        </header>

        <div className="capabilities__layout">
          {/* Left: Capability list */}
          <div className="capabilities__nav">
            {CAPABILITIES.map((cap) => {
              const isSelected = cap.id === selectedId;
              return (
                <button
                  key={cap.id}
                  className={`glass-card capabilities__tab ${isSelected ? 'capabilities__tab--active' : ''}`}
                  onClick={() => handleSelect(cap.id)}
                  onMouseMove={handleCardMouseMove}
                  onMouseEnter={() => {
                    handleMouseEnter();
                    sound.playHover(1900);
                  }}
                  onMouseLeave={handleMouseLeave}
                  role="tab"
                  aria-selected={isSelected}
                >
                  <div className="capabilities__tab-header">
                    <span className="text-micro">{cap.num}</span>
                    <span className="text-micro capabilities__tab-badge">{cap.badge}</span>
                  </div>
                  <h3 className="capabilities__tab-title">{cap.title}</h3>
                  <span className="capabilities__tab-score">{cap.highlight}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Active Capability Details & Interactive Simulator */}
          <div className="capabilities__details">
            <div className="glass-card capabilities__active-panel" onMouseMove={handleCardMouseMove}>
              <div className="capabilities__panel-top">
                <span className="text-micro capabilities__active-badge">{activeCap.badge}</span>
                <span className="text-micro capabilities__active-benchmark">{activeCap.highlight}</span>
              </div>

              <h3 className="capabilities__active-title">{activeCap.title}</h3>
              <p className="capabilities__active-benchmark-desc">{activeCap.benchmark}</p>

              <ul className="capabilities__feature-list">
                {activeCap.details.map((detail, idx) => (
                  <li key={idx} className="capabilities__feature-item">
                    <span className="capabilities__feature-bullet">▸</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interactive Neural Parameter Simulator */}
            <div className="glass-card capabilities__simulator" onMouseMove={handleCardMouseMove}>
              <div className="capabilities__sim-header">
                <span className="text-micro">INTERACTIVE PARAMETER CALIBRATION</span>
                <span className="text-micro capabilities__sim-live">LIVE SIMULATION</span>
              </div>

              <div className="capabilities__sliders">
                <div className="capabilities__slider-group">
                  <div className="capabilities__slider-label">
                    <span className="text-micro">Synaptic Density</span>
                    <strong className="text-micro">{synapticDensity} Billion</strong>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="120"
                    value={synapticDensity}
                    onChange={handleDensityChange}
                    className="capabilities__range"
                    aria-label="Synaptic Density"
                  />
                </div>

                <div className="capabilities__slider-group">
                  <div className="capabilities__slider-label">
                    <span className="text-micro">Reasoning Depth</span>
                    <strong className="text-micro">{depth} Passes</strong>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="16"
                    value={depth}
                    onChange={handleDepthChange}
                    className="capabilities__range"
                    aria-label="Reasoning Depth"
                  />
                </div>
              </div>

              <div className="capabilities__sim-metrics">
                <div className="capabilities__sim-metric">
                  <span className="text-micro">ESTIMATED ACCURACY</span>
                  <span className="capabilities__metric-val">{accuracy}%</span>
                </div>
                <div className="capabilities__sim-metric">
                  <span className="text-micro">INFERENCE LATENCY</span>
                  <span className="capabilities__metric-val">{latency} ms</span>
                </div>
                <div className="capabilities__sim-metric">
                  <span className="text-micro">THROUGHPUT</span>
                  <span className="capabilities__metric-val">{operationsPerSec} TFLOPS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
