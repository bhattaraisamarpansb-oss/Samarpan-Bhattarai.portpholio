import {useEffect, useRef, useState} from 'react';
import {intro, log} from '../content';
import {clamp, pinProgress, range} from '../lib/math';
import {onFrame} from '../lib/scroll';

/**
 * The mission, as a reel of stills. The section pins and the reel slides
 * sideways with the scroll; the frame nearest the middle is in focus, the
 * rest dim back, and each picture drifts against its frame.
 */

const SECTION_VH = 340;

export function MissionLog() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const cardRefs = useRef<HTMLLIElement[]>([]);
  const imgRefs = useRef<HTMLImageElement[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let lastP = -1;
    return onFrame(() => {
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;
      const {p, rect, vh} = pinProgress(root);
      if (rect.bottom < 0 || rect.top > vh) return;
      if (Math.abs(p - lastP) < 0.00005) return;
      lastP = p;

      const vw = window.innerWidth;
      const k = range(p, 0.04, 0.96);
      // offsetLeft is the untransformed layout position, so this is stable
      // while the track itself is being translated.
      const travel = Math.max(0, track.offsetLeft + track.scrollWidth - vw * 0.94);
      track.style.transform = `translate3d(${-k * travel}px, 0, 0)`;

      let nearest = 0;
      let best = Infinity;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const r = card.getBoundingClientRect();
        const off = (r.left + r.width / 2 - vw * 0.62) / vw; // focus line right of centre
        const a = clamp(Math.abs(off) * 1.6);
        card.style.opacity = String(1 - a * 0.55);
        card.style.transform = `scale(${1 - a * 0.07})`;
        if (imgRefs.current[i]) {
          imgRefs.current[i].style.transform = `translate3d(${off * -50}px, 0, 0) scale(1.15)`;
        }
        if (Math.abs(off) < best) {
          best = Math.abs(off);
          nearest = i;
        }
      });
      if (barRef.current) barRef.current.style.transform = `scaleX(${k})`;
      if (countRef.current) countRef.current.textContent = `0${nearest + 1}`;
      setActiveIdx(nearest);
    });
  }, []);

  const goToCard = (idx: number) => {
    const root = rootRef.current;
    if (!root) return;
    const vh = window.innerHeight;
    const span = Math.max(1, root.getBoundingClientRect().height - vh);
    const targetProgress = 0.04 + (idx / (log.length - 1)) * 0.92;
    const top = root.offsetTop + targetProgress * span;
    window.scrollTo({top, behavior: 'smooth'});
  };

  return (
    <section ref={rootRef} id="log" aria-labelledby="log-title" className="relative bg-void space-stars" style={{height: `${SECTION_VH}svh`}}>
      <div className="sticky top-0 flex h-screen-s flex-col justify-center overflow-hidden pt-16 md:flex-row md:items-center md:pt-0">
        {/* Left Column: Heading & Telemetry Progress */}
        <div className="relative z-10 shrink-0 px-4 sm:px-6 md:w-[32vw] md:pl-[6vw] md:pr-10">
          <div className="inline-flex items-center gap-2 rounded-[3px] border border-earth/20 bg-earth/[0.06] px-2.5 py-1 font-mono text-[0.6875rem] tracking-[0.18em] text-earth uppercase">
            <span className="size-1.5 rounded-full bg-earth" />
            <span>{intro.eyebrow}</span>
          </div>
          <h2 id="log-title" className="mt-4 font-display text-display text-white">
            {intro.heading}
          </h2>
          <p className="mt-5 max-w-[26rem] text-body text-regolith/75 leading-relaxed max-md:hidden">{intro.body}</p>

          {/* Frame Progress and Stepper Controls */}
          <div className="mt-8 flex items-center gap-6 font-mono text-label text-regolith/60 uppercase max-md:hidden" aria-hidden="true">
            <div className="flex items-center gap-3">
              <span className="text-white font-bold">
                <span ref={countRef}>01</span>
              </span>
              <span className="text-regolith/40">/</span>
              <span>0{log.length}</span>
            </div>

            <div className="relative h-1 w-36 overflow-hidden rounded-full bg-white/10">
              <span ref={barRef} className="absolute inset-0 origin-left bg-earth shadow-[0_0_8px_#6fb6ff]" style={{transform: 'scaleX(0)'}} />
            </div>

            {/* Quick step buttons */}
            <div className="flex items-center gap-1.5 pl-2">
              <button
                type="button"
                onClick={() => goToCard(Math.max(0, activeIdx - 1))}
                disabled={activeIdx === 0}
                aria-label="Previous mission frame"
                className="flex size-7 items-center justify-center rounded-[3px] border border-white/15 bg-white/[0.04] text-white transition-colors hover:border-earth hover:text-earth disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:text-white"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => goToCard(Math.min(log.length - 1, activeIdx + 1))}
                disabled={activeIdx === log.length - 1}
                aria-label="Next mission frame"
                className="flex size-7 items-center justify-center rounded-[3px] border border-white/15 bg-white/[0.04] text-white transition-colors hover:border-earth hover:text-earth disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:text-white"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Right Reel: Cards */}
        <ol ref={trackRef} className="mt-8 flex gap-5 pl-4 will-change-transform sm:pl-6 md:mt-0 md:gap-8 md:pl-0">
          {log.map((entry, i) => (
            <li
              key={entry.title}
              ref={(el) => {
                if (el) cardRefs.current[i] = el;
              }}
              className="w-[72vw] shrink-0 origin-bottom sm:w-[46vw] md:w-[clamp(17rem,25vw,24rem)]"
            >
              <figure className="group rounded-[8px] p-2.5 transition-all duration-300 border border-white/[0.08] bg-void-2/80 backdrop-blur-md hover:border-earth/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_25px_rgba(111,182,255,0.15)]">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[5px] bg-void-2">
                  <img
                    ref={(el) => {
                      if (el) imgRefs.current[i] = el;
                    }}
                    src={entry.image}
                    alt={`${entry.title}: ${entry.body}`}
                    width={840}
                    height={1120}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-700 ease-out will-change-transform"
                  />
                  {/* Vignette overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent opacity-60" />

                  {/* Corner reticle */}
                  <div className="brackets pointer-events-none absolute inset-2.5 text-white/30" />

                  {/* Telemetry Tag */}
                  <span className="absolute top-3.5 left-3.5 flex items-center gap-1.5 rounded-[3px] border border-white/20 bg-void/85 px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.16em] text-white uppercase backdrop-blur-md shadow-xs">
                    <span className="size-1 rounded-full bg-earth" />
                    {entry.tag}
                  </span>
                </div>

                <figcaption className="mt-4 flex gap-4 px-1 pb-1">
                  <span className="font-mono text-label text-earth font-bold">0{i + 1}</span>
                  <div>
                    <span className="block font-display text-[0.9375rem] tracking-[0.1em] text-white uppercase">{entry.title}</span>
                    <span className="mt-1.5 block text-[0.875rem] leading-relaxed text-regolith/75">{entry.body}</span>
                  </div>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
