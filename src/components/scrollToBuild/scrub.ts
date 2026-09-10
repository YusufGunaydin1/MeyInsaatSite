/*
  Scroll-scrub driver for ScrollToBuild.astro: preloads the time-lapse frames,
  maps scroll progress through the pinned wrap to a frame position, and keeps
  every indicator (canvas, backdrop, ruler, stage list, readout) on that one value.
*/
export function initScrub(root: HTMLElement) {
  const urls: string[] = JSON.parse(root.dataset.frames || '[]');
  const wrap = root.querySelector<HTMLElement>('[data-scrub-wrap]')!;
  const canvas = root.querySelector<HTMLCanvasElement>('[data-canvas]')!;
  const bgfx = root.querySelector<HTMLCanvasElement>('[data-bgfx]')!;
  const box = root.querySelector<HTMLElement>('[data-canvas-box]')!;
  const level = root.querySelector<HTMLElement>('[data-level]')!;
  const readout = root.querySelector<HTMLElement>('[data-readout]')!;
  const loaderPct = root.querySelector<HTMLElement>('[data-loader-pct]')!;
  const mobileStage = root.querySelector<HTMLElement>('[data-mobile-stage]')!;
  const rulerFill = root.querySelector<HTMLElement>('[data-ruler-fill]')!;
  const rulerDot = root.querySelector<HTMLElement>('[data-ruler-dot]')!;
  const progressBar = root.querySelector<HTMLElement>('[data-progress-bar]')!;
  const stageItems = Array.from(
    root.querySelectorAll<HTMLElement>('[data-stage-item]')
  );

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as any).connection?.saveData === true;
  // Static mode: final-state poster + every stage readable, no pin (CSS)
  function goStatic() {
    root.dataset.static = 'true';
    stageItems.forEach((el) => (el.dataset.active = 'true'));
  }

  if (reduced || saveData || urls.length === 0) {
    goStatic();
    return;
  }

  // Stage thresholds: single source is the component frontmatter (it also
  // places the ruler ticks) — serialized through data-stage-bounds.
  const STAGE_FROM_FRAME: number[] = JSON.parse(
    root.dataset.stageBounds || '[2, 9, 14, 17]'
  );
  const labels = {
    excavation: root.dataset.labelExcavation ?? 'KAZI',
    foundation: root.dataset.labelFoundation ?? 'TEMEL',
    floor: root.dataset.labelFloor ?? 'KAT',
    datum: root.dataset.labelDatum ?? 'KOT',
  };

  const ctx = canvas.getContext('2d')!;
  // Safari has no ctx.filter (WebKit bug 198416) and assigning it is a silent
  // no-op, so the backdrop would paint SHARP behind the sheet. No filter → no
  // backdrop: the theatre stays night-950.
  const bctx = 'filter' in CanvasRenderingContext2D.prototype ? bgfx.getContext('2d') : null;
  let bitmaps: (ImageBitmap | HTMLImageElement)[] = [];
  let currentPos = -1;
  let currentFrame = -1;
  let bgFrame = -1;
  let ticking = false;

  function stageOf(frame: number): number {
    return STAGE_FROM_FRAME.findIndex((max) => frame <= max);
  }

  function floorOf(frame: number): number {
    return Math.min(6, Math.max(1, Math.round((frame - 3) / 2)));
  }

  // One source for every HUD element: big label, elevation, level-line height
  function meta(frame: number): { big: string; elev: string; lvl: number } {
    if (frame <= 2) return { big: labels.excavation, elev: '−4.50 M', lvl: 8 };
    if (frame <= 4) return { big: labels.foundation, elev: '±0.00 M', lvl: 12 };
    const kat = floorOf(frame);
    const h = ((kat * 18.4) / 6).toFixed(2);
    return { big: `${labels.floor} ${kat}`, elev: `+${h} M`, lvl: 15 + (kat / 6) * 70 };
  }

  function sizeBg() {
    bgfx.width = Math.max(1, Math.round(window.innerWidth / 3));
    bgfx.height = Math.max(1, Math.round(window.innerHeight / 3));
    bgFrame = -1; // force redraw at the new size
  }

  function drawBg(frame: number) {
    if (!bctx || frame === bgFrame) return;
    const bmp = bitmaps[frame - 1];
    if (!bmp) return;
    bgFrame = frame;
    // Alpha frames: clear first or the previous (taller) building ghosts
    // through the transparent sky when scrubbing backward.
    bctx.clearRect(0, 0, bgfx.width, bgfx.height);
    bctx.filter = 'blur(14px) brightness(0.55)';
    bctx.drawImage(
      bmp as CanvasImageSource,
      -32, -32, bgfx.width + 64, bgfx.height + 64
    );
  }

  function render(pos: number) {
    if (Math.abs(pos - currentPos) < 0.002) return;
    currentPos = pos;
    const base = Math.floor(pos);
    const frac = pos - base;
    const a = bitmaps[base];
    const b = bitmaps[base + 1];
    if (a) {
      ctx.globalAlpha = 1;
      // Alpha frames: clear first — without it a taller building from a later
      // frame stays visible through the transparent sky on upward scroll.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(a as CanvasImageSource, 0, 0, canvas.width, canvas.height);
      // Crossfade to the next frame: 17 frames scrub like a continuous take
      if (b && frac > 0.01) {
        ctx.globalAlpha = frac;
        ctx.drawImage(b as CanvasImageSource, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      }
    }

    const frame = Math.round(pos) + 1;
    // One progress value drives every indicator: mobile bar, ruler fill + dot
    const pct = ((pos / (urls.length - 1)) * 100).toFixed(2);
    progressBar.style.width = `${pct}%`;
    rulerFill.style.height = `${pct}%`;
    rulerDot.style.bottom = `${pct}%`;
    drawBg(frame);
    if (frame === currentFrame) return;
    currentFrame = frame;

    const m = meta(frame);
    level.style.bottom = `${m.lvl}%`;
    readout.textContent = `${m.big} · ${m.elev}`;
    const active = stageOf(frame);
    stageItems.forEach((el, i) => {
      if (i === active) {
        el.dataset.active = 'true';
        el.setAttribute('aria-current', 'step');
      } else {
        delete el.dataset.active;
        el.removeAttribute('aria-current');
      }
    });
    const s = stageItems[active];
    if (s) {
      const no = s.querySelector('.scrub-stage-no')?.textContent ?? '';
      const name = s.querySelector('.scrub-stage-name')?.textContent ?? '';
      mobileStage.textContent = `${no} ${name} — ${m.big} ${m.elev}`;
    }
  }

  function progress(): number {
    const rect = wrap.getBoundingClientRect();
    const span = rect.height - window.innerHeight;
    if (span <= 0) return 1;
    return Math.min(1, Math.max(0, -rect.top / span));
  }

  function posFromProgress(): number {
    return progress() * (urls.length - 1);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      render(posFromProgress());
    });
  }

  async function loadOne(u: string): Promise<ImageBitmap | HTMLImageElement> {
    if ('createImageBitmap' in window) {
      const res = await fetch(u);
      return await createImageBitmap(await res.blob());
    }
    const img = new Image();
    img.src = u;
    await img.decode();
    return img;
  }

  async function load() {
    let done = 0;
    // Concurrency-limited so the ~1.5MB sequence never floods the connection.
    const results: (ImageBitmap | HTMLImageElement | undefined)[] = new Array(urls.length);
    let next = 0;
    async function worker() {
      while (next < urls.length) {
        const i = next++;
        // One retry absorbs a dropped request on a flaky mobile connection
        results[i] = await loadOne(urls[i])
          .catch(() => loadOne(urls[i]))
          .catch(() => undefined);
        done += 1;
        loaderPct.textContent = `${Math.round((done / urls.length) * 100)}%`;
      }
    }
    await Promise.all(Array.from({ length: 4 }, worker));
    const first = results.find(Boolean);
    if (!first) {
      goStatic(); // offline / blocked: a pin over a frozen poster is worse than none
      return;
    }
    // A frame that still failed borrows its predecessor: the scrub skips one step
    // instead of stalling forever on the loader.
    let last = first;
    bitmaps = results.map((bmp) => (last = bmp ?? last));
    sizeBg();
    root.dataset.ready = 'true';
    render(posFromProgress());
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener(
      'resize',
      () => {
        sizeBg();
        currentPos = -1; // force full re-render after canvas resize
        onScroll();
      },
      { passive: true }
    );
    // Expose for E2E measurement: frame index must track scroll (prove the scrub).
    (root as any).__scrub = { getFrame: () => currentFrame, getProgress: progress };
  }

  // Never compete with the initial page load (LCP): start only after window
  // 'load', then on approach (IO) or first scroll intent, whichever comes first.
  function arm() {
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      io.disconnect();
      window.removeEventListener('scroll', start);
      load();
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) start();
      },
      { rootMargin: '75% 0px' }
    );
    io.observe(box);
    window.addEventListener('scroll', start, { passive: true, once: true });
  }

  if (document.readyState === 'complete') arm();
  else window.addEventListener('load', arm, { once: true });
}
