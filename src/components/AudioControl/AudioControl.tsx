import { useState, useEffect, useCallback } from 'react';
import { sound } from '../../audio/SoundEngine';
import './AudioControl.css';

export function AudioControl() {
  const [muted, setMuted] = useState(sound.getMuted());

  useEffect(() => {
    const unsubscribe = sound.onMuteChange((isMuted) => {
      setMuted(isMuted);
    });
    return unsubscribe;
  }, []);

  const handleToggle = useCallback(() => {
    const next = sound.toggleMute();
    setMuted(next);
  }, []);

  const handleMouseEnter = useCallback(() => {
    sound.playHover(2100);
  }, []);

  return (
    <button
      className={`audio-control ${muted ? 'audio-control--muted' : 'audio-control--active'}`}
      onClick={handleToggle}
      onMouseEnter={handleMouseEnter}
      aria-label={muted ? 'Unmute audio effects' : 'Mute audio effects'}
      title={muted ? 'Enable sound effects (Web Audio)' : 'Mute sound effects'}
    >
      <div className="audio-control__bars" aria-hidden="true">
        <span className="audio-control__bar audio-control__bar--1" />
        <span className="audio-control__bar audio-control__bar--2" />
        <span className="audio-control__bar audio-control__bar--3" />
        <span className="audio-control__bar audio-control__bar--4" />
      </div>
      <span className="audio-control__label">
        {muted ? 'AUDIO: OFF' : 'AUDIO: ON'}
      </span>
    </button>
  );
}
