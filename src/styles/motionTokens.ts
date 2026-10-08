/**
 * Central Motion System Tokens
 * Single source of truth for all animation durations, easings, and staggers across the application.
 * Replicates the restrained, cinematic feel of igloo.inc.
 */

export const MOTION = {
  // Durations (in seconds for GSAP / CSS)
  duration: {
    fast: 0.25,
    base: 0.6,
    slow: 1.2,
  },

  // Easing curves: One primary expo.out for reveals, one power2.inOut for transitions
  ease: {
    expoOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    power2InOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
    // Standard cubic-bezier array format for physics/canvas interpolation
    expoOutArray: [0.16, 1, 0.3, 1] as const,
    power2InOutArray: [0.45, 0, 0.55, 1] as const,
  },

  // Stagger between sibling elements
  stagger: {
    base: 0.08,
    fast: 0.04,
  },

  // Reveal motion distance (max 24px per design guidelines)
  revealDistance: 24,

  // Geometry tokens (Single radius for cards, single for buttons - never mixed)
  radius: {
    card: '20px',
    button: '9999px',
    control: '8px',
  },

  // Interactive damping rates (delta-time independent decay lambda)
  damping: {
    camera: 3.5, // 1 - Math.exp(-3.5 * delta)
    cursor: 8.0,
    brainTilt: 4.5,
    blossomTilt: 4.5,
    flowerTilt: 4.5,
    scroll: 3.0,
  },
} as const;

export type MotionTokens = typeof MOTION;
