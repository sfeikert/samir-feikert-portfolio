import { useCallback, useEffect, useRef, useState } from 'react';
import HeaderBar from './HeaderBar.jsx';
import MinimalFooter from './MinimalFooter.jsx';

function formatCounter(num) {
  return String(num).padStart(2, '0');
}

function navigateBackToOverview() {
  if (window.history.length > 1 && document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      if (refUrl.origin === window.location.origin && refUrl.pathname === '/') {
        window.history.back();
        return;
      }
    } catch {
      // Fall through to root navigation
    }
  }
  window.location.href = '/';
}

const STAGE_AUTO_MEDIA_CLASS =
  'max-h-[66vh] sm:max-h-[74vh] supports-[height:100svh]:max-h-[66svh] sm:supports-[height:100svh]:max-h-[74svh] max-w-[88vw] sm:max-w-[80vw] w-auto h-auto object-contain pointer-events-none';

const STAGE_FIXED_BOX_CLASS =
  'relative max-h-[66vh] sm:max-h-[74vh] supports-[height:100svh]:max-h-[66svh] sm:supports-[height:100svh]:max-h-[74svh] max-w-[88vw] sm:max-w-[80vw] h-[64vh] sm:h-[72vh] supports-[height:100svh]:h-[64svh] sm:supports-[height:100svh]:h-[72svh] w-auto overflow-hidden bg-ink-tint pointer-events-none';

