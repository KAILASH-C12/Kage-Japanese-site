import { useState, useCallback } from 'react';
import { SectionLabel } from '../../components/SectionLabel/SectionLabel';
import { useCursor } from '../../components/Cursor/CursorContext';
import { sound } from '../../audio/SoundEngine';
import './Architecture.css';

interface ArchitectureLayer {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  specs: { label: string; value: string }[];
  description: string;
  metric: number;
}

const LAYERS: ArchitectureLayer[] = [
  {
    id: 'layer-1',
    code: '01 / SENSORY',
    name: 'Perception Cortex',
    subtitle: 'High-Dimensional Latent Ingestion',
    specs: [
      { label: 'Bandwidth', value: '1.2M Tokens/s' },
      { label: 'Modality', value: 'Audio • Vision • Code' },
    ],
    description:
      'Continuous neural embeddings capturing raw multimodal reality without quantization loss.',
    metric: 98.4,
  },
  {
    id: 'layer-2',
    code: '02 / SYNAPSE',
    name: 'Synaptic Graph',
    subtitle: 'Non-Linear Graph Inference',
    specs: [
      { label: 'Inference', value: 'Monte Carlo Tree Search' },
      { label: 'Verification', value: 'Formal Logic Engine' },
    ],
    description:
      'Traverses multi-hypothesis reasoning branches with recursive verification before emitting decisions.',
    metric: 99.2,
  },
  {
    id: 'layer-3',
    code: '03 / MOTOR',
    name: 'Agency Engine',
    subtitle: 'Self-Refining Recursive Loops',
    specs: [
      { label: 'Execution', value: 'Bare-metal Sandbox' },
      { label: 'Coordination', value: 'Asynchronous Swarms' },
    ],
    description:
      'Coordinates autonomous tool execution, code compilation, and multi-agent Byzantine consensus.',
    metric: 96.8,
  },
];

export function Architecture() {
  const [activeLayer, setActiveLayer] = useState<string>('layer-2');
  const { setCursorVariant } = useCursor();

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);

  const handleLayerHover = useCallback(
    (id: string) => {
      setActiveLayer(id);
      sound.playHover(2200);
    },
    []
  );

  const handleLayerClick = useCallback((id: string) => {
    setActiveLayer(id);
    sound.playSynapticPulse(1.1);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setCursorVariant('interactive');
  }, [setCursorVariant]);

  const handleMouseLeave = useCallback(() => {
    setCursorVariant('default');
  }, [setCursorVariant]);

  return (
    <section className="architecture section-blend" id="architecture" aria-label="System Architecture">
      <SectionLabel label="02 / ARCHITECTURE" />
      <SectionLabel label="COGNITIVE MATRIX" align="right" />

      <div className="architecture__inner max-content">
        <header className="architecture__header">
          <span className="text-micro architecture__kicker">BIOMIMETIC SPECIFICATION</span>
          <h2 className="architecture__title">
            ENGINEERED LIKE A <span className="architecture__title-highlight">SYNAPTIC CORTEX.</span>
          </h2>
          <p className="architecture__lede">
            NEXUS replaces traditional flat layers with three interconnected biological tiers
            mirroring the mammalian cerebral cortex.
          </p>
        </header>

        <div className="architecture__grid">
          {LAYERS.map((layer) => {
            const isActive = activeLayer === layer.id;
            return (
              <div
                key={layer.id}
                className={`glass-card architecture__card ${isActive ? 'architecture__card--active' : ''}`}
                onMouseMove={handleCardMouseMove}
                onMouseEnter={() => {
                  handleMouseEnter();
                  handleLayerHover(layer.id);
                }}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleLayerClick(layer.id)}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
              >
                <div className="architecture__card-top">
                  <span className="text-micro architecture__card-code">{layer.code}</span>
                  <div className="architecture__card-status">
                    <span className="architecture__pulse-dot" />
                    <span className="text-micro">{layer.metric}% EFFICIENCY</span>
                  </div>
                </div>

                <div className="architecture__card-body">
                  <h3 className="architecture__card-title">{layer.name}</h3>
                  <p className="architecture__card-subtitle">{layer.subtitle}</p>
                  <p className="architecture__card-desc">{layer.description}</p>
                </div>

                <div className="architecture__card-specs">
                  {layer.specs.map((spec) => (
                    <div key={spec.label} className="architecture__spec-row">
                      <span className="text-micro">{spec.label}</span>
                      <span className="architecture__spec-value">{spec.value}</span>
                    </div>
                  ))}
                </div>

                <div className="architecture__progress-track">
                  <div
                    className="architecture__progress-fill"
                    style={{ width: `${layer.metric}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
