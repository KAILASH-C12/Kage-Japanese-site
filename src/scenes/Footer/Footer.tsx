import { useState, useEffect, useCallback } from 'react';
import { LiquidButton } from '../../components/LiquidMetal/LiquidButton';
import { SectionLabel } from '../../components/SectionLabel/SectionLabel';
import { sound } from '../../audio/SoundEngine';
import './Footer.css';

export function Footer() {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCtaClick = useCallback(() => {
    sound.playCognitiveSurge();
    window.dispatchEvent(new CustomEvent('nexus-stimulate-brain'));
  }, []);

  return (
    <footer className="footer" id="about" aria-label="Footer and System Specification">
      <SectionLabel label="05 / NEXUS CORE" />
      <SectionLabel label="SYSTEM TERMINATION" align="right" />

      <div className="footer__inner max-content">
        <div className="footer__cta-block">
          <span className="text-micro footer__kicker">COGNITIVE HORIZON 2026</span>
          <h2 className="footer__title">
            ENTER THE <br />
            <span className="footer__title-accent">SYNTHETIC ERA.</span>
          </h2>
          <p className="footer__desc">
            Connect your autonomous agent workflows to the world’s most advanced biomimetic cognitive cortex.
          </p>

          <div className="footer__btn-wrap">
            <LiquidButton
              variant="explore"
              label="INITIALIZE NEURAL LINK"
              onClick={handleCtaClick}
            />
          </div>
        </div>

        {/* System Telemetry & Nav Footer */}
        <div className="footer__bottom">
          <div className="footer__telemetry">
            <div className="footer__status-indicator">
              <span className="footer__status-dot" />
              <span className="text-micro">ALL SYSTEMS NOMINAL</span>
            </div>
            <span className="footer__sep">|</span>
            <span className="text-micro">NEXUS V4.8</span>
            <span className="footer__sep">|</span>
            <span className="text-micro">{utcTime}</span>
          </div>

          <div className="footer__links">
            <a href="#cortex" className="footer__link" onClick={() => sound.playClick()}>
              TOP
            </a>
            <a href="#architecture" className="footer__link" onClick={() => sound.playClick()}>
              ARCHITECTURE
            </a>
            <a href="#capabilities" className="footer__link" onClick={() => sound.playClick()}>
              BENCHMARKS
            </a>
            <a href="#lab" className="footer__link" onClick={() => sound.playClick()}>
              NEURAL LAB
            </a>
          </div>

          <div className="footer__copy">
            <span className="text-micro">© 2026 NEXUS COGNITIVE SYSTEMS INC. ALL RIGHTS RESERVED.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
