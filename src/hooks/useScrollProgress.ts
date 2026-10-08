import { useEffect, useRef, useState } from 'react';

export interface ScrollState {
  progress: number;
  scrollY: number;
  maxScroll: number;
  activeChapter: number;
}

export function useScrollProgress() {
  const scrollRef = useRef<ScrollState>({
    progress: 0,
    scrollY: 0,
    maxScroll: 1,
    activeChapter: 0,
  });

  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

      // Calculate chapter based on section positions or scroll progress
      // Chapter 0: Hero (0 - 0.15)
      // Chapter 1: The Sanmon / Gate (0.15 - 0.38)
      // Chapter 2: Still Gardens / Pathways (0.38 - 0.62)
      // Chapter 3: Sacred Craft / Lessons (0.62 - 0.85)
      // Chapter 4: Afterlight / Eternity (0.85 - 1.0)
      let chapter = 0;
      if (progress > 0.82) chapter = 4;
      else if (progress > 0.58) chapter = 3;
      else if (progress > 0.34) chapter = 2;
      else if (progress > 0.14) chapter = 1;

      scrollRef.current.scrollY = scrollY;
      scrollRef.current.maxScroll = maxScroll;
      scrollRef.current.progress = progress;
      scrollRef.current.activeChapter = chapter;

      setActiveChapter((prev) => (prev !== chapter ? chapter : prev));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { scrollRef, activeChapter };
}
