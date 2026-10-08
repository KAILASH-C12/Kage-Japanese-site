import { useRef, useEffect, useState, useCallback } from 'react';
import { sound } from '../../audio/SoundEngine';
import './Dock.css';

interface DockItemDef {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  isMark?: boolean;
  isEnter?: boolean;
}

const ITEMS: DockItemDef[] = [
  {
    id: 'home',
    label: 'Sylva',
    href: '#hero',
    isMark: true,
  },
  {
    id: 'grove',
    label: 'Grove',
    href: '#hero',
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 14V9" />
        <path d="M8 9c0-2.4 1.7-4.3 4-4.3.2 2.6-1.6 4.6-4 4.3Z" />
        <path d="M8 10.5C7.9 8.4 6.4 6.8 4.4 6.8 4.3 8.9 5.9 10.6 8 10.5Z" />
      </svg>
    ),
  },
  {
    id: 'habitats',
    label: 'Habitats',
    href: '#hero',
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M1.6 12.4c2.4-3.4 4.3-5.1 5.7-5.1 2 0 3 3.6 5 3.6 1.1 0 1.9-.5 2.4-1.4" />
        <path d="M4.3 6.2C5.5 4.4 6.6 3.5 7.6 3.5c1.5 0 2.2 2.4 3.7 2.4" />
      </svg>
    ),
  },
  {
    id: 'journal',
    label: 'Journal',
    href: '#hero',
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4 2.4h5.3L12 5.1v8.5H4z" />
        <path d="M9.2 2.4V5h2.7" />
        <path d="M6 8.4h4M6 10.8h2.8" />
      </svg>
    ),
  },
  {
    id: 'enter',
    label: 'Enter',
    href: '#hero',
    isEnter: true,
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M6.6 2.5h5.1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6.6" />
        <path d="M2.6 8h6.6" />
        <path d="m7 5.6 2.4 2.4L7 10.4" />
      </svg>
    ),
  },
];

