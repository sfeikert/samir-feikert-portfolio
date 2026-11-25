import { useEffect, useRef, useState } from 'react';
import { isVideoPath, toProjectSlug } from '../data/projects.js';

function getNextScrollState() {
  const sections = Array.from(document.querySelectorAll('[data-gallery-section]'));
  const footer = document.getElementById('contact-footer');

  const currentY = window.scrollY;
  const viewH = window.innerHeight;
  const threshold = currentY + viewH * 0.25;

  const getTop = (el) => {
    if (!el) return 0;
    return el.getBoundingClientRect().top + window.scrollY;
  };

  const nextSection = sections.find((sec) => getTop(sec) > threshold);
  const hasFooter = footer && getTop(footer) > threshold + 60;
  const nextTarget = nextSection || (hasFooter ? footer : null);

  return { nextTarget };
}

function VideoSlideMedia({ src, poster, width, height, className, isFirstRow }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      {poster && (
        <img
          src={poster}
          alt=""
          width={width}
          height={height}
          draggable={false}
          loading={isFirstRow ? 'eager' : 'lazy'}
          decoding="async"
          className={className}
        />
      )}
      <video
        src={src}
        poster={poster}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="none"
        onPlaying={() => setIsPlaying(true)}
        className={`${className} absolute inset-0 transition-opacity duration-300 ${
          isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <track kind="captions" src="/media/silent.vtt" srcLang="de" label="Ohne Ton" default />
      </video>
    </>
  );
}

function DriftingRow({ row, rowIndex }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const stateRef = useRef({
    x: 0,
    cycleWidth: 0,
    isPointerDown: false,
    pointerType: null,
    isDragging: false,
    axis: null,
    startX: 0,
    startY: 0,
    dragOriginX: 0,
    lastPointerX: 0,
    lastPointerTime: 0,
    velocity: 0,
    momentumVel: 0,
    scrollPending: 0,
    pauseUntil: 0,
    suppressClickUntil: 0,
    autoDrift: true,
  });

  const [draggingClass, setDraggingClass] = useState(false);

  // Ensure one cycle spans >= 4 slots (> 100vw on desktop & mobile), then render 2 cycles
  // (keeps total track width within iOS Safari's GPU compositing texture limit)
  const cycleSlides =
    row.slides.length >= 4
      ? row.slides
      : row.slides.length >= 2
        ? [...row.slides, ...row.slides]
        : [...row.slides, ...row.slides, ...row.slides, ...row.slides];
  const cycleLength = cycleSlides.length;
  const renderedSlides = [...cycleSlides, ...cycleSlides];

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const st = stateRef.current;
    const PAUSE_AFTER_INTERACTION_MS = 2200;
    const RESUME_RAMP_MS = 900;

    let isVisible = true;
    let videosArmed = false;
    const visibleVideos = new Set();

    // Position each slide individually inside a viewport-wide track so no GPU layer
    // ever approaches iOS Safari's 8192px physical texture limit (which caused blank white gaps).
    const slideEls = Array.from(track.children);
    let basePos = [];
    let totalWidth = 0;
    let wrapBuffer = 0;

    track.classList.add('is-ring');

    const updateViewportMode = () => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      st.autoDrift = !prefersReducedMotion;
    };

    const applyTransform = () => {
      if (!totalWidth) return;
      if (!st.isDragging) {
        const mod = ((st.x % totalWidth) + totalWidth) % totalWidth;
        st.x = mod === 0 ? 0 : mod - totalWidth;
      }
      const x = st.x;
      for (let i = 0; i < slideEls.length; i++) {
        const raw = basePos[i] + x + wrapBuffer;
        const wrapped = ((raw % totalWidth) + totalWidth) % totalWidth - wrapBuffer;
        slideEls[i].style.transform = `translate3d(${wrapped}px, 0, 0)`;
      }
    };

    const measureTrack = () => {
      let nextTotal = 0;
      let nextMax = 0;
      const nextBase = new Array(slideEls.length);
      for (let i = 0; i < slideEls.length; i++) {
        nextBase[i] = nextTotal;
        const w = slideEls[i].getBoundingClientRect().width;
        nextTotal += w;
        if (w > nextMax) nextMax = w;
      }
      if (!nextTotal) return;

      if (totalWidth === 0) {
        st.x = rowIndex % 2 === 0 ? 0 : -140;
      } else if (Math.abs(nextTotal - totalWidth) > 1) {
        st.x = (st.x / totalWidth) * nextTotal;
      }

      basePos = nextBase;
      totalWidth = nextTotal;
      wrapBuffer = nextMax + 24;
      st.cycleWidth = nextTotal / 2;
      applyTransform();
    };

    const videos = Array.from(track.querySelectorAll('video'));
    const promoteLazyImages = () => {
      track.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        img.loading = 'eager';
      });
    };

    const syncVideos = () => {
      videos.forEach((vid) => {
        vid.muted = true;
        vid.defaultMuted = true;
        vid.playsInline = true;
        if (videosArmed && isVisible && visibleVideos.has(vid)) {
          if (vid.preload === 'none') {
            vid.preload = 'metadata';
          }
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      });
    };

    updateViewportMode();
    measureTrack();

    const resizeObserver = new ResizeObserver(() => {
      updateViewportMode();
      measureTrack();
    });
    resizeObserver.observe(viewport);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (entry.isIntersecting) {
            promoteLazyImages();
          }
          syncVideos();
        });
      },
      { rootMargin: '600px 0px' }
    );
    io.observe(viewport);

    // Only play the single cloned video actually visible inside this row's viewport
    let videoIo = null;
    let armTimer = null;
    if (videos.length > 0) {
      videoIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visibleVideos.add(entry.target);
            } else {
              visibleVideos.delete(entry.target);
            }
          });
          syncVideos();
        },
        { root: viewport, rootMargin: '120px' }
      );
      videos.forEach((vid) => videoIo.observe(vid));

      // Defer video network fetch briefly so the hero LCP image wins bandwidth first
      armTimer = window.setTimeout(() => {
        videosArmed = true;
        syncVideos();
      }, 350);
    }

    // =========================================================================
    // 1. TOUCH INTERACTION (iOS Safari / Android — non-passive touchmove)
    // =========================================================================
    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const now = performance.now();

      st.isPointerDown = true;
      st.pointerType = 'touch';
      st.isDragging = false;
      st.axis = null;
      st.startX = touch.clientX;
      st.startY = touch.clientY;
      st.dragOriginX = st.x;
      st.lastPointerX = touch.clientX;
      st.lastPointerTime = now;
      st.velocity = 0;
      st.momentumVel = 0;
      st.scrollPending = 0;
    };

    const onTouchMove = (e) => {
      if (!st.isPointerDown || st.pointerType !== 'touch' || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dx = touch.clientX - st.startX;
      const dy = touch.clientY - st.startY;
      const now = performance.now();
      const dt = now - st.lastPointerTime;

      if (!st.axis) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        st.axis = Math.abs(dx) >= Math.abs(dy) * 0.7 ? 'x' : 'y';
      }

      if (st.axis === 'y') {
        // User is scrolling the page vertically — release slider tracking
        st.isPointerDown = false;
        st.isDragging = false;
        return;
      }

      if (st.axis === 'x') {
        if (e.cancelable) {
          e.preventDefault();
        }

        if (!st.isDragging) {
          st.isDragging = true;
          st.dragOriginX = st.x - dx;
          setDraggingClass(true);
        }

        if (dt > 0) {
          const instVel = (touch.clientX - st.lastPointerX) / dt;
          st.velocity = st.velocity * 0.6 + instVel * 0.4;
          st.lastPointerX = touch.clientX;
          st.lastPointerTime = now;
        }

        st.x = st.dragOriginX + dx;
        st.pauseUntil = now + PAUSE_AFTER_INTERACTION_MS;
        applyTransform();
      }
    };

    const onTouchEnd = () => {
      if (!st.isPointerDown || st.pointerType !== 'touch') return;
      const now = performance.now();
      st.isPointerDown = false;

      if (st.isDragging) {
        st.isDragging = false;
        setDraggingClass(false);
        st.suppressClickUntil = now + 120;

        // Only apply flick momentum if the finger was still moving right before release
        const timeSinceLastMove = now - st.lastPointerTime;
        if (timeSinceLastMove < 70 && Math.abs(st.velocity) > 0.12) {
          st.momentumVel = Math.max(-2.2, Math.min(2.2, st.velocity));
        } else {
          st.momentumVel = 0;
        }

        // Pause auto-drift for ~2.2s so the user can inspect and tap the photo
        st.pauseUntil = now + PAUSE_AFTER_INTERACTION_MS;
      }

      st.axis = null;
    };

    // =========================================================================
    // 2. MOUSE DRAG INTERACTION (Desktop / Laptop — stops dead on release)
    // =========================================================================
    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      const now = performance.now();

      st.isPointerDown = true;
      st.pointerType = 'mouse';
      st.isDragging = false;
      st.axis = null;
      st.startX = e.clientX;
      st.startY = e.clientY;
      st.dragOriginX = st.x;
      st.lastPointerX = e.clientX;
      st.lastPointerTime = now;
      st.velocity = 0;
      st.momentumVel = 0;
      st.scrollPending = 0;
    };

    const onWindowMouseMove = (e) => {
      if (!st.isPointerDown || st.pointerType !== 'mouse') return;
      const dx = e.clientX - st.startX;
      const dy = e.clientY - st.startY;
      const now = performance.now();

      if (!st.axis) {
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        st.axis = 'x';
      }

      if (!st.isDragging) {
        st.isDragging = true;
        st.dragOriginX = st.x - dx;
        setDraggingClass(true);
      }

      e.preventDefault();
      st.lastPointerX = e.clientX;
      st.lastPointerTime = now;
      st.x = st.dragOriginX + dx;
      st.pauseUntil = now + PAUSE_AFTER_INTERACTION_MS;
      applyTransform();
    };

    const onWindowMouseUp = () => {
      if (!st.isPointerDown || st.pointerType !== 'mouse') return;
      const now = performance.now();
      st.isPointerDown = false;

      if (st.isDragging) {
        st.isDragging = false;
        setDraggingClass(false);
        st.suppressClickUntil = now + 120;
        // Stop immediately where the mouse stopped so the user can click the image
        st.momentumVel = 0;
        st.pauseUntil = now + PAUSE_AFTER_INTERACTION_MS;
      }

      st.axis = null;
    };

    // =========================================================================
    // 3. TRACKPAD TWO-FINGER HORIZONTAL SWIPE (Laptop)
    // =========================================================================
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 1.5) {
        return;
      }
      if (e.cancelable) {
        e.preventDefault();
      }
      const now = performance.now();
      st.momentumVel = 0;
      st.scrollPending = 0;
      st.x -= e.deltaX;
      st.pauseUntil = now + PAUSE_AFTER_INTERACTION_MS;
      applyTransform();
    };

    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove', onTouchMove, { passive: false });
    viewport.addEventListener('touchend', onTouchEnd, { passive: true });
    viewport.addEventListener('touchcancel', onTouchEnd, { passive: true });
    viewport.addEventListener('mousedown', onMouseDown);
    viewport.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);

    let rafId;
    let prevTime = performance.now();
    let lastScrollY = Math.max(0, window.scrollY);
    const baseSpeedPerFrame = 0.245;
    const SCROLL_DRIVE_RATIO = 0.2;
    const direction = rowIndex % 2 === 0 ? 1 : -1;

    const tick = (now) => {
      const dtFrames = Math.min(2.5, Math.max(0.1, (now - prevTime) / 16.6667));
      prevTime = now;

      const currentScrollY = Math.max(0, window.scrollY);
      const scrollDelta = Math.min(180, Math.abs(currentScrollY - lastScrollY));
      lastScrollY = currentScrollY;

      if (isVisible && !st.isDragging && !st.isPointerDown) {
        if (Math.abs(st.momentumVel) > 0.02) {
          st.x += st.momentumVel * dtFrames * 13;
          st.momentumVel *= Math.pow(0.89, dtFrames);
          // Keep resetting the 2.2s pause timer until the touch flick comes to a complete stop
          st.pauseUntil = now + PAUSE_AFTER_INTERACTION_MS;
          st.scrollPending = 0;
          applyTransform();
        } else {
          st.momentumVel = 0;
          if (st.autoDrift && now >= st.pauseUntil) {
            if (scrollDelta > 0) {
              st.scrollPending += scrollDelta * SCROLL_DRIVE_RATIO;
            }
            const scrollStep = st.scrollPending * (1 - Math.pow(0.84, dtFrames));
            st.scrollPending -= scrollStep;
            if (st.scrollPending < 0.05) st.scrollPending = 0;

            const elapsedSinceResume = now - st.pauseUntil;
            const rampFactor =
              st.pauseUntil > 0
                ? Math.min(1, elapsedSinceResume / RESUME_RAMP_MS)
                : 1;
            st.x += direction * (baseSpeedPerFrame * dtFrames + scrollStep) * rampFactor;
            applyTransform();
          } else {
            st.scrollPending = 0;
          }
        }
      } else {
        st.scrollPending = 0;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      if (armTimer) window.clearTimeout(armTimer);
      resizeObserver.disconnect();
      io.disconnect();
      if (videoIo) videoIo.disconnect();
      track.classList.remove('is-ring');
      slideEls.forEach((el) => {
        el.style.transform = '';
      });
      viewport.removeEventListener('touchstart', onTouchStart);
      viewport.removeEventListener('touchmove', onTouchMove);
      viewport.removeEventListener('touchend', onTouchEnd);
      viewport.removeEventListener('touchcancel', onTouchEnd);
      viewport.removeEventListener('mousedown', onMouseDown);
      viewport.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };
  }, [rowIndex]);

  const handleSlideClick = (e) => {
    if (performance.now() < stateRef.current.suppressClickUntil) {
      e.preventDefault();
    }
  };

  return (
    <section data-gallery-section className="sf-gallery-row">
      <div
        ref={viewportRef}
        onDragStart={(e) => e.preventDefault()}
        className={`sf-slider-viewport ${draggingClass ? 'is-dragging' : ''}`}
      >
        <div ref={trackRef} className="sf-slider-track">
          {renderedSlides.map((slide, idx) => {
            const isAutoAspect = !slide.aspect || slide.aspect === 'auto';
            const mediaClass = isAutoAspect
              ? 'sf-media-auto'
              : 'w-full h-full object-cover';

            // Reserve exact aspect ratio in CSS so mobile Safari never collapses unloaded frames to 0px
            const frameAspect = isAutoAspect
              ? slide.intrinsicAspect || undefined
              : slide.aspect;

            const projectSlug = toProjectSlug(slide, idx);
            const projectHref =
              slide.startIndex && slide.startIndex > 0
                ? `/projects/${projectSlug}?slide=${slide.startIndex}`
                : `/projects/${projectSlug}`;

            const cycleIndex = Math.floor(idx / cycleLength);
            const indexInCycle = idx % cycleLength;
            // Cycle 0 starts at x = 0; hide duplicate cycle from AT & Tab order
            const isClone = cycleIndex !== 0;

            const isFirstRow = rowIndex === 0;
            const isLcpImage = isFirstRow && indexInCycle === 0;
            const lw = slide.layoutWidths;
            const slideStyle = lw
              ? {
                  '--sf-w-sm': `${lw.sm}vw`,
                  '--sf-w-md': `${lw.md}vw`,
                  '--sf-w-lg': `${lw.lg}vw`,
                  '--sf-ar': lw.ar,
                  ...(lw.y ? { '--sf-y': `${lw.y}vh` } : {}),
                }
              : undefined;
            const imgSizes = lw
              ? `(min-width: 1024px) ${lw.lg}vw, (min-width: 640px) ${lw.md}vw, ${lw.sm}vw`
              : slide.wide
                ? '(min-width: 1024px) 50vw, (min-width: 640px) 55vw, 94vw'
                : '(min-width: 1024px) 25vw, (min-width: 640px) 55vw, 80vw';

            return (
              <div
                key={`${row.id}-${idx}`}
                aria-hidden={isClone || undefined}
                style={slideStyle}
                className={`sf-slide ${slide.wide ? 'sf-wide' : ''}`}
              >
                <a
                  href={projectHref}
                  draggable={false}
                  tabIndex={isClone ? -1 : undefined}
                  onClick={handleSlideClick}
                  aria-label={slide.label ? `Open project ${slide.label}` : 'Open project'}
                  className="sf-media-card block cursor-pointer active:opacity-90 transition-opacity"
                >
                  <div
                    style={frameAspect ? { aspectRatio: frameAspect } : undefined}
                    className="relative w-full overflow-hidden bg-ink-tint"
                  >
                    {slide.type === 'video' || isVideoPath(slide.src) ? (
                      <VideoSlideMedia
                        src={slide.src}
                        poster={slide.posterWebp || slide.poster}
                        width={slide.width || 1080}
                        height={slide.height || 1350}
                        className={mediaClass}
                        isFirstRow={isFirstRow}
                      />
                    ) : (
                      <img
                        src={slide.thumbSrc || slide.src}
                        srcSet={slide.thumbSrcSet}
                        sizes={slide.thumbSrcSet ? imgSizes : undefined}
                        alt=""
                        width={slide.width || 1080}
                        height={slide.height || 1350}
                        draggable={false}
                        loading={isFirstRow ? 'eager' : 'lazy'}
                        decoding="async"
                        {...(isLcpImage ? { fetchpriority: 'high' } : {})}
                        className={mediaClass}
                      />
                    )}
                  </div>

                  {slide.label && (
                    <>
                      <div aria-hidden="true" className="sf-media-veil" />
                      <div className="sf-media-caption">{slide.label}</div>
                    </>
                  )}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function DriftingGallery({ rows = [] }) {
  const [canScrollNext, setCanScrollNext] = useState(true);

  useEffect(() => {
    const checkNextAvailability = () => {
      const { nextTarget } = getNextScrollState();
      setCanScrollNext(Boolean(nextTarget));
    };

    checkNextAvailability();
    window.addEventListener('scroll', checkNextAvailability, { passive: true });
    window.addEventListener('resize', checkNextAvailability, { passive: true });

    return () => {
      window.removeEventListener('scroll', checkNextAvailability);
      window.removeEventListener('resize', checkNextAvailability);
    };
  }, []);

  const handleNextSection = () => {
    const { nextTarget } = getNextScrollState();
    if (!nextTarget) return;
    nextTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative">
      {/* Continuous Drifting & Draggable Horizontal Gallery Strips */}
      <div className="pb-6">
        {rows.map((row, idx) => (
          <DriftingRow
            key={row.id}
            row={row}
            rowIndex={idx}
          />
        ))}
      </div>

      {/* Bottom-Center Next-Row Scroll Control (44x44px hit target) */}
      <button
        type="button"
        onClick={handleNextSection}
        disabled={!canScrollNext}
        aria-label="Scroll to next gallery row"
        className={`fixed bottom-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.5rem))] sm:bottom-6 left-1/2 -translate-x-1/2 z-20 inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-ink hover:text-ink-muted active:opacity-70 transition-all duration-200 ${
          canScrollNext
            ? 'opacity-100 translate-y-0 cursor-pointer'
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
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
    </div>
  );
}
