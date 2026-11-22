import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LegalModal from './LegalModal.jsx';

export default function ExhibitionOverlay({ isOpen, onClose, identity, items = [] }) {
  const [activeLegal, setActiveLegal] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (activeLegal) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, activeLegal]);

  if (!isOpen) return null;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Exhibition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 bg-white text-ink overflow-y-auto flex flex-col justify-between"
    >
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 w-full px-6 sm:px-8 lg:px-10 pt-[max(1rem,env(safe-area-inset-top))] pb-3 bg-white/95 backdrop-blur-sm flex items-center justify-between border-b border-ink/10 shrink-0">
        <span className="font-display font-medium uppercase text-sm sm:text-base tracking-[0.02em]">
          Exhibition
        </span>
        <button
          type="button"
          onClick={onClose}
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

      {/* Overlapping Photo Cluster (Zero Captions, Direct Project Links) */}
      <div className="flex-1 w-full flex items-start md:items-center justify-center px-3 sm:px-8 lg:px-10 py-5 sm:py-10">
        {/* Desktop / Tablet Collage Canvas */}
        <div className="hidden md:block relative w-full max-w-[1200px] aspect-[1200/740]">
          {items.map((item, idx) => {
            const slot = item.collage || {
              left: (idx % 4) * 22 + 6,
              top: Math.floor(idx / 4) * 44 + 6,
              width: 22,
              zIndex: idx + 2,
            };

            return (
              <a
                key={item.id}
                href={`/projects/${item.slug}`}
                aria-label={`Open project ${item.title}`}
                style={{
                  left: `${slot.left}%`,
                  top: `${slot.top}%`,
                  width: `${slot.width}%`,
                  zIndex: slot.zIndex,
                }}
                className="group absolute block overflow-hidden bg-ink-tint hover:!z-30 focus-visible:!z-30 transition-transform duration-200 ease-out hover:scale-[1.018] cursor-pointer"
              >
                <img
                  src={item.src}
                  alt={item.title}
                  width={item.width}
                  height={item.height}
                  loading="eager"
                  decoding="async"
                  draggable={false}
                  className="block w-full h-auto object-cover"
                />
              </a>
            );
          })}
        </div>

        {/* Mobile Overlapping Collage Canvas */}
        <div className="md:hidden relative w-full max-w-[440px] aspect-[390/860]">
          {items.map((item, idx) => {
            const slot = item.mobileCollage || {
              left: idx % 2 === 0 ? 3 : 48,
              top: Math.floor(idx / 2) * 23 + 2,
              width: 50,
              zIndex: idx + 2,
            };

            return (
              <a
                key={item.id}
                href={`/projects/${item.slug}`}
                aria-label={`Open project ${item.title}`}
                style={{
                  left: `${slot.left}%`,
                  top: `${slot.top}%`,
                  width: `${slot.width}%`,
                  zIndex: slot.zIndex,
                }}
                className="absolute block overflow-hidden bg-ink-tint transition-transform duration-150 ease-out active:scale-[0.985] active:!z-30 focus-visible:!z-30 cursor-pointer"
              >
                <img
                  src={item.src}
                  alt={item.title}
                  width={item.width}
                  height={item.height}
                  loading={idx < 4 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                  className="block w-full h-auto object-cover"
                />
              </a>
            );
          })}
        </div>
      </div>

      {/* Subtle Legal Links */}
      <div className="w-full px-6 sm:px-8 lg:px-10 py-4 border-t border-ink/10 flex items-center justify-end gap-6 font-sans text-xs text-ink-muted/70 tracking-[0.12px] shrink-0">
        <button
          type="button"
          onClick={() => setActiveLegal('imprint')}
          className="inline-flex items-center min-h-[44px] hover:text-ink active:opacity-70 transition-colors cursor-pointer"
        >
          Imprint
        </button>
        <button
          type="button"
          onClick={() => setActiveLegal('privacy')}
          className="inline-flex items-center min-h-[44px] hover:text-ink active:opacity-70 transition-colors cursor-pointer"
        >
          Privacy Policy
        </button>
      </div>

      <LegalModal
        activeLegal={activeLegal}
        onClose={() => setActiveLegal(null)}
        identity={identity}
      />
    </motion.div>
  );
}
