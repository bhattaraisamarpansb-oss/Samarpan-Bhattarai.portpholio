import {useEffect, useRef, useState} from 'react';
import {trajectory} from '../content';
import {clamp, easeOutCubic, pinProgress, range} from '../lib/math';
import {onFrame} from '../lib/scroll';

/**
 * Earth → Moon, drawn as you scroll. The section pins while the four legs of
 * the flight ink themselves one after another, a capsule riding the leg
 * being drawn; the distance flown ticks up to 384,400 km during the
 * coast. The Earth is cut from the hero's own Earth layer.
 */

const SECTION_VH = 380;
const WINDOW = [0.06, 0.92] as const;
const DISTANCE = 384400;

const EARTH = {cx: 230, cy: 320, r: 92};
const MOON = {cx: 985, cy: 300, r: 46};

const LEGS = [
  // Parking orbit: a lap and a bit around the Earth.
  `M${EARTH.cx} ${EARTH.cy - 128} a128 128 0 1 1 -0.1 0 a128 128 0 0 1 106 57`,
  // Trans-lunar coast.
  `M${EARTH.cx + 106} ${EARTH.cy - 71} C 520 40, 820 70, ${MOON.cx - 20} ${MOON.cy - 84}`,
  // Capture into lunar orbit.
  `M${MOON.cx - 20} ${MOON.cy - 84} a86 86 0 1 1 -0.1 0.2 a86 86 0 0 1 20 1`,
  // Descent to the surface.
  `M${MOON.cx} ${MOON.cy - 86} Q ${MOON.cx + 40} ${MOON.cy - 70} ${MOON.cx + 30} ${MOON.cy - 36}`,
];

// Where the Earth sits inside the 2688×1520 hero layer (measured from its alpha).
const LAYER = {cx: 0.657, cy: 0.498, d: 0.401};

