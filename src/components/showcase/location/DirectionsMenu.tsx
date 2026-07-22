import { useEffect, useId, useRef, useState } from 'react';
import type { DirectionsItem } from '../../../lib/projectLocations';

interface Props {
  /** Provider targets, in display order (Google · Yandex · Apple). */
  items: DirectionsItem[];
  /** One-tap target for the primary segment in the `split` layout. */
  primaryHref: string;
  /** `split` = one-tap primary + disclosure caret; `menu` = single button reveals all three. */
  layout?: 'split' | 'menu';
  /** `light` for pages on paper, `dark` for the night dossier. */
  tone?: 'light' | 'dark';
  size?: 'md' | 'sm';
  /** Flip the popover above the trigger (use inside a modal foot / near a bottom edge). */
  openUp?: boolean;
  label?: string;
  testid?: string;
}

function NavIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 11 21 3l-8 18-2-7-8-3Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const SUB: Record<DirectionsItem['kind'], string> = {
  directions: 'Yol tarifi',
  map: 'Harita pini',
};

export default function DirectionsMenu({
  items,
  primaryHref,
  layout = 'split',
  tone = 'light',
  size = 'md',
  openUp = false,
  label = 'Yol tarifi',
  testid,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);
  const hoverable = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

  useEffect(() => {
    hoverable.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  // Close on outside pointer / Escape — pointer covers touch + mouse.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const clearClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  // Hover is an enhancement only — never a requirement (touch has no hover).
  const onEnter = () => {
    if (!hoverable.current) return;
    clearClose();
    setOpen(true);
  };
  const onLeave = () => {
    if (!hoverable.current) return;
    clearClose();
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  const focusFirst = () => requestAnimationFrame(() => firstItemRef.current?.focus());

  // A click on a hover-capable pointer is always preceded by mouseenter (which
  // already opened the menu), so toggling here would immediately close it. On
  // those devices click only *opens* — hover-leave / Escape / outside-tap close.
  // Touch (no hover) keeps the expected tap-to-toggle.
  const activate = () => {
    clearClose();
    if (hoverable.current) {
      setOpen(true);
      focusFirst();
      return;
    }
    setOpen((value) => {
      const next = !value;
      if (next) focusFirst();
      return next;
    });
  };

  return (
    <div
      ref={rootRef}
      className="km-dir"
      data-layout={layout}
      data-tone={tone}
      data-size={size}
      data-openup={openUp ? 'true' : 'false'}
      data-open={open ? 'true' : 'false'}
      data-testid={testid}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="km-dir-bar">
        {layout === 'split' ? (
          <>
            <a
              className="km-dir-primary"
              href={primaryHref}
              target="_blank"
              rel="noopener"
              data-testid={testid ? `${testid}-primary` : undefined}
            >
              <NavIcon />
              <span>{label}</span>
            </a>
            <button
              ref={triggerRef}
              type="button"
              className="km-dir-toggle"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label="Diğer harita sağlayıcıları"
              data-testid={testid ? `${testid}-toggle` : undefined}
              onClick={activate}
            >
              <ChevronIcon />
            </button>
          </>
        ) : (
          <button
            ref={triggerRef}
            type="button"
            className="km-dir-single"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={menuId}
            data-testid={testid ? `${testid}-toggle` : undefined}
            onClick={activate}
          >
            <NavIcon />
            <span>{label}</span>
            <ChevronIcon />
          </button>
        )}
      </div>

      <div
        id={menuId}
        className="km-dir-pop"
        role="menu"
        aria-label="Harita sağlayıcıları"
        hidden={!open}
      >
        {items.map((item, index) => (
          <a
            key={item.name}
            ref={index === 0 ? firstItemRef : undefined}
            role="menuitem"
            className="km-dir-item"
            href={item.href}
            target="_blank"
            rel="noopener"
            data-testid={testid ? `${testid}-${item.name.toLowerCase()}` : undefined}
          >
            <span className="km-dir-item-name">{item.name}</span>
            <span className="km-dir-item-sub t-tech">{SUB[item.kind]}</span>
            <span className="km-dir-item-go" aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}
