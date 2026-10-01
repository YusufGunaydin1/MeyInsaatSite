import { useRef, useState, type PointerEvent } from 'react';
import RoomControls, { useInteriorSelection } from './RoomControls';
import { AI_NOTICE, type InteriorProps } from './types';
import useImageStatus from './useImageStatus';

export default function ComparisonStudio({ rooms }: InteriorProps) {
  const { room, style, ready, setRoomId, setStyleId } = useInteriorSelection(rooms);
  const [split, setSplit] = useState(50);
  const range = useRef<HTMLInputElement>(null);
  const imageStatus = useImageStatus(style.src);

  function moveDivider(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setSplit(Math.round(Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100))));
  }

  return (
    <section className="il-comparison container-site il-section" data-testid="compare-lab" aria-labelledby="compare-heading">
      <div className="il-section-head">
        <div>
          <p className="t-tech il-eyebrow">01 / İki hâli yan yana</p>
          <h2 className="t-display-l" id="compare-heading">Aynı oda. Başka bir ihtimal.</h2>
          <p className="il-intro">Çizgiyi kaydırın; mevcut mekân ile eşyalı dekorasyon önerisini karşılaştırın.</p>
        </div>
        <RoomControls rooms={rooms} room={room} styleId={style.id} ready={ready}
          onRoom={setRoomId} onStyle={setStyleId} prefix="compare" />
      </div>
      <div className="il-image-legend" aria-hidden="true">
        <span><i /> Orijinal fotoğraf</span><span><i /> {style.label} · AI önerisi</span>
      </div>
      <div className="il-compare-stage" data-testid="comparison-stage"
        style={{ aspectRatio: `${room.original.width ?? 4} / ${room.original.height ?? 3}` }}
        onPointerDown={(event) => {
          if (!ready || imageStatus !== 'ready' || event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          range.current?.focus({ preventScroll: true });
          moveDivider(event);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) moveDivider(event);
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}>
        <img className="il-scene-image" src={room.original.src} alt={room.original.alt}
          width={room.original.width ?? 1600} height={room.original.height ?? 1200} loading="lazy" draggable={false}
          aria-hidden={split === 0 && imageStatus === 'ready'} />
        <img className="il-scene-image il-compare-furnished" src={style.src} alt={style.alt}
          width={room.original.width ?? 1600} height={room.original.height ?? 1200} loading="lazy" draggable={false}
          style={{ clipPath: `inset(0 0 0 ${split}%)`, visibility: imageStatus === 'error' ? 'hidden' : 'visible' }}
          aria-hidden={split === 100 || imageStatus === 'error'} />
        <div className="il-compare-divider" style={{ left: `${split}%` }} aria-hidden="true">
          <span>‹ <i /> ›</span>
        </div>
      </div>
      <div className="il-comparison-controls">
        <label className="il-range-label" htmlFor="comparison-range">
          <span>Karşılaştırma çizgisi</span><output>{split}% orijinal</output>
        </label>
        <input ref={range} id="comparison-range" data-testid="comparison-range" className="il-range"
          type="range" min="0" max="100" value={split} disabled={!ready || imageStatus !== 'ready'}
          aria-valuetext={`Yüzde ${split} orijinal, yüzde ${100 - split} dekorasyon önerisi`}
          onChange={(event) => setSplit(Number(event.target.value))} />
        <div className="il-range-ends"><span>Tamamen eşyalı</span><span>Tamamen orijinal</span></div>
        {ready && imageStatus !== 'ready' && <p className="il-image-feedback" role="status">{imageStatus === 'error' ?
          'Dekorasyon görseli yüklenemedi. Orijinal fotoğraf gösteriliyor; başka bir dekorasyon seçebilirsiniz.' :
          'Dekorasyon görseli yükleniyor…'}</p>}
      </div>
      <div className="il-comparison-footer">
        <p><strong>{room.title}</strong> <span>{style.description}</span></p>
        <p className="il-disclosure">{AI_NOTICE}. Mobilyalar satış kapsamını göstermez.</p>
      </div>
    </section>
  );
}
