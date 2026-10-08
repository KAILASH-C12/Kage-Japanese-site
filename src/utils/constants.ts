// ─── NEXUS Constants ───

// ─── Colors ───
export const COLORS = {
  bg: '#050505',
  bgElevated: '#0A0A0A',
  bgSurface: '#111111',
  textPrimary: '#F2F0EA',
  textSecondary: '#8A8A80',
  textMuted: '#4A4A44',
  accent: '#7C5CFC',
  accentGlow: '#9B7DFF',
  accentDim: '#5A3ED4',
  accentBlue: '#4C6EF5',
} as const;

// ─── Motion ───
export const MOTION = {
  cursorLerp: 0.15,
  cursorExpandedSize: 60,
  cursorDefaultSize: 12,
  magneticStrength: 0.3,
  magneticRadius: 150,
  particleRadius: 3,
  cameraDamping: 0.05,
  scrollSmoothing: 0.1,
} as const;

// ─── Particles ───
export const PARTICLES = {
  high: 50000,
  medium: 20000,
  low: 8000,
} as const;

// ─── Scroll ranges (as fraction 0-1) ───
export const SCROLL_RANGES = {
  hero: [0, 0.1],
  approach: [0.1, 0.2],
  enterCore: [0.2, 0.3],
  neuralNetwork: [0.3, 0.4],
  intelligence: [0.4, 0.55],
  agents: [0.55, 0.65],
  awakening: [0.65, 0.75],
  reasoning: [0.75, 0.85],
  human: [0.85, 0.95],
  finale: [0.95, 1],
} as const;

// ─── Navigation ───
export const NAV_ITEMS = [
  { label: 'SYSTEM', number: '01' },
  { label: 'INTELLIGENCE', number: '02' },
  { label: 'AGENTS', number: '03' },
  { label: 'ABOUT', number: '04' },
] as const;

// ─── Scene Labels ───
export const SCENE_LABELS = {
  hero: 'NEXUS / INTELLIGENCE SYSTEMS',
  core: 'SYSTEM 01 / CORE',
  network: 'SYSTEM 02 / NEURAL NETWORK',
  intelligence: 'SYSTEM 03 / INTELLIGENCE',
  agents: 'SYSTEM 04 / AGENTS',
  reasoning: 'SYSTEM 05 / REASONING',
  human: 'SYSTEM 06 / FORMATION',
} as const;
