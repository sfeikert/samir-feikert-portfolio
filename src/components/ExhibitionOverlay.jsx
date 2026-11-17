import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LegalModal from './LegalModal.jsx';

function formatCounter(num) {
  return String(num).padStart(2, '0');
}

export default function ExhibitionOverlay({ isOpen, onClose, identity, items = [] }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeLegal, setActiveLegal] = useState(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const activeSlides = selectedItem?.images?.length
    ? selectedItem.images
    : selectedItem
      ? [{ src: selectedItem.src, type: 'image', width: selectedItem.width, height: selectedItem.height }]
      : [];
  const totalSlides = activeSlides.length;
  const currentSlide = activeSlides[slideIndex] || activeSlides[0];

  const goNext = useCallback(() => {
    if (totalSlides <= 1) return;
    setSlideIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    if (totalSlides <= 1) return;
    setSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (activeLegal) return;
      if (selectedItem) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          goNext();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goPrev();
        } else if (e.key === 'Escape') {
          setSelectedItem(null);
        }
        return;
      }
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
  }, [isOpen, onClose, selectedItem, activeLegal, goNext, goPrev]);

  useEffect(() => {
    if (!selectedItem || totalSlides <= 1) return;
    const neighbors = [
      (slideIndex + 1) % totalSlides,
      (slideIndex - 1 + totalSlides) % totalSlides,
    ];
    neighbors.forEach((idx) => {
      const slide = activeSlides[idx];
      if (slide?.src && slide.type !== 'video') {
        const img = new Image();
        img.src = slide.src;
      }
    });
  }, [selectedItem, slideIndex, totalSlides, activeSlides]);

  if (!isOpen) return null;

  const openSeries = (item) => {
    setSelectedItem(item);
    setSlideIndex(0);
  };

  const handleStageClick = (e) => {
    if (totalSlides <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX - rect.left < rect.width * 0.35) {
      goPrev();
    } else {
      goNext();
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e) => {
    if (totalSlides <= 1 || !e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.1) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  return (
    <>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Exhibition & Archive"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 bg-white text-ink overflow-y-auto"
      >
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-10 w-full px-6 sm:px-8 lg:px-10 pt-[max(1rem,env(safe-area-inset-top))] pb-4 bg-white/95 backdrop-blur-sm flex items-center justify-between border-b border-ink/10">
          <div className="flex items-center gap-4">
            <span className="font-display font-medium uppercase text-sm sm:text-base tracking-[0.02em]">
              Exhibition & Archive
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="inline-flex items-center justify-center min-h-[44px] px-3 -mr-3 font-sans font-normal text-xs uppercase tracking-[0.12px] text-ink-muted hover:text-ink active:opacity-70 transition-colors cursor-pointer"
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
            Klick auf eine Serie zum Öffnen
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
                <button
                  type="button"
                  onClick={() => openSeries(item)}
                  className="group cursor-pointer block w-full text-left active:opacity-85 transition-opacity"
                >
                  <div
                    style={{ aspectRatio: item.aspect || '3 / 4' }}
                    className="w-full overflow-hidden bg-ink-tint relative border border-ink/10"
                  >
                    <img
                      src={item.src}
                      alt={item.title}
                      width={item.width}
                      height={item.height}
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
                      {item.location && (
                        <p className="text-ink-muted text-[11px] tracking-[0.12px] mt-0.5">
                          {item.location}
                        </p>
                      )}
                    </div>

                    <div className="text-right text-ink-muted text-[11px] font-mono tracking-tight shrink-0">
                      <span>{item.count}</span>
                      {item.year && (
                        <span className="block text-[10px] text-ink-muted/70">{item.year}</span>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Subtle Legal Links */}
          <div className="mt-24 pt-6 border-t border-ink/10 flex items-center justify-end gap-6 font-sans text-xs text-ink-muted/70 tracking-[0.12px]">
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
        </div>

        <LegalModal
          activeLegal={activeLegal}
          onClose={() => setActiveLegal(null)}
          identity={identity}
        />
      </motion.div>

      {/* Lightbox / Multi-Image Series Slideshow */}
      <AnimatePresence>
        {selectedItem && currentSlide && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={selectedItem.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedItem(null)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="fixed inset-0 z-[60] bg-white/96 backdrop-blur-[3px] p-6 sm:p-12 flex flex-col items-center justify-center cursor-zoom-out select-none"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-h-[86vh] max-w-[92vw] flex flex-col items-center cursor-default"
            >
              <div
                onClick={handleStageClick}
                className={`flex items-center justify-center ${
                  totalSlides > 1 ? 'cursor-pointer' : ''
                }`}
              >
                <img
                  src={currentSlide.src}
                  alt={`${selectedItem.title} — ${slideIndex + 1}`}
                  draggable={false}
                  className="max-h-[76vh] max-w-[90vw] object-contain shadow-sm border border-ink/10 pointer-events-none"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 w-full font-sans text-xs text-ink tracking-[0.12px]">
                <div className="font-display font-medium uppercase tracking-[0.02em]">
                  {selectedItem.title}
                  {selectedItem.location ? ` — ${selectedItem.location}` : ''}
                  {selectedItem.year ? ` (${selectedItem.year})` : ''}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  {totalSlides > 1 && (
                    <div className="flex items-center gap-1 text-ink">
                      <button
                        type="button"
                        onClick={goPrev}
                        aria-label="Previous work"
                        className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-ink-muted hover:text-ink active:opacity-70 transition-colors cursor-pointer"
                      >
                        ←
                      </button>
                      <span className="tabular-nums min-w-[3.5rem] text-center">
                        {formatCounter(slideIndex + 1)} / {formatCounter(totalSlides)}
                      </span>
                      <button
                        type="button"
                        onClick={goNext}
                        aria-label="Next work"
                        className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-ink-muted hover:text-ink active:opacity-70 transition-colors cursor-pointer"
                      >
                        →
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="inline-flex items-center min-h-[44px] px-2 -mr-2 text-ink-muted hover:text-ink active:opacity-70 uppercase tracking-wider text-[11px] cursor-pointer"
                  >
                    Schließen ×
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
