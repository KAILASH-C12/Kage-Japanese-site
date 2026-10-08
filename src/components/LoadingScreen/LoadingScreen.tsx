import { useState, useEffect, useRef } from 'react';
import './LoadingScreen.css';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    let current = 0;

    intervalRef.current = setInterval(() => {
      // Simulate non-linear loading
      const remaining = 100 - current;
      const increment = Math.max(0.5, remaining * 0.08);
      current = Math.min(100, current + increment);
      setProgress(Math.round(current));

      if (current >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(onComplete, 800);
        }, 400);
      }
    }, 30);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onComplete]);

  return (
    <div className={`loading-screen ${isExiting ? 'exiting' : ''}`} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <div className="loading-screen__content">
        <div className="loading-screen__brand">NEXUS</div>
        <div className="loading-screen__status">INITIALIZING INTELLIGENCE</div>
        <div className="loading-screen__bar-track">
          <div
            className="loading-screen__bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="loading-screen__percent">{progress}%</div>
      </div>
    </div>
  );
}
