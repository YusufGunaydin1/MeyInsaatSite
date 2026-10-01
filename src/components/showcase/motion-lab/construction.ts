import { buildStages } from './constructionData';

export function initConstructionCinema(root: HTMLElement) {
  const urls: string[] = JSON.parse(root.dataset.frames || '[]');
  const canvas = root.querySelector<HTMLCanvasElement>('[data-build-canvas]')!;
  const ctx = canvas.getContext('2d');
  const runway = root.querySelector<HTMLElement>('[data-build-runway]')!;
  const sticky = root.querySelector<HTMLElement>('[data-build-sticky]')!;
  const range = root.querySelector<HTMLInputElement>('[data-build-range]')!;
  const status = root.querySelector<HTMLElement>('[data-build-status]')!;
  const number = root.querySelector<HTMLElement>('[data-build-number]')!;
  const heading = root.querySelector<HTMLElement>('[data-build-heading]')!;
  const description = root.querySelector<HTMLElement>('[data-build-description]')!;
  const percent = root.querySelector<HTMLOutputElement>('[data-build-percent]')!;
  const progress = root.querySelector<HTMLElement>('[data-build-progress]')!;
  const datum = root.querySelector<HTMLElement>('[data-build-datum]')!;
  const phaseButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-build-stage]')];
  const modeButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-build-mode]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  const buttons = [...phaseButtons, ...modeButtons, root.querySelector<HTMLButtonElement>('[data-build-reset]')!];
  let images: HTMLImageElement[] = [];
  let value = urls.length - 1;
  let frameRequest = 0;
  let mode: 'manual' | 'scroll' = 'manual';
  if (!ctx || urls.length < 2) return;
  root.dataset.enhanced = 'true';
  buttons.forEach((button) => { button.disabled = true; });
  range.disabled = true;

  function render(next: number) {
    value = Math.max(0, Math.min(urls.length - 1, next));
    const base = Math.floor(value);
    const fraction = value - base;
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    ctx!.globalAlpha = 1;
    ctx!.drawImage(images[base], 0, 0, canvas.width, canvas.height);
    if (images[base + 1] && fraction > 0) {
      ctx!.globalAlpha = fraction;
      ctx!.drawImage(images[base + 1], 0, 0, canvas.width, canvas.height);
      ctx!.globalAlpha = 1;
    }
    const frame = Math.round(value) + 1;
    const stage = buildStages.findIndex((item) => frame <= item.lastFrame);
    const pct = value / (urls.length - 1) * 100;
    root.dataset.frame = String(frame);
    number.textContent = String(frame).padStart(2, '0');
    heading.textContent = buildStages[stage].name;
    description.textContent = buildStages[stage].description;
    range.value = String(value);
    range.setAttribute('aria-valuetext', `${frame}. kare, ${buildStages[stage].name}`);
    percent.value = `${Math.round(pct)}%`;
    progress.style.width = `${pct}%`;
    datum.style.bottom = `${12 + pct * 0.66}%`;
    phaseButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === stage)));
  }

  function updateScroll() {
    if (mode !== 'scroll' || !images.length) return;
    const box = runway.getBoundingClientRect();
    const span = box.height - sticky.offsetHeight;
    if (span > 0) render(-box.top / span * (urls.length - 1));
  }

  function onScroll() {
    if (frameRequest || mode !== 'scroll') return;
    frameRequest = requestAnimationFrame(() => { frameRequest = 0; updateScroll(); });
  }

  function setMode(next: 'manual' | 'scroll', align = false) {
    const oldTop = root.getBoundingClientRect().top;
    const absoluteTop = oldTop + window.scrollY;
    mode = next;
    root.dataset.mode = next;
    modeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.buildMode === next)));
    status.textContent = next === 'scroll'
      ? 'Aşağı veya yukarı kaydırarak sekansı kontrol edin.'
      : 'Kare seçimi açık. Sürgüyü veya aşama düğmelerini kullanın.';
    if (align) {
      const span = runway.offsetHeight - sticky.offsetHeight;
      const offset = next === 'scroll' ? value / (urls.length - 1) * Math.max(0, span) : 0;
      window.scrollTo({ top: absoluteTop + offset, behavior: 'instant' });
    }
  }

  range.addEventListener('input', () => {
    const next = Number(range.value);
    if (mode !== 'manual') setMode('manual', true);
    render(next);
  });
  phaseButtons.forEach((button) => button.addEventListener('click', () => {
    setMode('manual', mode !== 'manual');
    render(Number(button.dataset.frameTarget));
  }));
  modeButtons.forEach((button) => button.addEventListener('click', () => {
    setMode(button.dataset.buildMode as 'manual' | 'scroll', true);
  }));
  root.querySelector('[data-build-reset]')!.addEventListener('click', () => {
    setMode('manual', mode !== 'manual');
    render(0);
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches && images.length) {
      setMode('manual', mode !== 'manual');
      render(urls.length - 1);
      status.textContent = 'Azaltılmış hareket tercihiniz açık. Kareleri sürgüyle tek tek inceleyebilirsiniz.';
    }
  });

  async function load() {
    let next = 0;
    let loaded = 0;
    const decoded: (HTMLImageElement | undefined)[] = Array.from({ length: urls.length }, () => undefined);
    async function worker() {
      while (next < urls.length) {
        const index = next++;
        const image = new Image();
        image.src = urls[index];
        try { await image.decode(); decoded[index] = image; } catch { /* The poster remains available if any frame fails. */ }
        loaded += 1;
        status.textContent = `Görüntü dizisi hazırlanıyor: ${loaded}/${urls.length}`;
      }
    }
    await Promise.all(Array.from({ length: 3 }, worker));
    if (decoded.some((image) => !image)) {
      status.textContent = 'Görüntü dizisi yüklenemedi. Son kare gösteriliyor; yeniden denemek için sayfayı yenileyin.';
      return;
    }
    images = decoded as HTMLImageElement[];
    root.dataset.ready = 'true';
    buttons.forEach((button) => { button.disabled = false; });
    range.disabled = false;
    const useScroll = !reduced.matches && !connection?.saveData;
    setMode(useScroll ? 'scroll' : 'manual');
    render(useScroll ? 0 : urls.length - 1);
    if (useScroll) updateScroll();
    else status.textContent = 'Hareket yerine kare seçimi açık. Sürgüyle istediğiniz aşamayı inceleyin.';
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) { observer.disconnect(); void load(); }
  }, { rootMargin: '400px' });
  observer.observe(root);
}
