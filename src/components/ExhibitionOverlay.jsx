import { useCallback, useEffect, useRef, useState } from 'react';
import { exhibitionItems as defaultExhibitionItems } from '../data/projects.js';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) =>
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-hidden') !== 'true' &&
      el.getClientRects().length > 0
  );
}

function ExhibitionVideo({ item, isEager }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const posterSrc = item.posterWebp || item.poster;

  return (
    <div
      style={
        item.width && item.height
          ? { aspectRatio: `${item.width} / ${item.height}` }
          : undefined
      }
      className="relative w-full overflow-hidden"
    >
      {posterSrc && (
        <img
          src={posterSrc}
          alt=""
          width={item.width}
          height={item.height}
          loading={isEager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          className="block w-full h-auto object-cover pointer-events-none"
        />
      )}
      <video
        src={item.src}
        poster={posterSrc}
        width={item.width}
        height={item.height}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => {
          const vid = e.currentTarget;
          vid.muted = true;
          vid.defaultMuted = true;
          if (vid.getClientRects().length > 0) {
            vid.play().catch(() => {});
          }
        }}
        onPlaying={() => setIsPlaying(true)}
        className={`block w-full pointer-events-none transition-opacity duration-300 ${
          posterSrc
            ? `h-full object-cover absolute inset-0 ${isPlaying ? 'opacity-100' : 'opacity-0'}`
            : 'h-auto object-cover opacity-100'
        }`}
      >
        <track kind="captions" src="/media/silent.vtt" srcLang="de" label="Ohne Ton" default />
      </video>
    </div>
  );
}

