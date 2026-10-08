import { useCallback } from 'react';
import { useCursor } from '../Cursor/CursorContext';
import { AudioControl } from '../AudioControl/AudioControl';
import { sound } from '../../audio/SoundEngine';
import './Navbar.css';

const NAV_ITEMS = [
  { number: '01', label: 'CORTEX', href: '#cortex' },
  { number: '02', label: 'ARCHITECTURE', href: '#architecture' },
  { number: '03', label: 'CAPABILITIES', href: '#capabilities' },
  { number: '04', label: 'NEURAL LAB', href: '#lab' },
];

export function Navbar() {
  const { setCursorVariant } = useCursor();

  const handleEnter = useCallback(() => {
    setCursorVariant('interactive');
    sound.playHover(2200);
  }, [setCursorVariant]);

  const handleLeave = useCallback(() => {
    setCursorVariant('default');
  }, [setCursorVariant]);

  const handleClick = useCallback(() => {
    sound.playClick();
  }, []);

  return (
    <nav className="nexus-nav" role="navigation" aria-label="Main navigation">
      <div className="nexus-nav__inner">
        {/* Logo */}
        <a
          href="#cortex"
          className="nexus-nav__logo"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onClick={handleClick}
          aria-label="NEXUS home"
        >
          <span className="nexus-nav__logo-symbol">◈</span> NEXUS
        </a>

        {/* Links */}
        <div className="nexus-nav__links">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.number}
              href={item.href}
              className="nexus-nav__link"
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
              onClick={handleClick}
            >
              <span className="nexus-nav__link-number">{item.number}</span>
              <span className="nexus-nav__link-sep">/</span>
              <span className="nexus-nav__link-label">{item.label}</span>
            </a>
          ))}
        </div>

        {/* Audio Control */}
        <div className="nexus-nav__actions">
          <AudioControl />
        </div>
      </div>
    </nav>
  );
}
