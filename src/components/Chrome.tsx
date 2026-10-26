import {useEffect, useState, type MouseEvent} from 'react';
import {brand, nav} from '../content';
import {scrollToHash} from '../lib/scroll';

function go(e: MouseEvent<HTMLAnchorElement>, then?: () => void) {
  const hash = e.currentTarget.getAttribute('href');
  if (!hash?.startsWith('#')) return;
  e.preventDefault();
  then?.();
  scrollToHash(hash);
}

/** A crescent: the mark. */
function Crescent({className = ''}: {className?: string}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M15.5 3.2A9 9 0 1 0 20.8 16 7.2 7.2 0 0 1 15.5 3.2Z" fill="currentColor" />
    </svg>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      // Simple active section check
      const sections = ['reserve', 'missions', 'trajectory', 'log'];
      const scrollPos = window.scrollY + window.innerHeight * 0.4;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && scrollPos >= el.offsetTop) {
          setActiveSection(`#${id}`);
          return;
        }
      }
      setActiveSection('');
    };

    window.addEventListener('scroll', onScroll, {passive: true});
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 text-white transition-all duration-300 ${
        scrolled
          ? 'bg-void/85 border-b border-white/[0.08] py-3.5 backdrop-blur-md shadow-[0_12px_36px_rgba(0,0,0,0.6)]'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-[3vw]">
        <div className="flex items-center gap-6">
          <a
            href="#top"
            onClick={(e) => go(e)}
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
            aria-label={`${brand.name} — back to top`}
          >
            <Crescent className="size-5 text-earth transition-transform duration-300 group-hover:rotate-12" />
            <span className="font-display text-[0.9375rem] tracking-[0.36em] transition-colors group-hover:text-earth">{brand.wordmark}</span>
          </a>

          {/* Mission Control Status Indicator */}
          <div className="hidden xl:flex items-center gap-2 rounded-[3px] border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.16em] text-regolith/70 uppercase backdrop-blur-xs">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-earth opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-earth" />
            </span>
            <span>MARE TRANQUILLITATIS · TELEMETRY ACTIVE</span>
          </div>
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {nav.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => go(e)}
                className={`group relative py-1 font-mono text-label uppercase transition-colors ${
                  isActive ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-earth shadow-[0_0_8px_#6fb6ff]" />
                )}
              </a>
            );
          })}
          <a
            href="#reserve"
            onClick={(e) => go(e)}
            className="group relative rounded-[4px] bg-white px-4 py-2.5 font-mono text-label text-void uppercase transition-all duration-300 hover:bg-earth hover:shadow-[0_0_20px_rgba(111,182,255,0.4)]"
          >
            Reserve a seat
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center font-mono text-label uppercase transition-colors hover:text-earth md:hidden"
        >
          <span className="rounded-[3px] border border-white/15 bg-white/[0.04] px-3 py-1.5">
            {open ? 'Close' : 'Menu'}
          </span>
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        id="menu"
        inert={!open}
        className={`fixed inset-0 -z-10 flex flex-col justify-center bg-void/98 px-8 backdrop-blur-2xl transition-all duration-300 md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <Crescent className="size-4 text-earth" />
          <span className="font-display text-[0.875rem] tracking-[0.3em] text-white/90">{brand.wordmark}</span>
        </div>

        <div className="space-y-6">
          {nav.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => go(e, () => setOpen(false))}
              className="flex items-baseline gap-4 font-display text-[1.875rem] tracking-[0.14em] text-white uppercase transition-colors hover:text-earth"
            >
              <span className="font-mono text-label text-earth">0{i + 1}</span>
              {item.label}
            </a>
          ))}
          <div className="pt-6 border-t border-white/10">
            <a
              href="#reserve"
              onClick={(e) => go(e, () => setOpen(false))}
              className="block w-full rounded-[4px] bg-white py-3.5 text-center font-mono text-label text-void uppercase transition-colors hover:bg-earth"
            >
              Reserve a seat
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-void px-4 py-10 sm:px-6 md:px-[6vw]">
      {/* Subtle starlight horizon glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-earth/30 to-transparent"
      />
      <div className="flex flex-col gap-6 font-mono text-label text-regolith/50 uppercase md:flex-row md:items-center md:justify-between">
        <span className="flex items-center gap-2.5 text-white/80">
          <Crescent className="size-4 text-earth" />
          {brand.wordmark} · a concept
        </span>
        <span className="tracking-wider">© {new Date().getFullYear()} · Imagery generated for this concept</span>
        <div className="flex items-center gap-6">
          <a href={`mailto:${brand.email}`} className="text-regolith/60 transition-colors hover:text-earth">
            {brand.email}
          </a>
          <a href="#top" onClick={(e) => go(e)} className="transition-colors hover:text-white">
            Back to the surface ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
