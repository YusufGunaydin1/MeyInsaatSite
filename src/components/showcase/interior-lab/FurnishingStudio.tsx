import { useState } from 'react';
import { useInteriorSelection } from './RoomControls';
import { AI_NOTICE, type InteriorProps } from './types';
import useImageStatus from './useImageStatus';

export default function FurnishingStudio({ rooms }: InteriorProps) {
  const { room, style, ready, setRoomId, setStyleId } = useInteriorSelection(rooms);
  const [furnished, setFurnished] = useState(false);
  const imageStatus = useImageStatus(style.src);
  const loaded = imageStatus === 'ready';
  const failed = imageStatus === 'error';

  return (
    <section className="il-configurator il-section" data-testid="furnishing-lab" aria-labelledby="furnishing-heading">
      <div className="container-site">
        <div className="il-section-head">
          <div>
            <p className="t-tech il-eyebrow">02 / Yaşam senaryosu</p>
            <h2 className="t-display-l" id="furnishing-heading">Kendi evinizi hayal edin.</h2>
            <p className="il-intro">Mekânı seçin, bir yaklaşımı deneyin. Tek dokunuşla gerçek fotoğrafa dönün.</p>
          </div>
          <p className="il-edition t-tech">2 mekân<br />2 dekorasyon yaklaşımı</p>
        </div>
        <div className="il-config-grid">
          <div className="il-config-visual">
            <div className="il-config-image" style={{ aspectRatio: `${room.original.width ?? 4} / ${room.original.height ?? 3}` }}>
              <img className="il-scene-image" src={room.original.src} alt={room.original.alt}
                width={room.original.width ?? 1600} height={room.original.height ?? 1200} loading="lazy" aria-hidden={furnished && loaded} />
              <img className="il-scene-image il-furnished-layer" src={style.src} alt={style.alt}
                width={room.original.width ?? 1600} height={room.original.height ?? 1200} loading="lazy"
                style={{ opacity: furnished && loaded ? 1 : 0 }} aria-hidden={!furnished || !loaded} />
              <span className="il-image-status">{furnished && loaded ? 'AI dekorasyon önerisi' : 'Orijinal fotoğraf'}</span>
            </div>
            <div className="il-visual-caption">
              <div><span className="t-tech">Seçili mekân</span><h3>{room.title}</h3></div>
              <p>{room.description}</p>
            </div>
          </div>
          <div className="il-config-panel">
            <fieldset className="il-room-picker" disabled={!ready}>
              <legend className="t-tech">01 — Mekânı seçin</legend>
              <div className="il-room-options">
                {rooms.map((item) => (
                  <button type="button" key={item.id} aria-pressed={room.id === item.id}
                    data-testid={`furnishing-room-${item.id}`} onClick={() => setRoomId(item.id)}>
                    <img src={item.original.src} alt="" loading="lazy" width="144" height="108" />
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="il-toggle-row">
              <div><span className="t-tech">02 — Görünüm</span><p>Eşyalı görünüm</p></div>
              <button type="button" role="switch" aria-checked={furnished} aria-label="Eşyalı görünüm"
                className="il-switch" data-testid="furnishing-toggle" disabled={!ready}
                onClick={() => setFurnished((current) => !current)}>
                <span className="il-switch-track"><i /></span><span>{furnished ? 'Açık' : 'Kapalı'}</span>
              </button>
            </div>
            <fieldset className="il-style-picker" disabled={!ready}>
              <legend className="t-tech">03 — Dekorasyonu deneyin</legend>
              {room.styles.map((item, index) => (
                <button key={item.id} type="button" aria-pressed={style.id === item.id}
                  data-testid={`furnishing-style-${item.id}`} onClick={() => { setStyleId(item.id); setFurnished(true); }}>
                  <span className="il-style-number t-tech">0{index + 1}</span>
                  <span><strong>{item.label}</strong><span>{item.description}</span></span>
                  <span className="il-style-check" aria-hidden="true">{style.id === item.id ? '✓' : '+'}</span>
                </button>
              ))}
            </fieldset>
            <p className="il-config-state" aria-live="polite" data-testid="furnishing-status">
              {!furnished ? 'Mevcut mekânın gerçek fotoğrafını görüyorsunuz.' : failed ?
                'Dekorasyon görseli yüklenemedi. Orijinal fotoğraf gösteriliyor.' : !loaded ?
                'Dekorasyon görseli yükleniyor…' : `${style.label} · Eşyalı dekorasyon önerisi gösteriliyor.`}
            </p>
            <p className="il-disclosure">{AI_NOTICE}. Renk, eşya ve yerleşim seçimleri fikir vermek içindir; teslimat veya ölçü taahhüdü değildir.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
