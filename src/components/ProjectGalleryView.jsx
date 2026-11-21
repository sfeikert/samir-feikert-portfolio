import { useCallback, useEffect, useRef, useState } from 'react';
import HeaderBar from './HeaderBar.jsx';
import MinimalFooter from './MinimalFooter.jsx';

function formatCounter(num) {
  return String(num).padStart(2, '0');
}

export default function ProjectGalleryView({ identity, project, exhibitionItems }) {
  const images = project?.images?.length
    ? project.images
    : [
        {
          src: project?.src || '/media/placeholder-black.svg',
          type: 'image',
          aspect: project?.aspect || '3 / 4',
        },
      ];

  const total = images.length;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slideParam = params.get('slide');
    if (slideParam !== null) {
      const parsed = parseInt(slideParam, 10);
      if (!Number.isNaN(parsed) && parsed >= 0 && parsed < total) {
        setCurrentIndex(parsed);
      }
    }
  }, [total]);

  const gridSectionRef = useRef(null);
  const pointerRef = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    isDown: false,
  });

  const goNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation (ArrowRight -> next, ArrowLeft -> prev, Escape -> back to start page)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.body.style.overflow === 'hidden') return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') {
        window.location.href = '/';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  // Preload & pre-decode adjacent images in memory for zero-flicker click-through
  useEffect(() => {
    if (total <= 1) return;
    const indicesToPreload = [
      (currentIndex + 1) % total,
      (currentIndex + 2) % total,
      (currentIndex - 1 + total) % total,
    ];

    indicesToPreload.forEach((idx) => {
      const item = images[idx];
      if (item && item.type !== 'video' && item.src) {
        const preload = new Image();
        preload.decoding = 'sync';
        preload.src = item.src;
        if (typeof preload.decode === 'function') {
          preload.decode().catch(() => {});
        }
      }
    });
  }, [currentIndex, images, total]);

  const handleStagePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    pointerRef.current.isDown = true;
    pointerRef.current.startX = e.clientX;
    pointerRef.current.startY = e.clientY;
    pointerRef.current.lastX = e.clientX;
    pointerRef.current.lastY = e.clientY;
  };

  const handleStagePointerMove = (e) => {
    if (!pointerRef.current.isDown) return;
    pointerRef.current.lastX = e.clientX;
    pointerRef.current.lastY = e.clientY;
  };

  const handleStagePointerCancel = () => {
    if (!pointerRef.current.isDown) return;
    pointerRef.current.isDown = false;

    const dx = pointerRef.current.lastX - pointerRef.current.startX;
    const dy = pointerRef.current.lastY - pointerRef.current.startY;

    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.1) {
      if (dx < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  const handleStagePointerUp = (e) => {
    if (!pointerRef.current.isDown) return;
    pointerRef.current.isDown = false;

    const endX = e.clientX ?? pointerRef.current.lastX;
    const endY = e.clientY ?? pointerRef.current.lastY;
    const dx = endX - pointerRef.current.startX;
    const dy = endY - pointerRef.current.startY;

    // Horizontal swipe on touch/trackpad
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.1) {
      if (dx < 0) {
        goNext();
      } else {
        goPrev();
      }
      return;
    }

    // Ignore if user scrolled/dragged vertically
    if (Math.abs(dy) > 14) return;

    // Click / tap: left 35% of stage goes back, right 65% advances to next photo
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = endX - rect.left;
    if (relX < rect.width * 0.35) {
      goPrev();
    } else {
      goNext();
    }
  };

  const handleSelectFromGrid = (idx) => {
    setCurrentIndex(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToGrid = () => {
    gridSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const currentMedia = images[currentIndex] || images[0];

  return (
    <div className="min-h-screen w-full bg-white text-ink select-none">
      {/* =====================================================================
          1. TOP FULL-VIEWPORT SLIDESHOW STAGE (Click Through 1 by 1)
         ===================================================================== */}
      <section className="relative h-dvh min-h-[540px] w-full flex flex-col justify-between overflow-hidden">
        <HeaderBar identity={identity} showBackLink exhibitionItems={exhibitionItems} />

        {/* Main Interactive Single-Image Stage (Click or Swipe to Step Through — Zero White Flash) */}
        <main
          id="main-content"
          onPointerDown={handleStagePointerDown}
          onPointerMove={handleStagePointerMove}
          onPointerUp={handleStagePointerUp}
          onPointerCancel={handleStagePointerCancel}
          title="Click to step through images"
          style={{ touchAction: 'pan-y' }}
          className="relative flex-1 w-full flex items-center justify-center px-6 sm:px-12 lg:px-20 overflow-hidden cursor-pointer"
        >
          {images.map((media, idx) => {
            const isCurrent = idx === currentIndex;
            const isNeighbor =
              total > 1 &&
              (idx === (currentIndex + 1) % total ||
                idx === (currentIndex + 2) % total ||
                idx === (currentIndex - 1 + total) % total);

            if (!isCurrent && !isNeighbor) return null;

            const mediaAutoAspect = !media.aspect || media.aspect === 'auto';

            return (
              <div
                key={`${media.src}-${idx}`}
                aria-hidden={!isCurrent}
                className={
                  isCurrent
                    ? 'relative z-10 opacity-100 flex items-center justify-center max-w-full max-h-full'
                    : 'absolute inset-0 z-0 opacity-0 pointer-events-none flex items-center justify-center px-6 sm:px-12 lg:px-20'
                }
              >
                {mediaAutoAspect ? (
                  media.type === 'video' ? (
                    <video
                      src={media.src}
                      poster={media.poster}
                      width={media.width || 1080}
                      height={media.height || 1350}
                      muted
                      loop
                      autoPlay={isCurrent}
                      playsInline
                      preload="auto"
                      onLoadedMetadata={(e) => {
                        e.currentTarget.muted = true;
                        e.currentTarget.defaultMuted = true;
                        if (isCurrent) {
                          e.currentTarget.play().catch(() => {});
                        }
                      }}
                      className="max-h-[66dvh] sm:max-h-[74dvh] max-w-[88vw] sm:max-w-[80vw] w-auto h-auto object-contain pointer-events-none"
                    />
                  ) : (
                    <img
                      src={media.src}
                      alt={isCurrent ? `${project.label || 'Project'} — ${idx + 1}` : ''}
                      width={media.width || 1080}
                      height={media.height || 1350}
                      loading="eager"
                      decoding="sync"
                      draggable={false}
                      className="max-h-[66dvh] sm:max-h-[74dvh] max-w-[88vw] sm:max-w-[80vw] w-auto h-auto object-contain pointer-events-none"
                    />
                  )
                ) : (
                  <div
                    style={{ aspectRatio: media.aspect }}
                    className="max-h-[66dvh] sm:max-h-[74dvh] max-w-[88vw] sm:max-w-[80vw] h-[64dvh] sm:h-[72dvh] w-auto overflow-hidden bg-ink-tint pointer-events-none"
                  >
                    {media.type === 'video' ? (
                      <video
                        src={media.src}
                        poster={media.poster}
                        muted
                        loop
                        autoPlay={isCurrent}
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={media.src}
                        alt={isCurrent ? `${project.label || 'Project'} — ${idx + 1}` : ''}
                        loading="eager"
                        decoding="sync"
                        draggable={false}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </main>

        {/* Bottom Bar of the Stage: Project Title, Step Counter & Scroll-Down Trigger */}
        <div className="relative z-30 w-full px-6 sm:px-8 lg:px-10 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-5 flex items-center justify-between gap-4 shrink-0">
          {/* Left: Project Title */}
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-sans font-normal text-sm sm:text-[0.95rem] tracking-[0.12px] text-ink truncate">
              {project.label}
            </h1>
            {currentMedia.caption && (
              <span className="hidden md:inline font-sans text-xs text-ink-muted tracking-[0.12px] truncate">
                — {currentMedia.caption}
              </span>
            )}
          </div>

          {/* Center: Scroll-Down Chevron to All Images Grid (44x44px hit target) */}
          <button
            type="button"
            onClick={handleScrollToGrid}
            aria-label="Scroll down to view all project images"
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-ink hover:text-ink-muted active:opacity-70 transition-colors cursor-pointer"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 13 8"
              className="w-4 h-2.5 fill-none stroke-current"
              strokeWidth="1.2"
            >
              <path d="M0.5 0.5L6.5 6.5L12.5 0.5" />
            </svg>
          </button>

          {/* Right: Prev / Counter / Next Controls (44x44px hit targets) */}
          <div className="flex items-center gap-1 sm:gap-2 font-sans text-xs tracking-[0.12px] text-ink shrink-0 -mr-2.5">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-ink-muted hover:text-ink active:opacity-70 transition-colors cursor-pointer"
            >
              ←
            </button>
            <span className="tabular-nums min-w-[3.5rem] text-center">
              {formatCounter(currentIndex + 1)} / {formatCounter(total)}
            </span>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-ink-muted hover:text-ink active:opacity-70 transition-colors cursor-pointer"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. BELOW THE FOLD: ALL IMAGES OF THIS SERIES (Click to Jump to Image)
         ===================================================================== */}
      <section
        ref={gridSectionRef}
        id="project-grid"
        className="w-full px-6 sm:px-8 lg:px-10 pt-12 sm:pt-20 pb-16 sm:pb-24 border-t border-ink/10"
      >
        <div className="mb-10 sm:mb-14 flex items-center justify-between font-sans text-xs tracking-[0.12px] text-ink-muted">
          <span className="uppercase">{project.label}</span>
          <span className="tabular-nums">{formatCounter(total)} Works</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-10 sm:gap-y-14 items-center">
          {images.map((item, idx) => {
            const isSelected = idx === currentIndex;

            return (
              <button
                key={`grid-${item.src}-${idx}`}
                type="button"
                onClick={() => handleSelectFromGrid(idx)}
                aria-label={`View work ${idx + 1} of ${total}`}
                aria-current={isSelected ? 'true' : undefined}
                className="group w-full text-left flex flex-col items-center cursor-pointer active:opacity-80 transition-opacity"
              >
                <div className="relative w-full flex items-center justify-center overflow-hidden">
                  {item.type === 'video' ? (
                    <video
                      src={item.src}
                      poster={item.poster}
                      width={item.width || 1080}
                      height={item.height || 1350}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                      className="w-full h-auto max-h-[42vh] object-contain transition-opacity duration-200 group-hover:opacity-85"
                    />
                  ) : (
                    <img
                      src={item.src}
                      alt={`${project.label || 'Project'} — ${idx + 1}`}
                      width={item.width || 1080}
                      height={item.height || 1350}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="w-full h-auto max-h-[42vh] object-contain transition-opacity duration-200 group-hover:opacity-85"
                    />
                  )}
                </div>

                <div
                  className={`mt-2.5 w-full flex items-center justify-between font-sans text-[11px] tracking-[0.12px] transition-colors ${
                    isSelected ? 'text-ink font-medium' : 'text-ink-muted group-hover:text-ink'
                  }`}
                >
                  <span className="tabular-nums">{formatCounter(idx + 1)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <MinimalFooter identity={identity} showBackLink />
    </div>
  );
}
