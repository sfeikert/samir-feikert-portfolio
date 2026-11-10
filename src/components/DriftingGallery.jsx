import { useEffect, useRef, useState } from 'react';
import { isVideoPath, toProjectSlug } from '../data/projects.js';

function getNextScrollState() {
  const sections = Array.from(document.querySelectorAll('[data-gallery-section]')).slice(1);
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

function DriftingRow({ row, rowIndex }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const stateRef = useRef({
    x: 0,
    cycleWidth: 0,
    isPointerDown: false,
    isDragging: false,
    didDrag: false,
    axis: null,
    startX: 0,
    startY: 0,
    dragOriginX: 0,
    lastPointerX: 0,
    lastPointerTime: 0,
    velocity: 0,
    momentumVel: 0,
    autoDrift: true,
  });

  const [draggingClass, setDraggingClass] = useState(false);

  // Repeat base slides per cycle (>= 300vw) and render 3 cycles for seamless infinite loop
  const cycleSlides = [...row.slides, ...row.slides];
  const renderedSlides = [...cycleSlides, ...cycleSlides, ...cycleSlides];

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const st = stateRef.current;

    let isVisible = true;

    const updateViewportMode = () => {
      // Disable auto-drift on touch devices and small mobile screens (swipe-only mode like reference)
      const isTouchOrMobile = window.matchMedia(
        '(hover: none), (pointer: coarse), (max-width: 767px)'
      ).matches;
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      st.autoDrift = !isTouchOrMobile && !prefersReducedMotion;
    };

    const normalizePosition = () => {
      const w = st.cycleWidth;
      if (!w) return;
      const mod = ((st.x % w) + w) % w;
      st.x = mod - 2 * w;
    };

    const measureTrack = () => {
      const totalWidth = track.scrollWidth;
      if (!totalWidth) return;
      const newCycleWidth = totalWidth / 3;
      if (st.cycleWidth === 0) {
        st.cycleWidth = newCycleWidth;
        st.x = -newCycleWidth - (rowIndex % 2) * 140;
      } else {
        st.cycleWidth = newCycleWidth;
      }
      normalizePosition();
      track.style.transform = `translate3d(${st.x}px, 0, 0)`;
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
          const videos = track.querySelectorAll('video');
          videos.forEach((vid) => {
            if (entry.isIntersecting) {
              vid.play().catch(() => {});
            } else {
              vid.pause();
            }
          });
        });
      },
      { rootMargin: '250px 0px' }
    );
    io.observe(viewport);

    let rafId;
    let prevTime = performance.now();
    const baseSpeedPerFrame = 0.35;

    const tick = (now) => {
      const dtFrames = Math.min(2.5, Math.max(0.1, (now - prevTime) / 16.6667));
      prevTime = now;

      if (isVisible && !st.isDragging) {
        if (Math.abs(st.momentumVel) > 0.02) {
          st.x += st.momentumVel * dtFrames * 14;
          st.momentumVel *= Math.pow(0.91, dtFrames);
        } else {
          st.momentumVel = 0;
          if (st.autoDrift) {
            st.x += baseSpeedPerFrame * dtFrames;
          }
        }
        normalizePosition();
        track.style.transform = `translate3d(${st.x}px, 0, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      io.disconnect();
    };
  }, [rowIndex]);

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const st = stateRef.current;
    st.isPointerDown = true;
    st.isDragging = false;
    st.didDrag = false;
    st.axis = null;
    st.startX = e.clientX;
    st.startY = e.clientY;
    st.dragOriginX = st.x;
    st.lastPointerX = e.clientX;
    st.lastPointerTime = performance.now();
    st.velocity = 0;
    st.momentumVel = 0;
  };

  const handlePointerMove = (e) => {
    const st = stateRef.current;
    if (!st.isPointerDown) return;

    const dx = e.clientX - st.startX;
    const dy = e.clientY - st.startY;
    const now = performance.now();
    const dt = now - st.lastPointerTime;

    if (dt > 0) {
      const instVel = (e.clientX - st.lastPointerX) / dt;
      st.velocity = st.velocity * 0.65 + instVel * 0.35;
      st.lastPointerX = e.clientX;
      st.lastPointerTime = now;
    }

    if (!st.axis) {
      const threshold = e.pointerType === 'touch' ? 10 : 5;
      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
      st.axis = Math.abs(dx) >= Math.abs(dy) * 0.85 ? 'x' : 'y';
    }

    if (st.axis === 'x') {
      if (!st.isDragging) {
        st.isDragging = true;
        st.didDrag = true;
        setDraggingClass(true);
        if (viewportRef.current?.setPointerCapture && e.pointerId !== undefined) {
          try {
            viewportRef.current.setPointerCapture(e.pointerId);
          } catch {}
        }
      }

      e.preventDefault();
      st.x = st.dragOriginX + dx;
      const w = st.cycleWidth;
      if (w) {
        const mod = ((st.x % w) + w) % w;
        st.x = mod - 2 * w;
      }
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${st.x}px, 0, 0)`;
      }
    }
  };

  const finishPointer = (e) => {
    const st = stateRef.current;
    if (!st.isPointerDown) return;
    st.isPointerDown = false;

    if (st.isDragging) {
      st.isDragging = false;
      setDraggingClass(false);
      st.momentumVel = Math.max(-2.6, Math.min(2.6, st.velocity));
    }

    st.axis = null;
    if (
      viewportRef.current?.releasePointerCapture &&
      e?.pointerId !== undefined &&
      viewportRef.current.hasPointerCapture?.(e.pointerId)
    ) {
      try {
        viewportRef.current.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerLeave = (e) => {
    // Touch pointers should not trigger cancel on leave (finger movement can cross boundaries)
    if (e.pointerType === 'touch') return;
    finishPointer(e);
  };

  const handleSlideClick = (e) => {
    if (stateRef.current.didDrag) {
      e.preventDefault();
      stateRef.current.didDrag = false;
    }
  };

  return (
    <section data-gallery-section className="sf-gallery-row sf-snap-row">
      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onPointerLeave={handlePointerLeave}
        onDragStart={(e) => e.preventDefault()}
        className={`sf-slider-viewport ${draggingClass ? 'is-dragging' : ''}`}
      >
        <div ref={trackRef} className="sf-slider-track">
          {renderedSlides.map((slide, idx) => {
            const alignClass =
              slide.align === 'middle'
                ? 'sf-align-middle'
                : slide.align === 'bottom'
                ? 'sf-align-bottom'
                : 'sf-align-top';

            // `aspect: 'auto'` (or no aspect) → frame follows the file's own
            // dimensions, nothing gets cropped. A fixed ratio (e.g. '3 / 4')
            // crops the media to that frame via object-cover.
            const isAutoAspect = !slide.aspect || slide.aspect === 'auto';
            const mediaClass = isAutoAspect
              ? 'sf-media-auto'
              : 'w-full h-full object-cover';

            const projectSlug = toProjectSlug(slide, idx);

            return (
              <div
                key={`${row.id}-${idx}`}
                className={`sf-slide ${alignClass} ${slide.wide ? 'sf-wide' : ''}`}
              >
                <a
                  href={`/projects/${projectSlug}`}
                  draggable={false}
                  onClick={handleSlideClick}
                  className="sf-media-card block cursor-pointer"
                >
                  <div
                    style={isAutoAspect ? undefined : { aspectRatio: slide.aspect }}
                    className="w-full overflow-hidden bg-ink-tint"
                  >
                    {slide.type === 'video' || isVideoPath(slide.src) ? (
                      <video
                        src={slide.src}
                        poster={slide.poster}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className={mediaClass}
                      />
                    ) : (
                      <img
                        src={slide.src}
                        alt={slide.label || ''}
                        draggable={false}
                        loading={rowIndex === 0 && idx < 6 ? 'eager' : 'lazy'}
                        decoding="async"
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

export default function DriftingGallery({ identity, rows = [] }) {
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
    <div id="top" className="relative">
      {/* Left-aligned Swiss Neo-Grotesque Masthead positioned close above the first gallery strip */}
      <div className="mt-16 sm:mt-24 lg:mt-28 px-6 sm:px-8 lg:px-10">
        <h1 className="font-display font-medium uppercase text-4xl sm:text-7xl lg:text-[5rem] xl:text-[5.75rem] leading-[1.0] tracking-[-0.015em] text-ink">
          {identity.monogram}
        </h1>
        <p className="mt-3 font-sans font-normal text-sm sm:text-[0.95rem] tracking-[0.12px] text-ink-muted">
          {identity.subtitle}
        </p>
      </div>

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

      {/* Bottom-Center Next-Row Scroll Control */}
      <button
        type="button"
        onClick={handleNextSection}
        disabled={!canScrollNext}
        aria-label="Scroll to next gallery row"
        className={`fixed bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+0.75rem))] sm:bottom-8 left-1/2 -translate-x-1/2 z-20 p-2 text-ink hover:text-ink-muted transition-all duration-200 ${
          canScrollNext
            ? 'opacity-100 translate-y-0 cursor-pointer'
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <svg viewBox="0 0 13 8" className="w-4 h-2.5 fill-none stroke-current" strokeWidth="1.2">
          <path d="M0.5 0.5L6.5 6.5L12.5 0.5" />
        </svg>
      </button>
    </div>
  );
}
