import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string;
  srcSet?: string;
  priority?: boolean;
  rootSelector?: string;
  rootMargin?: string;
}

/**
 * Native lazy-loading treats every image in a horizontal rail as visible.
 * This keeps the real URL off the element until it approaches its viewport.
 */
export default function DeferredImage({
  src,
  srcSet,
  priority = false,
  rootSelector,
  rootMargin = '240px 0px',
  ...props
}: Props) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [active, setActive] = useState(priority);
  const shouldLoad = active || priority;

  useEffect(() => {
    if (shouldLoad) return;

    const image = imageRef.current;
    if (!image || !('IntersectionObserver' in window)) {
      setActive(true);
      return;
    }

    const root = rootSelector ? image.closest(rootSelector) : null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setActive(true);
        observer.disconnect();
      },
      { root, rootMargin, threshold: 0.01 }
    );

    observer.observe(image);
    return () => observer.disconnect();
  }, [rootMargin, rootSelector, shouldLoad]);

  return (
    <img
      {...props}
      ref={imageRef}
      src={shouldLoad ? src : undefined}
      srcSet={shouldLoad ? srcSet : undefined}
      data-image-state={shouldLoad ? 'requested' : 'deferred'}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'low'}
    />
  );
}
