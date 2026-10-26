import {useEffect, useState, type FormEvent} from 'react';
import {brand, missions, reserve} from '../content';
import {useReveals} from '../hooks/useReveals';

type Status = 'idle' | 'invalid' | 'sent';

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const ms = Math.max(0, new Date(target).getTime() - now);
  const s = Math.floor(ms / 1000);
  return {d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60};
}

/**
 * Waitlist. Ticking launch-window countdown on one side, the manifest form on
 * the other; the form hands a drafted message to the visitor's mail app.
 */
export function Reserve() {
  const ref = useReveals<HTMLElement>();
  const t = useCountdown(reserve.window);
  const [status, setStatus] = useState<Status>('idle');

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setStatus('invalid');
      form.reportValidity();
      return;
    }
    const data = new FormData(form);
    const subject = encodeURIComponent(`Manifest: ${String(data.get('mission'))}`);
    const body = encodeURIComponent(`Name: ${String(data.get('name'))}\nEmail: ${String(data.get('email'))}\nMission: ${String(data.get('mission'))}`);
    window.location.href = `mailto:${brand.email}?subject=${subject}&body=${body}`;
    setStatus('sent');
  };

  const field =
    'w-full rounded-[4px] bg-white/[0.04] px-4 py-3.5 text-body text-white border border-white/15 outline-none placeholder:text-regolith/35 transition-all duration-300 focus:border-earth focus:ring-1 focus:ring-earth focus:shadow-[0_0_16px_rgba(111,182,255,0.25)]';
  
  const units: [string, number][] = [
    ['Days', t.d],
    ['Hrs', t.h],
    ['Min', t.m],
    ['Sec', t.s],
  ];

  return (
    <section ref={ref} id="reserve" aria-labelledby="reserve-title" className="relative overflow-hidden bg-void space-stars px-4 pb-28 sm:px-6 md:px-[6vw] md:pb-40">
      {/* A sliver of the Earth rising at the bottom edge — the hero, bookended. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[60vw] left-1/2 size-[92vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_30%,rgba(111,182,255,0.38),rgba(111,182,255,0.06)_55%,transparent_70%)] blur-md"
      />

      <div className="relative grid gap-12 border-t border-white/10 pt-20 md:grid-cols-2 md:gap-16 md:pt-28">
        {/* Left Column: Heading & Countdown */}
        <div data-reveal>
          <div className="inline-flex items-center gap-2 rounded-[3px] border border-earth/20 bg-earth/[0.06] px-2.5 py-1 font-mono text-[0.6875rem] tracking-[0.18em] text-earth uppercase">
            <span className="size-1.5 rounded-full bg-earth" />
            <span>{reserve.eyebrow}</span>
          </div>
          <h2 id="reserve-title" className="mt-4 font-display text-display text-white">
            {reserve.heading}
          </h2>
          <p className="mt-5 max-w-[28rem] text-body text-regolith/75 leading-relaxed">{reserve.body}</p>

          <div className="mt-10 rounded-[6px] border border-white/10 bg-void-2/60 p-5 backdrop-blur-md">
            <div className="flex items-center gap-2 font-mono text-label text-regolith/60 uppercase">
              <span className="size-1.5 rounded-full bg-earth animate-pulse" />
              <span>{reserve.windowLabel}</span>
            </div>

            <div
              className="mt-4 flex gap-2 sm:gap-3"
              role="timer"
              aria-label={`${t.d} days, ${t.h} hours, ${t.m} minutes until the next launch window`}
            >
              {units.map(([label, v]) => (
                <div
                  key={label}
                  className="brackets-glow min-w-[4.25rem] flex-1 rounded-[4px] border border-white/10 bg-white/[0.02] px-3 py-3 text-center sm:min-w-[5.25rem]"
                >
                  <span className="block font-display text-[1.625rem] font-bold text-white tabular-nums sm:text-[2.25rem]">
                    {String(v).padStart(2, '0')}
                  </span>
                  <span className="mt-1 block font-mono text-[0.625rem] tracking-[0.14em] text-earth uppercase font-semibold">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <form
          noValidate
          onSubmit={onSubmit}
          aria-describedby="reserve-status"
          className="space-y-4 rounded-[8px] border border-white/10 bg-void-2/80 p-6 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:p-8"
          data-reveal
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-mono text-label text-white uppercase font-bold tracking-wider">Flight Manifest Form</span>
            <span className="font-mono text-[0.625rem] text-earth uppercase">STAGE // RESERVATION</span>
          </div>

          <label className="block">
            <span className="mb-1.5 block font-mono text-label text-regolith/70 uppercase">Name</span>
            <input
              name="name"
              required
              autoComplete="name"
              placeholder="As it should appear on the manifest"
              className={field}
              onInput={() => setStatus('idle')}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-label text-regolith/70 uppercase">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@earth.com"
              className={field}
              onInput={() => setStatus('idle')}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-label text-regolith/70 uppercase">Mission</span>
            <div className="relative">
              <select name="mission" defaultValue="Lander" className={`${field} appearance-none pr-10 cursor-pointer`}>
                {missions.items.map((m) => (
                  <option key={m.name} value={m.name} className="bg-void-2 text-white">
                    {m.name} — {m.days} days
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
                ▾
              </span>
            </div>
          </label>

          <button
            type="submit"
            className="group relative mt-2 w-full rounded-[4px] bg-white px-5 py-4 font-mono text-label text-void uppercase font-bold tracking-wider transition-all duration-300 hover:bg-earth hover:shadow-[0_0_25px_rgba(111,182,255,0.45)]"
          >
            <span>Add me to the manifest</span>
          </button>

          <p id="reserve-status" role="status" className="min-h-[1.25rem] text-[0.8125rem] text-regolith/80">
            {status === 'invalid' && (
              <span className="text-red-300">Name and a valid email, please — the manifest is strict.</span>
            )}
            {status === 'sent' && (
              <span className="text-emerald-300">
                Your mail app should be open with your request drafted. If not: {brand.email}.
              </span>
            )}
          </p>
        </form>
      </div>
    </section>
  );
}
