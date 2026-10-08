import { Suspense } from 'react';
import { AnatomicalBrain } from './AnatomicalBrain';

/**
 * NeuralCore — Renders the real anatomical 3D brain derived from the visual reference.
 * Preserves the exact lateral silhouette, cortical gyri/sulci, prismatic stardust particles,
 * and biological neural structure.
 */
export function NeuralCore() {
  return (
    <Suspense fallback={null}>
      <AnatomicalBrain />
    </Suspense>
  );
}