function renderMedia(item, isEager) {
  if (item.type === 'video') {
    return <ExhibitionVideo item={item} isEager={isEager} />;
  }

  return (
    <img
      src={item.thumbSrc || item.src}
      srcSet={item.thumbSrcSet}
      sizes={item.thumbSrcSet ? '(min-width: 768px) 30vw, 62vw' : undefined}
      alt={item.title}
      width={item.width}
      height={item.height}
      loading={isEager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      className="block w-full h-auto object-cover"
    />
  );
}

export default function ExhibitionOverlay({ isOpen, onClose, items }) {
  const activeItems = items?.length ? items : defaultExhibitionItems;
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef(null);
  const closeButtonRef = useRef(null);
  const closeTimerRef = useRef(null);
  const isClosingRef = useRef(false);

  const requestClose = useCallback(() => {
    if (isClosingRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onClose();
      return;
    }
    isClosingRef.current = true;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      isClosingRef.current = false;
      onClose();
    }, 180);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
      isClosingRef.current = false;
      return;
    }

    const focusRaf = requestAnimationFrame(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus({ preventScroll: true });
      } else {
        overlayRef.current?.focus({ preventScroll: true });
      }
    });

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = getFocusableElements(overlayRef.current);
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey) {
          if (active === first || !overlayRef.current?.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last || !overlayRef.current?.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      cancelAnimationFrame(focusRaf);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, requestClose]);

  useEffect(() => {
    if (!isOpen) return;
    const container = overlayRef.current;
    if (!container) return;

    const videos = Array.from(container.querySelectorAll('video'));
    if (videos.length === 0) return;

    const playVideo = (vid) => {
      vid.muted = true;
      vid.defaultMuted = true;
      vid.playsInline = true;
      vid.play().catch(() => {});
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playVideo(entry.target);
          } else {
            entry.target.pause();
          }
        });
      },
      { root: container, rootMargin: '250px 0px' }
    );

    videos.forEach((vid) => {
      if (vid.getClientRects().length > 0) {
        playVideo(vid);
      }
      io.observe(vid);
    });

    return () => {
      io.disconnect();
      videos.forEach((vid) => vid.pause());
    };
  }, [isOpen, activeItems]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Exhibition"
      tabIndex={-1}
      className={`fixed inset-0 z-50 bg-white text-ink overflow-y-auto flex flex-col justify-between outline-none ${
        isClosing ? 'sf-fade-out pointer-events-none' : 'sf-fade-in'
      }`}
    >
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 w-full px-6 sm:px-8 lg:px-10 pt-[max(1rem,env(safe-area-inset-top))] pb-3 bg-white/95 backdrop-blur-sm flex items-center justify-between border-b border-ink/10 shrink-0">
        <span className="font-display font-medium uppercase text-sm sm:text-base tracking-[0.02em]">
          Exhibition
        </span>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={requestClose}
          aria-label="Schließen"
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-3 text-ink hover:text-ink-muted active:opacity-70 transition-colors cursor-pointer"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="w-3.5 h-3.5 fill-none stroke-current"
            strokeWidth="1.5"
          >
            <path d="M2 2L14 14M14 2L2 14" />
          </svg>
        </button>
      </div>

      {/* Continuous Irregular Overlapping Collage (Zero Captions, Direct Project Links) */}
      <div className="flex-1 w-full flex justify-center px-3 sm:px-8 lg:px-10 py-6 sm:py-10 lg:py-14">
        {/* Desktop / Tablet Continuous Collage Canvas */}
        <div className="hidden md:block relative w-full max-w-[1220px] aspect-[1220/1920]">
          {activeItems.map((item, idx) => {
            const slot = item.collage || {
              left: (idx % 4) * 23 + 3,
              top: Math.floor(idx / 4) * 20 + 2,
              width: 22,
              zIndex: (idx % 6) + 2,
            };

            return (
              <a
                key={item.id}
                href={`/projects/${item.slug}`}
                aria-label={`${item.title} öffnen`}
                draggable={false}
                style={{
                  left: `${slot.left}%`,
                  top: `${slot.top}%`,
                  width: `${slot.width}%`,
                  zIndex: slot.zIndex,
                }}
                className="sf-no-callout group absolute block overflow-hidden bg-ink-tint hover:!z-30 focus-visible:!z-30 transition-transform duration-200 ease-out hover:scale-[1.018] cursor-pointer"
              >
                {renderMedia(item, idx < 7)}
              </a>
            );
          })}
        </div>

        {/* Mobile Continuous Collage Canvas */}
        <div className="md:hidden relative w-full max-w-[440px] aspect-[390/2240]">
          {activeItems.map((item, idx) => {
            const slot = item.mobileCollage || {
              left: idx % 2 === 0 ? 3 : 48,
              top: idx * 5.6 + 1,
              width: 48,
              zIndex: (idx % 6) + 2,
            };

            return (
              <a
                key={item.id}
                href={`/projects/${item.slug}`}
                aria-label={`${item.title} öffnen`}
                draggable={false}
                style={{
                  left: `${slot.left}%`,
                  top: `${slot.top}%`,
                  width: `${slot.width}%`,
                  zIndex: slot.zIndex,
                }}
                className="sf-no-callout absolute block overflow-hidden bg-ink-tint transition-transform duration-150 ease-out active:scale-[0.985] active:!z-30 focus-visible:!z-30 cursor-pointer"
              >
                {renderMedia(item, idx < 6)}
              </a>
            );
          })}
        </div>
      </div>

      {/* Subtle Legal Links */}
      <div className="w-full px-6 sm:px-8 lg:px-10 py-4 border-t border-ink/10 flex items-center justify-end gap-6 font-sans text-xs text-ink-muted/70 tracking-[0.12px] shrink-0">
        <a
          href="/impressum"
          className="inline-flex items-center min-h-[44px] hover:text-ink active:opacity-70 transition-colors"
        >
          Impressum
        </a>
        <a
          href="/datenschutz"
          className="inline-flex items-center min-h-[44px] hover:text-ink active:opacity-70 transition-colors"
        >
          Datenschutz
        </a>
      </div>
    </div>
  );
}