export function Dock() {
  const dockRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState('grove');
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const handleSoundToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = sound.toggleMute();
    setIsMuted(next);
  }, []);

  useEffect(() => {
    const root = dockRef.current;
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fineHover = () =>
      !reduced && window.matchMedia('(hover:hover) and (pointer:fine)').matches;

    interface ItemState {
      el: HTMLElement;
      w: number;
      h: number;
      v: number;
      vel: number;
      target: number;
    }

    interface SpecState {
      el: HTMLElement;
      ang: number;
      tAng: number;
      br: number;
      tBr: number;
      focused: boolean;
      reach: number;
    }

    const items: ItemState[] = Array.from(
      root.querySelectorAll<HTMLElement>('[data-dock]')
    ).map((el) => ({
      el,
      w: 0,
      h: 0,
      v: 0,
      vel: 0,
      target: 0,
    }));

    const specs: SpecState[] = Array.from(
      document.querySelectorAll<HTMLElement>('[data-spec]')
    ).map((el) => ({
      el,
      ang: 2.4,
      tAng: 2.4,
      br: 0,
      tBr: 0,
      focused: false,
      reach: el.classList.contains('dock') ? 250 : 185,
    }));

    let aimX = 0;
    let aimY = 0;
    let aimSeen = false;
    let aimMoved = false;
    let dockKey = false;
    let dockDirty = false;
    let specDirty = false;
    let animId = 0;
    let isRunning = true;
    let lastTick = performance.now();
    let dockLive = false;
    let dockU = 1;

    const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

    function measureDock() {
      dockU = window.innerWidth < 900 ? window.innerWidth / 760 : Math.min(window.innerWidth / 1600, 1.2);
      items.forEach((st) => {
        st.el.style.width = '';
        st.el.style.height = '';
        st.el.style.transform = '';
        st.el.dataset.near = 'false';
        st.v = 0;
        st.vel = 0;
        st.target = 0;
      });
      items.forEach((st) => {
        const r = st.el.getBoundingClientRect();
        st.w = r.width;
        st.h = r.height;
      });
      dockLive = false;
      dockDirty = true;
      aimMoved = aimSeen;
    }

    function dockRest() {
      dockLive = false;
      dockDirty = true;
      items.forEach((st) => {
        st.target = 0;
        st.el.dataset.near = 'false';
      });
    }

    function drawDock(dt: number) {
      if (!fineHover()) return;

      if (aimSeen && aimMoved && !dockKey) {
        const rr = root!.getBoundingClientRect();
        if (
          aimX > rr.left - 48 &&
          aimX < rr.right + 48 &&
          aimY > rr.top - 44 &&
          aimY < rr.bottom + 104
        ) {
          items.forEach((st) => {
            const r = st.el.getBoundingClientRect();
            const prox = clamp01(
              1 - Math.abs(aimX - (r.left + r.width * 0.5)) / (128 * dockU)
            );
            st.target = prox * prox * (3 - 2 * prox);
            st.el.dataset.near = st.target > 0.08 ? 'true' : 'false';
          });
          dockLive = true;
          dockDirty = true;
        } else if (dockLive) {
          dockRest();
        }
      }

      if (!dockDirty) return;
      let moving = false;
      items.forEach((st) => {
        st.vel += (st.target - st.v) * 190 * dt;
        st.vel *= Math.exp(-23 * dt);
        st.v += st.vel * dt;
        if (Math.abs(st.target - st.v) < 0.001 && Math.abs(st.vel) < 0.004) {
          st.v = st.target;
          st.vel = 0;
        } else {
          moving = true;
        }

        const v = Math.min(Math.max(st.v, 0), 1.08);
        const mark = st.el.classList.contains('dock-mark');
        const ew = mark ? 14 * dockU : Math.min(18 * dockU, st.w * 0.24);
        const eh = mark ? 14 * dockU : 16 * dockU;
        st.el.style.width = (st.w + ew * v).toFixed(2) + 'px';
        st.el.style.height = (st.h + eh * v).toFixed(2) + 'px';
        st.el.style.transform =
          'translateY(' + (v * 3.5 * dockU).toFixed(2) + 'px)';
      });
      if (!moving) dockDirty = false;
    }

    function drawSpec(dt: number) {
      if (!fineHover()) return;

      if (aimSeen && aimMoved) {
        specs.forEach((st) => {
          const r = st.el.getBoundingClientRect();
          const cx = r.left + r.width * 0.5;
          const cy = r.top + r.height * 0.5;
          const dx = Math.max(r.left - aimX, 0, aimX - r.right);
          const dy = Math.max(r.top - aimY, 0, aimY - r.bottom);
          const d = Math.sqrt(dx * dx + dy * dy);

          st.tAng =
            d === 0
              ? Math.atan2(2 / Math.max(r.height, 1), -2 / Math.max(r.width, 1)) +
                ((aimX - cx) / Math.max(r.width * 0.5, 1)) * 0.3 +
                ((cy - aimY) / Math.max(r.height * 0.5, 1)) * 0.15
              : Math.atan2(cy - aimY, aimX - cx);

          const raw = clamp01(1 - d / (st.reach * dockU));
          st.tBr = Math.max(raw * raw * (3 - 2 * raw), st.focused ? 0.9 : 0);
        });
        specDirty = true;
      }

      if (!specDirty) return;
      let moving = false;
      specs.forEach((st) => {
        const diff =
          (((st.tAng - st.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        st.ang += diff * (1 - Math.exp(-dt * 8));
        st.br += (st.tBr - st.br) * (1 - Math.exp(-dt * 9));
        if (Math.abs(diff) < 0.001 && Math.abs(st.tBr - st.br) < 0.002) {
          st.ang = st.tAng;
          st.br = st.tBr;
        } else {
          moving = true;
        }
        st.el.style.setProperty('--spec-angle', st.ang.toFixed(4) + 'rad');
        st.el.style.setProperty(
          '--spec-bright',
          (clamp01(st.br) * 0.92).toFixed(3)
        );
      });
      if (!moving) specDirty = false;
    }

    function tick() {
      if (!isRunning) return;
      const now = performance.now();
      const dt = lastTick ? Math.min((now - lastTick) / 1000, 0.05) : 0.016;
      lastTick = now;

      drawDock(dt);
      drawSpec(dt);
      aimMoved = false;

      animId = requestAnimationFrame(tick);
    }

    measureDock();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measureDock);
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      aimX = e.clientX;
      aimY = e.clientY;
      aimSeen = true;
      aimMoved = true;
      dockKey = false;
      dockDirty = true;
      specDirty = true;
    };

    const onPointerLeave = () => {
      aimSeen = false;
      dockRest();
      specs.forEach((st) => {
        st.tBr = st.focused ? 0.9 : 0;
      });
      specDirty = true;
    };

    window.addEventListener('resize', measureDock);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);

    animId = requestAnimationFrame(tick);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', measureDock);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  const handleItemClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: DockItemDef
  ) => {
    sound.playClick();
    if (!item.isMark) {
      setActiveId(item.id);
    }
    // Synaptic particle burst at click location
    window.dispatchEvent(
      new CustomEvent('nexus-synaptic-burst', {
        detail: { x: e.clientX, y: e.clientY },
      })
    );

    if (item.isEnter) {
      window.dispatchEvent(new CustomEvent('nexus-stimulate-brain'));
    }
  };

  const handleItemHover = () => {
    sound.playHover(2600);
  };

  return (
    <div className="dock-wrap">
      <nav
        ref={dockRef}
        className="dock par-dock"
        style={{ ['--pd' as string]: 5 }}
        data-spec
        aria-label="Primary Navigation"
      >
        {ITEMS.map((item, idx) => {
          const isActive = activeId === item.id;
          const delay = (120 + idx * 50) + 'ms';

          if (item.isMark) {
            return (
              <a
                key={item.id}
                href={item.href}
                className="dock-item dock-mark"
                data-dock
                data-spec
                style={{ ['--d' as string]: delay }}
                aria-label="Sylva — home"
                onClick={(e) => handleItemClick(e, item)}
                onMouseEnter={handleItemHover}
              >
                <svg viewBox="0 0 22 24" aria-hidden="true">
                  <path d="M11 1.3c-2.1 0-3.95 1.2-4.75 2.95C3.95 4.55 2.3 6.25 2.3 8.35c0 2.3 1.9 4.2 4.3 4.2h8.8c2.4 0 4.3-1.9 4.3-4.2 0-2.1-1.65-3.8-4-4.1C14.95 2.5 13.1 1.3 11 1.3Z" />
                  <path d="M9.6 12.55h2.8v4.2c1.35.3 2.45 1.15 3.15 2.4-1.35.4-2.4.15-3.15-.4v4.15H9.6v-4.15c-.75.55-1.8.8-3.15.4.7-1.25 1.8-2.1 3.15-2.4v-4.2Z" />
                </svg>
              </a>
            );
          }

          return (
            <a
              key={item.id}
              href={item.href}
              className={`dock-item ${isActive ? 'is-active' : ''} ${
                item.isEnter ? 'dock-item--enter' : ''
              }`}
              data-dock
              data-spec
              style={{ ['--d' as string]: delay }}
              onClick={(e) => handleItemClick(e, item)}
              onMouseEnter={handleItemHover}
            >
              {item.icon && <span className="glyph">{item.icon}</span>}
              <span>{item.label}</span>
            </a>
          );
        })}

        {/* Audio control pill */}
        <button
          type="button"
          className="dock-item dock-item--audio"
          data-dock
          data-spec
          style={{ ['--d' as string]: '400ms' }}
          onClick={handleSoundToggle}
          onMouseEnter={handleItemHover}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <span className="glyph" aria-hidden="true">
            {isMuted ? (
              <svg viewBox="0 0 16 16">
                <path d="M3 6v4h2.5L9 13V3L5.5 6H3z" />
                <path d="M12 5l-4 6M8 5l4 6" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16">
                <path d="M3 6v4h2.5L9 13V3L5.5 6H3z" />
                <path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.8a6 6 0 0 1 0 8.4" />
              </svg>
            )}
          </span>
          <span className="dock-audio-label">{isMuted ? 'Muted' : 'Sound'}</span>
        </button>
      </nav>
    </div>
  );
}