export function Trajectory() {
  const rootRef = useRef<HTMLElement>(null);
  const legRefs = useRef<SVGPathElement[]>([]);
  const capsuleRef = useRef<SVGGElement>(null);
  const kmRef = useRef<HTMLSpanElement>(null);
  const [leg, setLeg] = useState(0);

  useEffect(() => {
    let lastP = -1;
    let current = 0;
    return onFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const {p, rect, vh} = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const u = range(p, ...WINDOW) * LEGS.length;
      const s = clamp(Math.floor(u), 0, LEGS.length - 1);
      if (s !== current) {
        current = s;
        setLeg(s);
      }
      legRefs.current.forEach((path, i) => {
        if (!path) return;
        const k = easeOutCubic(clamp(u - i));
        path.style.strokeDashoffset = String(1 - k);
        if (i === s && capsuleRef.current) {
          const pt = path.getPointAtLength(path.getTotalLength() * k);
          capsuleRef.current.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
        }
      });
      const coast = easeOutCubic(clamp(u - 1));
      if (kmRef.current) {
        kmRef.current.textContent = Math.round(coast * DISTANCE).toLocaleString('en-US');
      }
    });
  }, []);

  const jumpToLeg = (targetLeg: number) => {
    const root = rootRef.current;
    if (!root) return;
    const vh = window.innerHeight;
    const span = Math.max(1, root.getBoundingClientRect().height - vh);
    const targetProgress = WINDOW[0] + (targetLeg / LEGS.length) * (WINDOW[1] - WINDOW[0]) + 0.02;
    const top = root.offsetTop + targetProgress * span;
    window.scrollTo({top, behavior: 'smooth'});
  };

  const current = trajectory.legs[leg];
  const earthW = (EARTH.r * 2) / LAYER.d;
  const earthH = earthW * (1520 / 2688);

  return (
    <section ref={rootRef} id="trajectory" aria-labelledby="trajectory-title" className="relative bg-void space-stars" style={{height: `${SECTION_VH}svh`}}>
      <div className="sticky top-0 flex h-screen-s flex-col overflow-hidden px-4 pt-18 pb-6 sm:px-6 md:px-[6vw] md:pt-22">
        {/* Top Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-[3px] border border-earth/20 bg-earth/[0.06] px-2.5 py-1 font-mono text-[0.6875rem] tracking-[0.18em] text-earth uppercase">
              <span className="size-1.5 rounded-full bg-earth" />
              <span>{trajectory.eyebrow}</span>
            </div>
            <h2 id="trajectory-title" className="mt-3 max-w-[20ch] font-display text-display text-white">
              {trajectory.heading}
            </h2>
          </div>

          {/* Telemetry Distance Counter */}
          <div className="flex items-center gap-3 rounded-[4px] border border-white/10 bg-void-2/80 px-4 py-2.5 backdrop-blur-md">
            <span className="size-2 rounded-full bg-earth animate-pulse" />
            <p className="font-mono text-label text-regolith/70 uppercase" aria-live="off">
              Distance flown <span ref={kmRef} className="text-white font-bold tabular-nums text-[0.9375rem]">0</span> <span className="text-earth">km</span>
            </p>
          </div>
        </div>

        {/* Orbit Flight Map SVG */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center py-2">
          <svg
            viewBox="0 0 1200 600"
            className="h-auto max-h-full w-full select-none"
            role="img"
            aria-label="The flight path from Earth to the Moon, drawn in four legs."
          >
            <defs>
              <clipPath id="earth-clip">
                <circle cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r} />
              </clipPath>
              <radialGradient id="moon-shade" cx="35%" cy="35%" r="75%">
                <stop offset="0" stopColor="#f0f2f6" />
                <stop offset="0.65" stopColor="#8b909b" />
                <stop offset="1" stopColor="#1e222a" />
              </radialGradient>
              <radialGradient id="earth-glow">
                <stop offset="0.75" stopColor="#6fb6ff" stopOpacity="0.45" />
                <stop offset="0.95" stopColor="#3898ec" stopOpacity="0.15" />
                <stop offset="1" stopColor="#6fb6ff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="moon-glow">
                <stop offset="0.8" stopColor="#f2e6c9" stopOpacity="0.2" />
                <stop offset="1" stopColor="#f2e6c9" stopOpacity="0" />
              </radialGradient>
              <filter id="glow-light" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Faint star field */}
            <g fill="#fff">
              {Array.from({length: 85}, (_, i) => (
                <circle
                  key={i}
                  cx={(i * 173) % 1200}
                  cy={(i * 97) % 600}
                  r={i % 7 === 0 ? 1.5 : 0.8}
                  opacity={0.15 + ((i * 37) % 55) / 100}
                />
              ))}
            </g>

            {/* Grid Telemetry Lines */}
            <g stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" strokeDasharray="4 8">
              <line x1="100" y1="300" x2="1100" y2="300" />
              <line x1={EARTH.cx} y1="80" x2={EARTH.cx} y2="520" />
              <line x1={MOON.cx} y1="80" x2={MOON.cx} y2="520" />
            </g>

            {/* Earth */}
            <circle cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r * 1.25} fill="url(#earth-glow)" />
            <image
              href="/layers/m/earth.webp"
              x={EARTH.cx - LAYER.cx * earthW}
              y={EARTH.cy - LAYER.cy * earthH}
              width={earthW}
              height={earthH}
              clipPath="url(#earth-clip)"
              preserveAspectRatio="none"
            />
            <circle cx={EARTH.cx} cy={EARTH.cy} r={EARTH.r} fill="none" stroke="#6fb6ff" strokeOpacity="0.3" strokeWidth="1.5" />

            {/* Moon */}
            <circle cx={MOON.cx} cy={MOON.cy} r={MOON.r * 1.25} fill="url(#moon-glow)" />
            <circle cx={MOON.cx} cy={MOON.cy} r={MOON.r} fill="url(#moon-shade)" />
            <circle cx={MOON.cx} cy={MOON.cy} r={MOON.r} fill="none" stroke="#f2e6c9" strokeOpacity="0.25" strokeWidth="1" />
            <g fill="#454a54" opacity="0.65">
              <circle cx={MOON.cx - 14} cy={MOON.cy - 10} r="7" />
              <circle cx={MOON.cx + 12} cy={MOON.cy + 14} r="5" />
              <circle cx={MOON.cx + 18} cy={MOON.cy - 18} r="3.5" />
              <circle cx={MOON.cx - 6} cy={MOON.cy + 18} r="4" />
            </g>

            {/* Ghost of the full route */}
            {LEGS.map((d, i) => (
              <path key={`g${i}`} d={d} fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="1.5" strokeDasharray="3 6" />
            ))}

            {/* Active inked legs */}
            {LEGS.map((d, i) => (
              <path
                key={i}
                ref={(el) => {
                  if (el) legRefs.current[i] = el;
                }}
                d={d}
                pathLength={1}
                fill="none"
                stroke={i === 1 ? '#6fb6ff' : i === 3 ? '#35C8FF' : '#f2e6c9'}
                strokeWidth={i === 1 ? '2.5' : '2'}
                strokeLinecap="round"
                strokeDasharray="1 1"
                strokeDashoffset="1"
                filter={i === 1 ? 'url(#glow-light)' : undefined}
              />
            ))}

            {/* Capsule with radiant beacon */}
            <g ref={capsuleRef} transform={`translate(${EARTH.cx} ${EARTH.cy - 128})`}>
              <circle r="16" fill="#6fb6ff" opacity="0.15" />
              <circle r="9" fill="#6fb6ff" opacity="0.35" />
              <circle r="4.5" fill="#ffffff" />
            </g>

            {/* Labels */}
            <g fontFamily="IBM Plex Mono, monospace" fontSize="12" letterSpacing="3" fill="#8b909b">
              <text x={EARTH.cx} y={EARTH.cy + EARTH.r + 52} textAnchor="middle" fill="#c9ccd3">
                EARTH
              </text>
              <text x={MOON.cx} y={MOON.cy + MOON.r + 62} textAnchor="middle" fill="#c9ccd3">
                MOON
              </text>
            </g>
          </svg>
        </div>

        {/* Current leg detail card with stage navigation */}
        <div className="grid gap-4 rounded-[6px] border border-white/10 bg-void-2/90 p-4 backdrop-blur-md md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8 md:p-6">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-earth" />
            <p className="font-mono text-label text-earth uppercase font-semibold">
              {current.day} · Leg {leg + 1}/{trajectory.legs.length}
            </p>
          </div>

          <div key={leg} className="animate-[leg-in_0.5s_cubic-bezier(0.2,0.7,0.1,1)]" aria-live="polite">
            <h3 className="font-display text-[1.125rem] tracking-[0.08em] text-white uppercase md:text-[1.375rem]">{current.title}</h3>
            <p className="mt-1 text-body text-regolith/75 leading-relaxed">{current.body}</p>
          </div>

          {/* Interactive stage buttons */}
          <div className="flex items-center gap-2" aria-label="Trajectory flight stages">
            {trajectory.legs.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => jumpToLeg(i)}
                aria-label={`Jump to stage ${i + 1}: ${item.title}`}
                className={`group relative flex h-8 items-center rounded-[3px] px-2.5 font-mono text-[0.625rem] tracking-wider transition-all duration-300 ${
                  i === leg
                    ? 'border border-earth bg-earth/20 text-white font-bold shadow-[0_0_12px_rgba(111,182,255,0.4)]'
                    : i < leg
                    ? 'border border-white/20 bg-white/[0.04] text-white/80 hover:border-earth/40'
                    : 'border border-white/10 bg-transparent text-white/40 hover:text-white/70'
                }`}
              >
                <span>L{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
