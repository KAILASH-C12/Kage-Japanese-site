import { useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { CelestialBloom } from '../three/CelestialBloom/CelestialBloom';
import { ParticleField } from '../three/ParticleField/ParticleField';
import { getClampedDPR } from '../utils/performance';
import { sound } from '../audio/SoundEngine';
import './Scene3D.css';

/**
 * Fullscreen 3D Scene (#gl Canvas Architecture)
 * Fixed WebGL canvas hosting the Celestial Kyoto Lotus Blossom,
 * flowing Hagoromo silk veil ribbons, and drifting sakura embers.
 */
export function Scene3D() {
  const handleClick = useCallback((e: React.MouseEvent) => {
    sound.playNeuralPulse();
    window.dispatchEvent(new CustomEvent('nexus-stimulate-blossom'));
    window.dispatchEvent(new CustomEvent('nexus-stimulate-brain'));
    window.dispatchEvent(
      new CustomEvent('nexus-synaptic-burst', {
        detail: { x: e.clientX, y: e.clientY },
      })
    );
  }, []);

  return (
    <div id="gl-container" className="canvas-container" aria-hidden="true" onClick={handleClick}>
      <Canvas
        dpr={getClampedDPR(2)}
        camera={{ position: [0, 0, 4.4], fov: 42, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Soft lunar moonlight ambient fill */}
        <ambientLight intensity={0.55} color="#edf3ef" />

        {/* Crisp directional moonlight emphasizing translucent petal curvature */}
        <directionalLight position={[-3, 7, 5]} intensity={3.2} color="#f5faf7" />

        {/* Warm vermilion & lantern rim backlight highlighting silk borders */}
        <directionalLight position={[4, -5, 3]} intensity={2.2} color="#ff7a66" />

        {/* Golden sanctuary core warmth */}
        <pointLight position={[3, 2, 2]} intensity={1.8} color="#ffe299" />
        <pointLight position={[-3, -2, -2]} intensity={1.2} color="#e0231c" />

        {/* Ambient Kyoto night pollen & mist stardust */}
        <ParticleField />

        {/* Celestial Lotus Blossom, Hagoromo Silk Veil & Sakura Embers */}
        <CelestialBloom />
      </Canvas>
    </div>
  );
}
