import { Scene3D } from './scenes/Scene3D';
import { KageExperience } from './scenes/Kage/KageExperience';
import { useSmoothScroll } from './hooks/useSmoothScroll';

/**
 * KAGE — Where Stillness Reveals the Unseen
 * Features the luminous 3D Kyoto Celestial Blossom & Hagoromo Silk Veil,
 * drifting sakura embers, multi-chapter scroll kinematics, Lenis smooth scroll,
 * and the complete Kyoto mountain temple night walk experience.
 */
export default function App() {
  // Initialize Lenis smooth momentum scrolling
  useSmoothScroll();

  return (
    <main>
      {/* Fixed 3D WebGL Canvas hosting the Celestial Blossom & Silk Veil */}
      <Scene3D />

      {/* Complete Kage Kyoto Temple Multi-Chapter Scroll Journey */}
      <KageExperience />
    </main>
  );
}
