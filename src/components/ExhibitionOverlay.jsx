import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LegalModal from './LegalModal.jsx';

export default function ExhibitionOverlay({ isOpen, onClose, identity, items = [] }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeLegal, setActiveLegal] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedItem) {
          setSelectedItem(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, selectedItem]);

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 bg-white text-ink overflow-y-auto"
      >
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-10 w-full px-6 sm:px-8 lg:px-10 py-6 bg-white/95 backdrop-blur-sm flex items-center justify-between border-b border-ink/10">
          <div className="flex items-center gap-4">
            <span className="font-display font-medium uppercase text-sm sm:text-base tracking-[0.02em]">
              Exhibition & Archive
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="font-sans font-normal text-xs uppercase tracking-[0.12px] text-ink-muted hover:text-ink transition-colors cursor-pointer py-1 px-2 -mr-2"
          >
            Schließen ×
          </button>
        </div>

        {/* Intro Note */}
        <div className="px-6 sm:px-10 lg:px-12 pt-12 sm:pt-16 pb-4 max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.16px] text-ink-muted">
              Kuratorische Übersicht
            </p>
            <h2 className="font-display font-normal uppercase text-xl sm:text-2xl lg:text-3xl tracking-[-0.01em] mt-1">
              Ausstellungen & Freie Arbeiten
            </h2>
          </div>
          <p className="font-sans text-xs text-ink-muted tracking-[0.12px]">
            Klick auf ein Werk zum Vergrößern
          </p>
        </div>

        {/* Asymmetrical Terring-Inspired Collage Grid */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-16">
          <div className="grid grid-cols-12 gap-x-6 sm:gap-x-10 lg:gap-x-12 gap-y-16 sm:gap-y-24 items-start">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`${item.colSpan || 'col-span-12 sm:col-span-6'} ${item.offsetClass || ''}`}
              >
                {/* Media Card */}
                <div
                  onClick={() => setSelectedItem(item)}
                  className="group cursor-pointer block"
                >
                  <div
                    style={{ aspectRatio: item.aspect || '3 / 4' }}
                    className="w-full overflow-hidden bg-ink-tint relative border border-ink/10"
                  >
                    <img
                      src={item.src}
                      alt={item.title}
                      loading={idx < 4 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/15 transition-colors duration-200" />
                  </div>

                  {/* Terring-Style Caption & Numbering */}
                  <div className="mt-3.5 flex items-start justify-between gap-4 font-sans text-xs">
                    <div>
                      <h3 className="font-display font-medium uppercase tracking-[0.02em] text-ink text-sm sm:text-[0.9375rem] group-hover:text-ink-muted transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-ink-muted text-[11px] tracking-[0.12px] mt-0.5">
                        {item.location}
                      </p>
                    </div>

                    <div className="text-right text-ink-muted text-[11px] font-mono tracking-tight shrink-0">
                      <span>{item.count}</span>
                      <span className="block text-[10px] text-ink-muted/70">{item.year}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Subtle Legal Links */}
          <div className="mt-24 pt-8 border-t border-ink/10 flex items-center justify-end gap-6 font-sans text-xs text-ink-muted/70 tracking-[0.12px]">
            <button
              type="button"
              onClick={() => setActiveLegal('imprint')}
              className="hover:text-ink transition-colors cursor-pointer"
            >
              Imprint
            </button>
            <button
              type="button"
              onClick={() => setActiveLegal('privacy')}
              className="hover:text-ink transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>

        <LegalModal
          activeLegal={activeLegal}
          onClose={() => setActiveLegal(null)}
          identity={identity}
        />
      </motion.div>

      {/* Lightbox / Slideshow View */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-[60] bg-white/96 backdrop-blur-[3px] p-6 sm:p-12 flex flex-col items-center justify-center cursor-zoom-out"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-h-[82vh] max-w-[90vw] flex flex-col items-center"
            >
              <img
                src={selectedItem.src}
                alt={selectedItem.title}
                className="max-h-[76vh] max-w-[90vw] object-contain shadow-sm border border-ink/10"
              />
              <div className="mt-4 flex items-center justify-between w-full font-sans text-xs text-ink tracking-[0.12px]">
                <div className="font-display font-medium uppercase tracking-[0.02em]">
                  {selectedItem.title} — {selectedItem.location} ({selectedItem.year})
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="text-ink-muted hover:text-ink uppercase tracking-wider text-[11px] cursor-pointer ml-6"
                >
                  Schließen ×
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

