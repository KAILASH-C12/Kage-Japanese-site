import { useState, useEffect, useCallback, useRef } from 'react';
import { sound } from '../../audio/SoundEngine';
import { useSmoothScroll, subscribeToScroll } from '../../hooks/useSmoothScroll';
import './Kage.css';

interface KageExperienceProps {
  onStimulate?: () => void;
}

export function KageExperience({ onStimulate }: KageExperienceProps) {
  const { scrollTo: smoothScrollTo } = useSmoothScroll();
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [preloaderPct, setPreloaderPct] = useState(0);
  const [navStuck, setNavStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  const cursorRef = useRef<HTMLDivElement>(null);

  // Preloader progress animation
  useEffect(() => {
    let currentPct = 0;
    const interval = setInterval(() => {
      currentPct += Math.floor(Math.random() * 14) + 6;
      if (currentPct >= 100) {
        currentPct = 100;
        setPreloaderPct(100);
        clearInterval(interval);
        setTimeout(() => {
          setPreloaderDone(true);
        }, 350);
      } else {
        setPreloaderPct(currentPct);
      }
    }, 45);

    return () => clearInterval(interval);
  }, []);

  // Custom cursor movement & hover expansion
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMouseMove = (e: MouseEvent) => {
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    };

    const onMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-cursor], a, button, .card, .chip, .les')) {
        cursor.classList.add('act');
      } else {
        cursor.classList.remove('act');
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseover', onMouseEnter, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseEnter);
    };
  }, []);

  // Scroll listener: sticky nav and chapter rail detection synced with Lenis
  useEffect(() => {
    const updateScrollState = (scrollY = window.scrollY) => {
      setNavStuck(scrollY > 40);

      // Chapter rail tracking
      const sections = ['hero', 'gate', 'pathways', 'lessons', 'eternity'];
      const vh = window.innerHeight;
      let cur = 0;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= vh * 0.45) {
            cur = i;
            break;
          }
        }
      }
      setActiveChapter(cur);
    };

    // Subscribe to Lenis scroll stream
    const unsubscribeLenis = subscribeToScroll((e) => {
      updateScrollState(e.scroll);
    });

    // Native scroll fallback
    const onNativeScroll = () => updateScrollState(window.scrollY);
    window.addEventListener('scroll', onNativeScroll, { passive: true });
    updateScrollState(window.scrollY);

    return () => {
      unsubscribeLenis();
      window.removeEventListener('scroll', onNativeScroll);
    };
  }, []);

  const triggerPulse = useCallback((e?: React.MouseEvent) => {
    sound.playNeuralPulse();
    window.dispatchEvent(new CustomEvent('nexus-stimulate-blossom'));
    window.dispatchEvent(new CustomEvent('nexus-stimulate-brain'));
    if (e) {
      window.dispatchEvent(
        new CustomEvent('nexus-synaptic-burst', {
          detail: { x: e.clientX, y: e.clientY },
        })
      );
    }
    if (onStimulate) onStimulate();
  }, [onStimulate]);

  const scrollTo = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const target = id === 'top' ? 0 : `#${id}`;
    smoothScrollTo(target, { offset: 0, duration: 1.35 });
    setMenuOpen(false);
    triggerPulse();
  }, [smoothScrollTo, triggerPulse]);

  return (
    <>
      {/* ============================================================ atmospheric overlays */}
      <div id="vignette" aria-hidden="true" />
      <div id="grain" aria-hidden="true" />
      <div ref={cursorRef} className="cur-dot" id="cursor" aria-hidden="true" />

      {/* ============================================================ preloader */}
      <div id="pre" className={preloaderDone ? 'done' : ''} aria-hidden={preloaderDone}>
        <div className="pre-in">
          <div className="pre-mark">
            <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
              <circle cx="22" cy="24" r="9.5" stroke="#e0231c" strokeWidth="1.2" />
              <path d="M6 12h32M9.5 17h25M22 8v28" stroke="#dfe7e0" strokeWidth="1.2" />
            </svg>
          </div>
          <div className="pre-jp jp">影の道</div>
          <div className="pre-bar">
            <i id="pre-fill" style={{ right: `${100 - preloaderPct}%` }} />
          </div>
          <div className="pre-meta">
            <span>Raising the mountain temple</span>
            <b><span id="pre-pct">{preloaderPct}</span>%</b>
          </div>
        </div>
      </div>

      {/* ============================================================ nav */}
      <header className={`nav ${navStuck ? 'stuck' : ''} ${menuOpen ? 'menu-open' : ''}`} id="nav">
        <a className="brand" href="#top" onClick={(e) => scrollTo('top', e)} data-cursor>
          <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
            <circle cx="22" cy="25" r="8.6" fill="#e0231c" fillOpacity=".9" />
            <path d="M5 13h34M9 18.4h26M22 8.5v27" stroke="#dfe7e0" strokeWidth="1.5" />
            <path d="M14 35.5h16" stroke="#dfe7e0" strokeWidth="1.2" strokeOpacity=".6" />
          </svg>
          <span className="brand-tx">
            <b>KAGE</b>
            <i>HIDDEN REALMS OF KYOTO</i>
          </span>
        </a>

        <nav className="nav-links" id="navlinks">
          <a className={`nav-link ${activeChapter === 1 ? 'on' : ''}`} href="#gate" onClick={(e) => scrollTo('gate', e)} data-cursor>
            <span>Temples</span><span className="alt">伽藍</span>
          </a>
          <a className={`nav-link ${activeChapter === 2 ? 'on' : ''}`} href="#pathways" onClick={(e) => scrollTo('pathways', e)} data-cursor>
            <span>Gardens</span><span className="alt">庭園</span>
          </a>
          <a className={`nav-link ${activeChapter === 3 ? 'on' : ''}`} href="#lessons" onClick={(e) => scrollTo('lessons', e)} data-cursor>
            <span>Rituals</span><span className="alt">神事</span>
          </a>
          <a className={`nav-link ${activeChapter === 4 ? 'on' : ''}`} href="#eternity" onClick={(e) => scrollTo('eternity', e)} data-cursor>
            <span>Afterlight</span><span className="alt">残光</span>
          </a>
        </nav>

        <button
          className={`nav-burger ${menuOpen ? 'active' : ''}`}
          aria-label="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
          data-cursor
        >
          <i />
          <i />
        </button>
      </header>

      {/* ============================================================ page container */}
      <div className="page" id="top">
        {/* ============================================================ hero */}
        <section className="hero" id="hero" data-cam="0">
          <div className="hero-top">
            <div className="eyebrow" data-rv="fade">
              <span className="dot" /> Chapter 00 — The Hidden Gate
            </div>
            <h1 className="display h-hero">
              <span className="mask-line"><span>Where stillness</span></span>
              <span className="mask-line"><span>reveals the</span></span>
              <span className="mask-line"><span>unseen.</span></span>
            </h1>
            <p className="hero-sub body" data-rv="up">
              Enter Kyoto through its quiet thresholds, where ritual, craft, and memory shape the path.
            </p>
          </div>

          <div className="hero-spacer" />

          <div className="hero-foot">
            <div className="hero-cue" data-rv="fade">
              <span>Scroll to enter</span>
              <span className="track"><i /></span>
            </div>
            <div className="chapters" id="chips">
              <div className="chip" data-chip="0" onClick={(e) => scrollTo('gate', e)} data-cursor>
                <span className="num">01</span>
                <span className="tx">
                  <b>Thresholds</b>
                  <p>Discover the hidden gates that open on to deeper paths.</p>
                </span>
              </div>
              <div className="chip" data-chip="1" onClick={(e) => scrollTo('pathways', e)} data-cursor>
                <span className="num">02</span>
                <span className="tx">
                  <b>Still Gardens</b>
                  <p>Witness the courts where silence gently unfolds.</p>
                </span>
              </div>
              <div className="chip" data-chip="2" onClick={(e) => scrollTo('lessons', e)} data-cursor>
                <span className="num">03</span>
                <span className="tx">
                  <b>Sacred Craft</b>
                  <p>Embrace the hands and heritage that shape devotion.</p>
                </span>
              </div>
              <div className="chip" data-chip="3" onClick={(e) => scrollTo('eternity', e)} data-cursor>
                <span className="num">04</span>
                <span className="tx">
                  <b>Night Rituals</b>
                  <p>Explore the rites that awaken when the day is done.</p>
                </span>
              </div>
            </div>
          </div>

          <a
            className="peek"
            href="#pathways"
            onClick={(e) => scrollTo('pathways', e)}
            data-cursor
            aria-label="Preview: Sanmon, before the bell"
          >
            <span className="peek-fr" />
            <span className="peek-play">
              <svg viewBox="0 0 22 22" fill="none">
                <path d="M8 5.6 16.4 11 8 16.4z" fill="#dfe7e0" />
              </svg>
            </span>
            <span className="peek-cap">
              <b className="jp">山門</b>
              <i>Sanmon — before the bell</i>
            </span>
          </a>

          <div className="hero-side" data-rv="up">
            <span className="v jp">影の道</span>
          </div>
        </section>

        {/* ============================================================ chapter I: The Sanmon */}
        <section className="sec" id="gate" data-cam="1">
          <div className="fg" data-fg="gate" aria-hidden="true">
            <span className="fg-el fg-wall">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/temple-wall.webp"
                alt=""
                width={1536}
                height={884}
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="fg-el fg-pine">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/pine-tree.webp"
                alt=""
                width={1024}
                height={1438}
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="fg-el fg-grass">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/tall-grass.webp"
                alt=""
                width={1717}
                height={916}
                loading="lazy"
                decoding="async"
              />
            </span>
          </div>

          <div className="sec-head" data-rv="fade">
            <span className="k"><b>01</b> — The Sanmon</span>
            <span className="rule" />
            <span className="k jp">山門</span>
          </div>

          <div className="gate-grid">
            <h2 className="display h-sec" data-rv="up">
              Charred cypress, worn stone, one gate left open.
            </h2>
            <div className="gate-copy">
              <p className="lead" data-rv="up">
                Kage begins where the city stops: a mountain gate of cedar burned black,
                standing in its own weather. The soot is not decoration. It is how a board is taught to survive a
                hundred rainy seasons, and the first thing this place asks you to understand.
              </p>
              <p className="body" data-rv="up">
                Climb the worn steps and the worship hall lifts out of the mist, its paper
                screens lit from inside like a lantern the size of a house. Above the eaves a vermilion moon holds
                its place, patient, half hidden. Nothing here is in a hurry. Neither, for the next ninety minutes,
                are you.
              </p>
              <a
                className="arrowlink"
                href="#pathways"
                onClick={(e) => scrollTo('pathways', e)}
                data-cursor
              >
                <span>Cross the threshold</span>
                <span className="ar">
                  <svg viewBox="0 0 14 14" fill="none">
                    <path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" strokeWidth="1.3" />
                  </svg>
                </span>
              </a>
            </div>
          </div>

          <div className="gate-stats" data-rv="up">
            <div><b>05</b><span>Chapters</span></div>
            <div><b>92</b><span>Minutes</span></div>
            <div><b>1611</b><span>Hall raised</span></div>
            <div><b>∞</b><span>Stillness</span></div>
          </div>
        </section>

        {/* ============================================================ chapter II: Still Gardens */}
        <section className="sec" id="pathways" data-cam="2">
          <div className="fg" data-fg="pathways" aria-hidden="true">
            <span className="fg-el fg-sakura fg-el--sway">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/sakura-branch.webp"
                alt=""
                width={1536}
                height={1024}
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="fg-el fg-leaves fg-el--sway">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/maple-leaves.webp"
                alt=""
                width={1536}
                height={1024}
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="fg-el fg-lantern">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/stone-lantern.webp"
                alt=""
                width={1024}
                height={1499}
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="fg-el fg-bush">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/garden-bush.webp"
                alt=""
                width={1717}
                height={876}
                loading="lazy"
                decoding="async"
              />
            </span>
          </div>

          <div className="sec-head" data-rv="fade">
            <span className="k"><b>02</b> — Still Gardens</span>
            <span className="rule" />
            <span className="k jp">庭園</span>
          </div>

          <div className="cards" id="cards">
            <article className="card" onClick={triggerPulse} data-cursor>
              <div className="card-fr">
                <span className="card-ar">
                  <svg viewBox="0 0 14 14" fill="none">
                    <path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" strokeWidth="1.3" />
                  </svg>
                </span>
                <i
                  className="glow"
                  style={{
                    ['--gx' as string]: '80.2%',
                    ['--gy' as string]: '23.9%',
                    ['--gr' as string]: '22%',
                    ['--gt' as string]: '6.1s',
                    ['--gt2' as string]: '9.7s',
                    ['--gc1' as string]: 'rgba(255,142,108,.50)',
                    ['--gc2' as string]: 'rgba(212,56,38,.24)',
                  }}
                />
                <div className="card-lab"><b>Approach</b><span className="jp">参道</span></div>
              </div>
              <div className="card-meta"><span>The long climb</span><span>01 / 03</span></div>
            </article>

            <article className="card" onClick={triggerPulse} data-cursor>
              <div className="card-fr">
                <span className="card-ar">
                  <svg viewBox="0 0 14 14" fill="none">
                    <path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" strokeWidth="1.3" />
                  </svg>
                </span>
                <i
                  className="glow glow--flame"
                  style={{
                    ['--gx' as string]: '70.5%',
                    ['--gy' as string]: '47.2%',
                    ['--gr' as string]: '14%',
                    ['--gt' as string]: '3.7s',
                    ['--gt2' as string]: '5.3s',
                    ['--gc1' as string]: 'rgba(255,198,124,.62)',
                    ['--gc2' as string]: 'rgba(226,118,40,.30)',
                  }}
                />
                <div className="card-lab"><b>Lanterns</b><span className="jp">灯籠</span></div>
              </div>
              <div className="card-meta"><span>Lantern court</span><span>02 / 03</span></div>
            </article>

            <article className="card" onClick={triggerPulse} data-cursor>
              <div className="card-fr">
                <span className="card-ar">
                  <svg viewBox="0 0 14 14" fill="none">
                    <path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" strokeWidth="1.3" />
                  </svg>
                </span>
                <i
                  className="glow"
                  style={{
                    ['--gx' as string]: '48.0%',
                    ['--gy' as string]: '16.8%',
                    ['--gr' as string]: '20%',
                    ['--gt' as string]: '7.3s',
                    ['--gt2' as string]: '11.2s',
                    ['--gc1' as string]: 'rgba(255,138,104,.52)',
                    ['--gc2' as string]: 'rgba(208,54,36,.24)',
                  }}
                />
                <div className="card-lab"><b>Moonwater</b><span className="jp">月影</span></div>
              </div>
              <div className="card-meta"><span>The wet court</span><span>03 / 03</span></div>
            </article>
          </div>
        </section>

        {/* ============================================================ chapter III: Sacred Craft */}
        <section className="sec" id="lessons" data-cam="3">
          <div className="fg" data-fg="lessons" aria-hidden="true">
            <span className="fg-el fg-wall fg-el--flip">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/temple-wall.webp"
                alt=""
                width={1536}
                height={884}
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="fg-el fg-stones">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/basalt-stones.webp"
                alt=""
                width={1536}
                height={996}
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="fg-el fg-grass">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/tall-grass.webp"
                alt=""
                width={1717}
                height={916}
                loading="lazy"
                decoding="async"
              />
            </span>
          </div>

          <div className="sec-head" data-rv="fade">
            <span className="k"><b>03</b> — Sacred Craft</span>
            <span className="rule" />
            <span className="k jp">手業</span>
          </div>

          <div className="cur-head">
            <h2 className="display h-sec" data-rv="up">
              Five chapters. Ninety minutes. One quiet mind.
            </h2>
            <p className="body-lg" data-rv="up">
              Each chapter is a walk, not a lecture. You arrive at the gate, climb the
              steps, sit with the lantern, and leave with one thing worth keeping.
            </p>
          </div>

          <div className="cur" id="cur">
            <div className="les" data-les="0" onClick={triggerPulse} data-cursor>
              <span className="k">01</span>
              <h3>The Hidden Gate<em className="jp">山門</em></h3>
              <p>Why a gate is a sentence, and what you agree to when you walk under one.</p>
              <span className="t">14 min</span>
              <i className="bar" />
            </div>
            <div className="les" data-les="1" onClick={triggerPulse} data-cursor>
              <span className="k">02</span>
              <h3>Borrowed Scenery<em className="jp">借景</em></h3>
              <p>Shakkei: composing with a mountain you will never own.</p>
              <span className="t">18 min</span>
              <i className="bar" />
            </div>
            <div className="les" data-les="2" onClick={triggerPulse} data-cursor>
              <span className="k">03</span>
              <h3>Charred Cypress<em className="jp">焼杉</em></h3>
              <p>Yakisugi: burning a board black so the weather will let it live.</p>
              <span className="t">21 min</span>
              <i className="bar" />
            </div>
            <div className="les" data-les="3" onClick={triggerPulse} data-cursor>
              <span className="k">04</span>
              <h3>Lantern Light<em className="jp">灯籠</em></h3>
              <p>How a single ember decides the scale of everything around it.</p>
              <span className="t">17 min</span>
              <i className="bar" />
            </div>
            <div className="les" data-les="4" onClick={triggerPulse} data-cursor>
              <span className="k">05</span>
              <h3>The Vermilion Moon<em className="jp">朱月</em></h3>
              <p>Why the moon burns red over the valley, and what the garden does with it.</p>
              <span className="t">22 min</span>
              <i className="bar" />
            </div>
          </div>
        </section>

        {/* ============================================================ chapter IV: Afterlight */}
        <section className="sec fin" id="eternity" data-cam="4">
          <div className="fg" data-fg="eternity" aria-hidden="true">
            <span className="fg-el fg-hill">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/hill.webp"
                alt=""
                width={1774}
                height={887}
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="fg-el fg-ruins">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/shrine-ruins.webp"
                alt=""
                width={1536}
                height={1001}
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="fg-el fg-grass">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/tall-grass.webp"
                alt=""
                width={1717}
                height={916}
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="fg-el fg-sakura">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/sakura-branch.webp"
                alt=""
                width={1536}
                height={1024}
                loading="lazy"
                decoding="async"
              />
            </span>
          </div>

          <div className="eyebrow" data-rv="fade">Chapter 04 — Afterlight</div>
          <h2 className="display" data-rv="up">Afterlight</h2>
          <p className="body-lg" data-rv="up">
            The gate does not close behind you. Take the walk whenever the noise
            gets loud — it is always the same path, and never the same light.
          </p>
          <a
            className="cta"
            href="#top"
            onClick={(e) => scrollTo('top', e)}
            data-cursor
          >
            <i />
            <span>Begin the walk</span>
            <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
              <path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" strokeWidth="1.3" />
            </svg>
          </a>
        </section>

        {/* ============================================================ footer */}
        <footer className="foot" data-cam="5">
          <div className="fg" data-fg="foot" aria-hidden="true">
            <span className="fg-el fg-bush">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/garden-bush.webp"
                alt=""
                width={1717}
                height={876}
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="fg-el fg-grass">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/tall-grass.webp"
                alt=""
                width={1717}
                height={916}
                loading="lazy"
                decoding="async"
              />
            </span>
            <span className="fg-el fg-stones">
              <img
                crossOrigin="anonymous"
                src="https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/35388445965f970fa28af333/basalt-stones.webp"
                alt=""
                width={1536}
                height={996}
                loading="lazy"
                decoding="async"
              />
            </span>
          </div>

          <div className="foot-grid">
            <div className="foot-brand">
              <svg viewBox="0 0 44 44" fill="none" width="34" height="34" aria-hidden="true">
                <circle cx="22" cy="25" r="8.6" fill="#e0231c" fillOpacity=".9" />
                <path d="M5 13h34M9 18.4h26M22 8.5v27" stroke="#dfe7e0" strokeWidth="1.5" />
              </svg>
              <p>
                A five-chapter night walk through a Kyoto mountain temple. Three illustrated garden field notes
                sit inside a live Three.js sanctuary.
              </p>
            </div>
            <div>
              <h4>Chapters</h4>
              <ul>
                <li><a href="#gate" onClick={(e) => scrollTo('gate', e)} data-cursor>The Sanmon</a></li>
                <li><a href="#pathways" onClick={(e) => scrollTo('pathways', e)} data-cursor>Still Gardens</a></li>
                <li><a href="#lessons" onClick={(e) => scrollTo('lessons', e)} data-cursor>Sacred Craft</a></li>
                <li><a href="#eternity" onClick={(e) => scrollTo('eternity', e)} data-cursor>Afterlight</a></li>
              </ul>
            </div>
            <div>
              <h4>Practice</h4>
              <ul>
                <li><a href="#lessons" onClick={(e) => scrollTo('lessons', e)} data-cursor>Borrowed scenery</a></li>
                <li><a href="#lessons" onClick={(e) => scrollTo('lessons', e)} data-cursor>Lantern light</a></li>
                <li><a href="#lessons" onClick={(e) => scrollTo('lessons', e)} data-cursor>Charred cypress</a></li>
                <li><a href="#lessons" onClick={(e) => scrollTo('lessons', e)} data-cursor>Raked gravel</a></li>
              </ul>
            </div>
            <div>
              <h4>Elsewhere</h4>
              <ul>
                <li><a href="#top" onClick={(e) => scrollTo('top', e)} data-cursor>Journal</a></li>
                <li><a href="#top" onClick={(e) => scrollTo('top', e)} data-cursor>Field notes</a></li>
                <li><a href="#top" onClick={(e) => scrollTo('top', e)} data-cursor>Colophon</a></li>
              </ul>
            </div>
          </div>

          <div className="foot-base">
            <span>© 2026 Kage — Kage no Michi</span>
            <span className="jp">静けさは一つの技である</span>
            <span>WebGL · Onest · Kyoto</span>
          </div>
        </footer>
      </div>

      {/* ============================================================ progress rail */}
      <div className="rail" id="rail">
        <button
          className={activeChapter === 0 ? 'on' : ''}
          onClick={(e) => scrollTo('hero', e)}
          aria-label="Chapter 00: The Hidden Gate"
          data-cursor
        >
          <i />
        </button>
        <button
          className={activeChapter === 1 ? 'on' : ''}
          onClick={(e) => scrollTo('gate', e)}
          aria-label="Chapter 01: The Sanmon"
          data-cursor
        >
          <i />
        </button>
        <button
          className={activeChapter === 2 ? 'on' : ''}
          onClick={(e) => scrollTo('pathways', e)}
          aria-label="Chapter 02: Still Gardens"
          data-cursor
        >
          <i />
        </button>
        <button
          className={activeChapter === 3 ? 'on' : ''}
          onClick={(e) => scrollTo('lessons', e)}
          aria-label="Chapter 03: Sacred Craft"
          data-cursor
        >
          <i />
        </button>
        <button
          className={activeChapter === 4 ? 'on' : ''}
          onClick={(e) => scrollTo('eternity', e)}
          aria-label="Chapter 04: Afterlight"
          data-cursor
        >
          <i />
        </button>
      </div>
    </>
  );
}