function StageVideo({ media, isCurrent, autoAspect }) {
  const videoRef = useRef(null);
  const posterSrc = media.posterWebp || media.poster;
  const [isPlaying, setIsPlaying] = useState(!posterSrc);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = true;
    vid.defaultMuted = true;
    vid.playsInline = true;

    if (isCurrent) {
      vid.play().catch(() => {});
      if (!vid.paused && vid.readyState >= 2) {
        setIsPlaying(true);
      }
    } else {
      vid.pause();
    }
  }, [isCurrent]);

  const width = media.width || 1080;
  const height = media.height || 1350;

  if (autoAspect) {
    if (!posterSrc) {
      return (
        <video
          ref={videoRef}
          src={media.src}
          width={width}
          height={height}
          muted
          loop
          autoPlay={isCurrent}
          playsInline
          preload={isCurrent ? 'auto' : 'metadata'}
          onPlaying={() => setIsPlaying(true)}
          className={STAGE_AUTO_MEDIA_CLASS}
        >
          <track kind="captions" src="/media/silent.vtt" srcLang="de" label="Ohne Ton" default />
        </video>
      );
    }

    return (
      <div className="relative flex items-center justify-center pointer-events-none">
        <img
          src={posterSrc}
          alt=""
          width={width}
          height={height}
          loading="eager"
          decoding="sync"
          draggable={false}
          className={STAGE_AUTO_MEDIA_CLASS}
        />
        <video
          ref={videoRef}
          src={media.src}
          poster={posterSrc}
          width={width}
          height={height}
          muted
          loop
          autoPlay={isCurrent}
          playsInline
          preload={isCurrent ? 'auto' : 'metadata'}
          onPlaying={() => setIsPlaying(true)}
          className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300 ${
            isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <track kind="captions" src="/media/silent.vtt" srcLang="de" label="Ohne Ton" default />
        </video>
      </div>
    );
  }

  return (
    <>
      {posterSrc && (
        <img
          src={posterSrc}
          alt=""
          loading="eager"
          decoding="sync"
          draggable={false}
          className="w-full h-full object-cover"
        />
      )}
      <video
        ref={videoRef}
        src={media.src}
        poster={posterSrc}
        muted
        loop
        autoPlay={isCurrent}
        playsInline
        preload={isCurrent ? 'auto' : 'metadata'}
        onPlaying={() => setIsPlaying(true)}
        className={`${posterSrc ? 'absolute inset-0 ' : ''}w-full h-full object-cover transition-opacity duration-300 ${
          isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <track kind="captions" src="/media/silent.vtt" srcLang="de" label="Ohne Ton" default />
      </video>
    </>
  );
}

export default function ProjectGalleryView({
  identity,
  project,
  exhibitionItems,
  nextProject = null,
}) {
  const images = project?.images?.length
    ? project.images
    : [
        {
          src: project?.src || '/media/placeholder-black.svg',
          stageSrc: project?.stageSrc,
          stageSrcSet: project?.stageSrcSet,
          gridSrc: project?.gridSrc,
          poster: project?.poster,
          posterWebp: project?.posterWebp,
          type: project?.type || 'image',
          aspect: project?.aspect || '3 / 4',
        },
      ];

  const total = images.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const [stageCursor, setStageCursor] = useState('pointer');

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

  useEffect(() => {
    setDragOffsetX(0);
    setIsTouchDragging(false);
  }, [currentIndex]);

  const gridSectionRef = useRef(null);
  const pointerRef = useRef({
    pointerId: null,
    pointerType: null,
    axis: null,
    maxAbsDx: 0,
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

  // Keyboard navigation (ArrowRight -> next, ArrowLeft -> prev, Escape -> smart back to start page)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.defaultPrevented || document.body.style.overflow === 'hidden') return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') {
        navigateBackToOverview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  // Preload & pre-decode adjacent stage WebP images in memory for zero-flicker click-through
  useEffect(() => {
    if (total <= 1) return;
    const indicesToPreload = [
      (currentIndex + 1) % total,
      (currentIndex + 2) % total,
      (currentIndex - 1 + total) % total,
    ];

    indicesToPreload.forEach((idx) => {
      const item = images[idx];
      const targetSrc = item?.stageSrc || item?.src;
      if (item && item.type !== 'video' && targetSrc) {
        const preload = new Image();
        preload.decoding = 'sync';
        if (item.stageSrcSet) {
          preload.sizes = '(min-width: 640px) 80vw, 88vw';
          preload.srcset = item.stageSrcSet;
        }
        preload.src = targetSrc;
        if (typeof preload.decode === 'function') {
          preload.decode().catch(() => {});
        }
      }
    });
  }, [currentIndex, images, total]);

  const updateDesktopCursor = (e) => {
    if (e.pointerType !== 'mouse') return;
    if (total <= 1) {
      setStageCursor((prev) => (prev === 'pointer' ? prev : 'pointer'));
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const nextCursor = e.clientX - rect.left < rect.width * 0.35 ? 'w-resize' : 'e-resize';
    setStageCursor((prev) => (prev === nextCursor ? prev : nextCursor));
  };

  const handleStagePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    updateDesktopCursor(e);
    pointerRef.current.isDown = true;
    pointerRef.current.pointerId = e.pointerId;
    pointerRef.current.pointerType = e.pointerType;
    pointerRef.current.axis = null;
    pointerRef.current.maxAbsDx = 0;
    pointerRef.current.startX = e.clientX;
    pointerRef.current.startY = e.clientY;
    pointerRef.current.lastX = e.clientX;
    pointerRef.current.lastY = e.clientY;
  };

  const handleStagePointerMove = (e) => {
    updateDesktopCursor(e);
    if (!pointerRef.current.isDown || pointerRef.current.pointerId !== e.pointerId) return;

    pointerRef.current.lastX = e.clientX;
    pointerRef.current.lastY = e.clientY;

    const dx = e.clientX - pointerRef.current.startX;
    const dy = e.clientY - pointerRef.current.startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > pointerRef.current.maxAbsDx) {
      pointerRef.current.maxAbsDx = absDx;
    }

    if (pointerRef.current.pointerType === 'touch' && total > 1) {
      if (!pointerRef.current.axis) {
        if (absDx < 8 && absDy < 8) return;
        pointerRef.current.axis = absDx > absDy * 1.1 ? 'x' : 'y';
        if (pointerRef.current.axis === 'x') {
          setIsTouchDragging(true);
        }
      }

      if (pointerRef.current.axis === 'x') {
        const damped = Math.max(-90, Math.min(90, dx * 0.38));
        setDragOffsetX(damped);
      }
    }
  };

  const handleStagePointerCancel = () => {
    if (!pointerRef.current.isDown) return;
    const { startX, startY, lastX, lastY } = pointerRef.current;
    pointerRef.current.isDown = false;
    pointerRef.current.axis = null;
    setIsTouchDragging(false);
    setDragOffsetX(0);

    const dx = lastX - startX;
    const dy = lastY - startY;

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
    const { axis, maxAbsDx, startX, startY, lastX, lastY } = pointerRef.current;
    pointerRef.current.isDown = false;
    pointerRef.current.axis = null;
    setIsTouchDragging(false);
    setDragOffsetX(0);

    const endX = e.clientX ?? lastX;
    const endY = e.clientY ?? lastY;
    const dx = endX - startX;
    const dy = endY - startY;

    // Horizontal swipe on touch/trackpad
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.1) {
      if (dx < 0) {
        goNext();
      } else {
        goPrev();
      }
      return;
    }

    // Ignore cancelled horizontal drag or vertical scroll gesture
    if ((axis === 'x' && maxAbsDx > 12) || Math.abs(dy) > 14) return;

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
      <section className="relative h-[100vh] supports-[height:100svh]:h-[100svh] min-h-[540px] w-full flex flex-col justify-between overflow-hidden">
        <HeaderBar identity={identity} showBackLink exhibitionItems={exhibitionItems} />

        {/* Main Interactive Single-Image Stage (Click or Swipe to Step Through — Zero White Flash) */}
        <main
          id="main-content"
          onPointerEnter={updateDesktopCursor}
          onPointerDown={handleStagePointerDown}
          onPointerMove={handleStagePointerMove}
          onPointerUp={handleStagePointerUp}
          onPointerCancel={handleStagePointerCancel}
          title="Klicken oder wischen zum Durchblättern"
          style={{
            touchAction: 'pan-y',
            cursor: total <= 1 ? 'pointer' : stageCursor,
          }}
          className="sf-no-callout relative flex-1 w-full flex items-center justify-center px-6 sm:px-12 lg:px-20 overflow-hidden"
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
            const stageImgSrc = media.stageSrc || media.src;
            const stageImgSizes = media.stageSrcSet ? '(min-width: 640px) 80vw, 88vw' : undefined;
            const slideAlt = isCurrent ? `${project.label || 'Projekt'} — ${idx + 1}` : '';

            return (
              <div
                key={`${media.src}-${idx}`}
                aria-hidden={!isCurrent}
                style={{
                  transform: `translate3d(${isCurrent ? dragOffsetX : 0}px, 0, 0)`,
                }}
                className={`${
                  isCurrent && isTouchDragging
                    ? 'transition-opacity'
                    : 'transition-[opacity,transform]'
                } duration-200 ease-out ${
                  isCurrent
                    ? 'relative z-10 opacity-100 flex items-center justify-center max-w-full max-h-full'
                    : 'absolute inset-0 z-0 opacity-0 pointer-events-none flex items-center justify-center px-6 sm:px-12 lg:px-20'
                }`}
              >
                {mediaAutoAspect ? (
                  media.type === 'video' ? (
                    <StageVideo media={media} isCurrent={isCurrent} autoAspect />
                  ) : (
                    <img
                      src={stageImgSrc}
                      srcSet={media.stageSrcSet}
                      sizes={stageImgSizes}
                      alt={slideAlt}
                      width={media.width || 1080}
                      height={media.height || 1350}
                      loading="eager"
                      decoding="sync"
                      draggable={false}
                      className={STAGE_AUTO_MEDIA_CLASS}
                    />
                  )
                ) : (
                  <div
                    style={{ aspectRatio: media.aspect }}
                    className={STAGE_FIXED_BOX_CLASS}
                  >
                    {media.type === 'video' ? (
                      <StageVideo media={media} isCurrent={isCurrent} autoAspect={false} />
                    ) : (
                      <img
                        src={stageImgSrc}
                        srcSet={media.stageSrcSet}
                        sizes={stageImgSizes}
                        alt={slideAlt}
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
            aria-label="Alle Bilder der Serie anzeigen"
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
              aria-label="Vorheriges Bild"
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-ink-muted hover:text-ink active:opacity-70 transition-colors cursor-pointer"
            >
              ←
            </button>
            <span
              aria-live="polite"
              aria-atomic="true"
              className="tabular-nums min-w-[3.5rem] text-center"
            >
              {formatCounter(currentIndex + 1)} / {formatCounter(total)}
            </span>
            <button
              type="button"
              onClick={goNext}
              aria-label="Nächstes Bild"
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
          <span className="tabular-nums">
            {total === 1 ? '01 Bild' : `${formatCounter(total)} Bilder`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-10 sm:gap-y-14 items-center">
          {images.map((item, idx) => {
            const isSelected = idx === currentIndex;

            return (
              <button
                key={`grid-${item.src}-${idx}`}
                type="button"
                onClick={() => handleSelectFromGrid(idx)}
                aria-label={`Bild ${idx + 1} von ${total} anzeigen`}
                aria-current={isSelected ? 'true' : undefined}
                className="group w-full text-left flex flex-col items-center cursor-pointer active:opacity-80 transition-opacity"
              >
                <div className="sf-no-callout relative w-full flex items-center justify-center overflow-hidden">
                  {item.type === 'video' ? (
                    <video
                      src={item.src}
                      poster={item.posterWebp || item.poster}
                      width={item.width || 1080}
                      height={item.height || 1350}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                      className="w-full h-auto max-h-[42vh] object-contain transition-opacity duration-200 group-hover:opacity-85"
                    >
                      <track
                        kind="captions"
                        src="/media/silent.vtt"
                        srcLang="de"
                        label="Ohne Ton"
                        default
                      />
                    </video>
                  ) : (
                    <img
                      src={item.gridSrc || item.src}
                      alt={`${project.label || 'Projekt'} — ${idx + 1}`}
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

      {/* =====================================================================
          3. NEXT PROJECT CONTINUOUS NAVIGATION BAR
         ===================================================================== */}
      {nextProject?.slug && (
        <nav
          aria-label="Nächstes Projekt"
          className="w-full px-6 sm:px-8 lg:px-10 py-8 sm:py-10 border-t border-ink/10 flex items-center justify-between gap-4"
        >
          <span className="font-sans text-xs tracking-[0.12px] text-ink-muted shrink-0">
            Nächstes Projekt
          </span>
          <a
            href={`/projects/${nextProject.slug}`}
            className="font-display uppercase text-sm sm:text-base tracking-[0.01em] text-ink hover:opacity-70 active:opacity-60 transition-opacity min-h-[44px] inline-flex items-center gap-2 text-right"
          >
            <span>{nextProject.label}</span>
            <span aria-hidden="true">→</span>
          </a>
        </nav>
      )}

      <MinimalFooter showBackLink />
    </div>
  );
}
