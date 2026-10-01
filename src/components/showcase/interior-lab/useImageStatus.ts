import { useEffect, useState } from 'react';

/** Preload the selected edit; discard late events when the visitor changes style. */
export default function useImageStatus(src: string) {
  const [result, setResult] = useState<{ src: string; status: 'ready' | 'error' }>();
  useEffect(() => {
    let active = true;
    const image = new Image();
    image.onload = () => { if (active) setResult({ src, status: 'ready' }); };
    image.onerror = () => { if (active) setResult({ src, status: 'error' }); };
    image.src = src;
    return () => { active = false; };
  }, [src]);
  return result?.src === src ? result.status : 'loading';
}
