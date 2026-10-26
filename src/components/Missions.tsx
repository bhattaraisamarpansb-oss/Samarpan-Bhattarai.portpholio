import type {MouseEvent} from 'react';
import {missions} from '../content';
import {useReveals} from '../hooks/useReveals';
import {scrollToHash} from '../lib/scroll';

const toReserve = (e: MouseEvent<HTMLAnchorElement>, name: string) => {
  e.preventDefault();
  const select = document.querySelector<HTMLSelectElement>('#reserve select[name="mission"]');
  if (select) {
    select.value = name;
    select.dispatchEvent(new Event('change', {bubbles: true}));
  }
  scrollToHash('#reserve');
};

/** Three mission classes. Each card carries its length as a set of orbit rings. */
export function Missions() {
  const ref = useReveals<HTMLElement>();

  return (
    <section ref={ref} id="missions" aria-labelledby="missions-title" className="relative bg-void space-stars px-4 py-28 sm:px-6 md:px-[6vw] md:py-40">
      {/* Subtle background radial ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 size-[60vw] max-w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(111,182,255,0.06)_0%,transparent_70%)]"
      />

      <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between" data-reveal>
        <div>
          <div className="inline-flex items-center gap-2 rounded-[3px] border border-earth/20 bg-earth/[0.06] px-2.5 py-1 font-mono text-[0.6875rem] tracking-[0.18em] text-earth uppercase">
            <span className="size-1.5 rounded-full bg-earth" />
            <span>{missions.eyebrow}</span>
          </div>
          <h2 id="missions-title" className="mt-4 font-display text-display text-white">
            {missions.heading}
          </h2>
        </div>
        <p className="font-mono text-label text-regolith/50 uppercase tracking-wider">{missions.note}</p>
      </div>

      <ol className="relative mt-14 grid gap-6 md:mt-20 md:grid-cols-3 md:gap-7">
        {missions.items.map((m, i) => (
          <li
            key={m.name}
            data-reveal
            style={{transitionDelay: `${i * 120}ms`}}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-[8px] p-6 transition-all duration-500 hover:-translate-y-2 md:p-8 ${
              m.featured
                ? 'bg-gradient-to-b from-void-2 via-void-2/90 to-void-2 border border-earth/60 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_35px_rgba(111,182,255,0.2)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.7),0_0_50px_rgba(111,182,255,0.35)]'
                : 'bg-void-2/70 border border-white/10 backdrop-blur-md hover:border-white/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
            }`}
          >
            {/* Celestial Orbit rings — one per week of the mission */}
            <svg
              aria-hidden="true"
              viewBox="0 0 200 200"
              className="absolute -top-10 -right-10 size-52 text-white/[0.08] transition-transform duration-[2.5s] ease-out group-hover:rotate-90 group-hover:text-earth/20 pointer-events-none"
            >
              {Array.from({length: Math.ceil(m.days / 7)}, (_, k) => (
                <ellipse
                  key={k}
                  cx="100"
                  cy="100"
                  rx={40 + k * 18}
                  ry={18 + k * 8}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray={k % 2 === 1 ? '4 4' : undefined}
                  transform={`rotate(${-20 + k * 14} 100 100)`}
                />
              ))}
              <circle cx="100" cy="100" r="8" fill="currentColor" />
            </svg>

            {/* Content Top */}
            <div>
              <div className="flex items-center justify-between">
                {m.featured ? (
                  <span className="inline-flex items-center gap-1.5 rounded-[3px] bg-earth px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.16em] text-void uppercase font-bold shadow-[0_0_12px_rgba(111,182,255,0.5)]">
                    <span className="size-1 rounded-full bg-void" />
                    Most requested
                  </span>
                ) : (
                  <span className="font-mono text-[0.625rem] tracking-[0.16em] text-regolith/40 uppercase">
                    Class 0{i + 1}
                  </span>
                )}
              </div>

              <h3 className={`font-display text-[1.375rem] tracking-[0.14em] text-white uppercase ${m.featured ? 'mt-4' : 'mt-2'}`}>
                {m.name}
              </h3>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-[3.75rem] leading-none text-white font-bold">{m.days}</span>
                <span className="font-mono text-label text-regolith/60 uppercase">days</span>
              </div>

              <ul className="mt-8 space-y-3 border-t border-white/10 pt-6">
                {m.lines.map((l) => (
                  <li key={l} className="flex items-start gap-3 text-[0.9375rem] text-regolith/85 leading-snug">
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                        m.featured ? 'bg-earth shadow-[0_0_6px_#6fb6ff]' : 'bg-white/40'
                      }`}
                    />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Bottom CTA */}
            <div className="pt-8">
              <a
                href="#reserve"
                onClick={(e) => toReserve(e, m.name)}
                className={`block w-full rounded-[4px] px-5 py-3.5 text-center font-mono text-label uppercase transition-all duration-300 ${
                  m.featured
                    ? 'bg-earth text-void font-bold shadow-[0_0_20px_rgba(111,182,255,0.4)] hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]'
                    : 'text-white border border-white/20 bg-white/[0.03] hover:border-white hover:bg-white hover:text-void'
                }`}
              >
                {m.cta}
              </a>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
