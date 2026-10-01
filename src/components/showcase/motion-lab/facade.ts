export function initFacadeDepth(root: HTMLElement) {
  const viewport = root.querySelector<HTMLElement>('[data-facade-viewport]')!;
  const camera = root.querySelector<HTMLElement>('[data-facade-camera]')!;
  const depth = root.querySelector<HTMLInputElement>('[data-facade-depth]')!;
  const angle = root.querySelector<HTMLInputElement>('[data-facade-angle]')!;
  const depthOutput = root.querySelector<HTMLOutputElement>('[data-facade-depth-output]')!;
  const angleOutput = root.querySelector<HTMLOutputElement>('[data-facade-angle-output]')!;
  const toggle = root.querySelector<HTMLButtonElement>('[data-facade-motion-toggle]')!;
  const sceneButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-facade-scene]')];
  const day = root.querySelector<HTMLImageElement>('[data-facade-day]')!;
  const dusk = root.querySelector<HTMLImageElement>('[data-facade-dusk]')!;
  const backdrop = root.querySelector<HTMLImageElement>('[data-facade-backdrop]')!;
  const status = root.querySelector<HTMLElement>('[data-facade-status]')!;
  const sceneTag = root.querySelector<HTMLElement>('[data-facade-scene-tag]')!;
  const motionLabel = root.querySelector<HTMLElement>('[data-facade-motion-label]')!;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let moving = false;
  let pointerY = 0;
  let scrollY = 0;
  let scrollRequest = 0;
  let sceneRequest = 0;

  function paint() {
    const intensity = Number(depth.value) / 100;
    const rotation = Number(angle.value) * 0.08;
    camera.style.setProperty('--ml-depth', String(intensity));
    camera.style.setProperty('--ml-tilt-x', `${pointerY * intensity * -5}deg`);
    camera.style.setProperty('--ml-tilt-y', `${rotation}deg`);
    camera.style.setProperty('--ml-scroll-y', `${scrollY * intensity * 22}px`);
    viewport.style.setProperty('--ml-backdrop-x', `${rotation * -1.5}px`);
    viewport.style.setProperty('--ml-backdrop-y', `${scrollY * -12}px`);
    depthOutput.value = `${depth.value}%`;
    angleOutput.value = `${rotation.toFixed(1).replace('.0', '')}°`;
    root.dataset.depth = depth.value;
    root.dataset.angle = angle.value;
  }

  function setMotion(value: boolean) {
    moving = value;
    root.dataset.motion = String(value);
    toggle.setAttribute('aria-pressed', String(value));
    toggle.textContent = value ? 'Hareketi durdur' : 'Hareketi aç';
    motionLabel.textContent = value ? 'İMLEÇ + KAYDIRMA' : 'SABİT PERSPEKTİF';
    if (!value) { pointerY = 0; scrollY = 0; paint(); }
  }

  async function selectScene(scene: 'day' | 'dusk') {
    const request = ++sceneRequest;
    const image = scene === 'day' ? day : dusk;
    if (!image.complete || !image.naturalWidth) {
      status.textContent = 'Seçilen ışık görünümü yükleniyor.';
      try { await image.decode(); }
      catch {
        if (request === sceneRequest) status.textContent = 'Işık görünümü yüklenemedi. Diğer görünümü seçebilir veya tekrar deneyebilirsiniz.';
        return;
      }
    }
    if (request !== sceneRequest) return;
    root.dataset.scene = scene;
    day.setAttribute('aria-hidden', String(scene !== 'day'));
    dusk.setAttribute('aria-hidden', String(scene !== 'dusk'));
    sceneButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.facadeScene === scene)));
    backdrop.src = image.currentSrc || image.src;
    sceneTag.textContent = scene === 'day' ? '01 — GÜN IŞIĞI' : '02 — MAVİ SAAT';
    status.textContent = scene === 'day'
      ? 'Gün ışığı: mevcut temsilî proje görseli.'
      : 'Mavi saat: yapay zekâ ile hazırlanmış ışık ve atmosfer çalışması.';
  }

  depth.addEventListener('input', paint);
  angle.addEventListener('input', () => { setMotion(false); paint(); });
  toggle.addEventListener('click', () => {
    setMotion(!moving);
    if (moving) {
      status.textContent = 'İmleci görsel üzerinde hareket ettirin veya sayfayı kaydırın. Hareketi durdur düğmesi sahneyi sabitler.';
      updateScroll();
    }
  });
  sceneButtons.forEach((button) => button.addEventListener('click', () => void selectScene(button.dataset.facadeScene as 'day' | 'dusk')));
  viewport.addEventListener('pointermove', (event) => {
    if (!moving || event.pointerType !== 'mouse') return;
    const box = viewport.getBoundingClientRect();
    angle.value = String(Math.round(((event.clientX - box.left) / box.width - 0.5) * 200));
    pointerY = ((event.clientY - box.top) / box.height - 0.5) * 2;
    paint();
  });
  viewport.addEventListener('pointerleave', () => {
    if (!moving) return;
    angle.value = '0';
    pointerY = 0;
    paint();
  });

  function updateScroll() {
    if (!moving) return;
    const box = viewport.getBoundingClientRect();
    if (box.bottom < 0 || box.top > window.innerHeight) return;
    scrollY = Math.max(-1, Math.min(1, (window.innerHeight / 2 - box.top - box.height / 2) / window.innerHeight));
    paint();
  }
  window.addEventListener('scroll', () => {
    if (!moving || scrollRequest) return;
    scrollRequest = requestAnimationFrame(() => { scrollRequest = 0; updateScroll(); });
  }, { passive: true });
  reduced.addEventListener('change', () => { if (reduced.matches) setMotion(false); });
  root.querySelector('[data-facade-reset]')!.addEventListener('click', () => {
    depth.value = '55';
    angle.value = '0';
    setMotion(false);
    void selectScene('day');
    paint();
  });
  root.dataset.enhanced = 'true';
  root.dataset.ready = 'true';
  paint();
}
