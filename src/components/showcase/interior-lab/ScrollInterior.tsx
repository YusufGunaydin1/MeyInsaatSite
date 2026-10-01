import { useEffect, useRef, useState } from 'react';
import RoomControls, { useInteriorSelection } from './RoomControls';
import { AI_NOTICE, type InteriorProps } from './types';
import useImageStatus from './useImageStatus';

const steps = [
  { title: 'Mekânı okuyun.', text: 'Gün ışığı, açıklıklar ve mevcut yüzeyler. Başlangıç noktası dairenin gerçek fotoğrafı.', at: 0 },
  { title: 'İhtimali görün.', text: 'Aynı bakış açısından önerilen yerleşim belirir. Yaşam alanı fikri, mevcut mekânın üzerine eklenir.', at: 50 },
  { title: 'Bir yaşama dönüşsün.', text: 'Tamamlanmış dekorasyon önerisi. Beğendiğiniz yaklaşımı ilk iki deneyimde gerçek fotoğrafla karşılaştırabilirsiniz.', at: 100 },
];

export default function ScrollInterior({ rooms }: InteriorProps) {
  const { room, style, ready, setRoomId, setStyleId } = useInteriorSelection(rooms);
  const [mode, setMode] = useState<'scroll' | 'manual'>('manual');
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [fitsViewport, setFitsViewport] = useState(true);
  const track = useRef<HTMLDivElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const activeStep = progress < 25 ? 0 : progress < 80 ? 1 : 2;
  const imageStatus = useImageStatus(style.src);
  const visibleProgress = imageStatus === 'ready' ? progress : 0;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReduced(preference.matches);
      setMode(preference.matches ? 'manual' : 'scroll');
      if (preference.matches) setProgress(100);
    };
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!sticky.current) return;
    const update = () => {
      const fits = (sticky.current?.scrollHeight ?? 0) <= window.innerHeight + 1;
      setFitsViewport(fits);
      if (!fits) setMode('manual');
    };
    const observer = new ResizeObserver(update);
    observer.observe(sticky.current);
    window.addEventListener('resize', update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    if (mode !== 'scroll' || !fitsViewport || reduced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!track.current || !sticky.current) return;
      const bounds = track.current.getBoundingClientRect();
      const distance = Math.max(1, bounds.height - sticky.current.offsetHeight);
      setProgress(Math.round(Math.max(0, Math.min(1, -bounds.top / distance)) * 100));
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    queue();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
    };
  }, [mode, fitsViewport, reduced]);

  function chooseProgress(value: number) {
    setMode('manual');
    setProgress(value);
  }

  return (
    <section className="il-cinema theatre" data-testid="interior-cinema" aria-labelledby="cinema-heading">
      <div className="container-site il-cinema-intro">
        <div>
          <p className="t-tech il-eyebrow">03 / Mekânın hikâyesi</p>
          <h2 className="t-display-l" id="cinema-heading">Boşluktan yaşama.</h2>
          <p className="il-intro">Aşağı kaydırın; mekânın dönüşümünü izleyin. İsterseniz görünümü kendiniz seçin.</p>
        </div>
        <RoomControls rooms={rooms} room={room} styleId={style.id} ready={ready}
          onRoom={setRoomId} onStyle={setStyleId} prefix="cinema" />
      </div>
      <div ref={track} className="il-cinema-track" data-mode={mode} data-scrollable={ready && !reduced && fitsViewport}>
        <div ref={sticky} className="il-cinema-sticky container-site">
          <div className="il-cinema-layout">
            <div className="il-cinema-copy">
              <div className="il-cinema-count" aria-hidden="true">0{activeStep + 1}<span>/ 03</span></div>
              <ol className="il-cinema-steps">
                {steps.map((step, index) => (
                  <li key={step.title} data-active={activeStep === index}>
                    <button type="button" disabled={!ready} aria-current={activeStep === index ? 'step' : undefined}
                      data-testid={`cinema-step-${index + 1}`} onClick={() => chooseProgress(step.at)}>
                      <span className="t-tech">0{index + 1}</span><span>{step.title}</span>
                    </button>
                    <p>{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="il-cinema-visual">
              <div className="il-cinema-image" style={{ aspectRatio: `${room.original.width ?? 4} / ${room.original.height ?? 3}` }}>
                <div className="il-cinema-layers" style={{ transform: reduced ? 'none' : `scale(${1 + progress * 0.00035})` }}>
                  <img className="il-scene-image" src={room.original.src} alt={room.original.alt}
                    width={room.original.width ?? 1600} height={room.original.height ?? 1200} loading="lazy" aria-hidden={visibleProgress === 100} />
                  <img className="il-scene-image" src={style.src} alt={style.alt}
                    width={room.original.width ?? 1600} height={room.original.height ?? 1200} loading="lazy"
                    style={{ opacity: visibleProgress / 100 }} aria-hidden={visibleProgress === 0} />
                </div>
                <div className="il-cinema-level" aria-hidden="true" style={{ top: `${100 - progress}%` }} />
              </div>
              <div className="il-cinema-caption">
                <span>{room.title} <i aria-hidden="true">/</i> {style.label}</span>
                <span data-testid="cinema-state">{visibleProgress === 0 ? 'Orijinal fotoğraf' : visibleProgress === 100 ? 'AI dekorasyon önerisi' : 'Orijinal → AI önerisi'}</span>
              </div>
              <div className="il-cinema-controls">
                <div className="il-range-label">
                  <label htmlFor="cinema-progress">Dönüşüm</label><output>{progress}%</output>
                  <button type="button" data-testid="cinema-mode" disabled={!ready || reduced || !fitsViewport}
                    aria-pressed={mode === 'scroll'} onClick={() => setMode(mode === 'scroll' ? 'manual' : 'scroll')}>
                    {mode === 'scroll' ? 'Kaydırma ile · durdur' : reduced ? 'Hareket azaltıldı · manuel' : !fitsViewport ? 'Manuel kontrol' : 'Kaydırma ile izle'}
                  </button>
                </div>
                <input id="cinema-progress" data-testid="cinema-progress" className="il-range"
                  type="range" min="0" max="100" value={progress} disabled={!ready}
                  aria-valuetext={`Yüzde ${progress} dekorasyon önerisi`}
                  onChange={(event) => chooseProgress(Number(event.target.value))} />
                {ready && imageStatus !== 'ready' && <p className="il-image-feedback" role="status">{imageStatus === 'error' ?
                  'Dekorasyon görseli yüklenemedi. Orijinal fotoğraf gösteriliyor; başka bir dekorasyon seçebilirsiniz.' :
                  'Dekorasyon görseli yükleniyor…'}</p>}
              </div>
            </div>
          </div>
          <p className="il-disclosure il-cinema-disclosure">{AI_NOTICE}. Görüntü geçişi, mevcut oda ile dekorasyon fikrini birleştirir; gerçek inşaat veya eşya yerleştirme kaydı değildir.</p>
        </div>
      </div>
    </section>
  );
}
