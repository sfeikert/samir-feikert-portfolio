import { Suspense, lazy, useEffect, useState } from 'react';
import SamirWordmark from './SamirWordmark.jsx';

const AboutOverlay = lazy(() => import('./AboutOverlay.jsx'));
const ExhibitionOverlay = lazy(() => import('./ExhibitionOverlay.jsx'));

const PILL_CLASS =
  'inline-flex items-center justify-center gap-1.5 min-h-[36px] sm:min-h-[34px] px-3.5 sm:px-4 py-1.5 font-sans font-normal text-[12px] sm:text-[13px] leading-none tracking-[0.01em] text-ink bg-white hover:bg-ink hover:text-white active:opacity-80 border border-ink/15 hover:border-ink rounded-full transition-colors duration-200 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)]';

export default function HeaderBar({ identity, showBackLink = false, exhibitionItems }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showScrollMark, setShowScrollMark] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(null);

  useEffect(() => {
    if (showBackLink) return;
    const handleScroll = () => {
      setShowScrollMark(window.scrollY >= 380);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showBackLink]);

  useEffect(() => {
    if (!mobileDrawerOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  const handleScrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {!showBackLink ? (
        /* =====================================================================
           STARTSEITE: Full-Bleed SAMIR FEIKERT Wordmark + Pill Bar + Hairline + Swiss Editorial Intro
           ===================================================================== */
        <header
          id="top"
          className="relative z-20 w-full px-3 sm:px-5 lg:px-6 pt-3 sm:pt-4 pb-14 sm:pb-20 lg:pb-28"
        >
          <h1 className="m-0 w-full">
            <a
              href="#top"
              onClick={handleScrollToTop}
              aria-label={identity.name}
              className="block w-full text-ink"
            >
              <SamirWordmark className="block w-full h-auto" />
              <span className="sr-only">{identity.name}</span>
            </a>
          </h1>

          {/* Single-Row Pill Navigation + Crisp Full-Width Hairline beneath */}
          <nav
            aria-label="Primary navigation"
            className="relative z-10 mt-1 sm:-mt-1.5 lg:-mt-4 pb-3 sm:pb-3.5 border-b border-ink/15 flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveOverlay('about')}
                className={PILL_CLASS}
              >
                About
              </button>
              <button
                type="button"
                onClick={() => setActiveOverlay('exhibition')}
                className={PILL_CLASS}
              >
                Exhibition
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveOverlay('inquiry')}
              className={PILL_CLASS}
            >
              <span>Anfrage</span>
              <span aria-hidden="true" className="text-[11px] leading-none">
                →
              </span>
            </button>
          </nav>

          {/* Flush-Left Monospace Intro Statement */}
          {identity.heroIntro && (
            <div className="pt-7 sm:pt-10 lg:pt-12 flex justify-end">
              <p className="w-full max-w-[32rem] font-mono font-normal text-[1.02rem] sm:text-[1.15rem] lg:text-[1.23rem] xl:text-[1.32rem] leading-[1.42] tracking-[-0.01em] text-pretty text-ink/90">
                {identity.heroIntro}
              </p>
            </div>
          )}
        </header>
      ) : (
        /* =====================================================================
           PROJECT DETAIL PAGES: Compact Unified Pill Header
           ===================================================================== */
        <header className="relative z-30 w-full px-4 sm:px-8 lg:px-10 pt-[max(1rem,env(safe-area-inset-top))] pb-3 shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <a href="/" className={PILL_CLASS}>
              ← Overview
            </a>

            <nav aria-label="Primary navigation" className="hidden sm:flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveOverlay('about')}
                className={PILL_CLASS}
              >
                About
              </button>
              <button
                type="button"
                onClick={() => setActiveOverlay('exhibition')}
                className={PILL_CLASS}
              >
                Exhibition
              </button>
            </nav>

            <button
              type="button"
              onClick={() => setMobileDrawerOpen((prev) => !prev)}
              aria-expanded={mobileDrawerOpen}
              aria-label={mobileDrawerOpen ? 'Close menu' : 'Open menu'}
              className="sm:hidden inline-flex items-center justify-center min-w-[36px] min-h-[36px] px-2.5 text-ink bg-white border border-ink/15 rounded-full active:opacity-70 transition-opacity cursor-pointer"
            >
              {mobileDrawerOpen ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="w-3 h-3 fill-none stroke-current"
                  strokeWidth="1.5"
                >
                  <path d="M2 2L14 14M14 2L2 14" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 18 12" className="w-3.5 h-2.5 fill-current">
                  <rect y="0" width="18" height="1.5" />
                  <rect y="5.25" width="18" height="1.5" />
                  <rect y="10.5" width="18" height="1.5" />
                </svg>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href="/"
              aria-label="Back to start page"
              className={`${PILL_CLASS} font-display uppercase tracking-[0.04em]`}
            >
              SF
            </a>
            <button
              type="button"
              onClick={() => setActiveOverlay('inquiry')}
              className={PILL_CLASS}
            >
              <span>Anfrage</span>
              <span aria-hidden="true" className="text-[11px] leading-none">
                →
              </span>
            </button>
          </div>
        </header>
      )}

      {/* Mobile Fullscreen Menu (Project Detail Pages on narrow screens) */}
      {showBackLink && mobileDrawerOpen && (
        <nav
          aria-label="Mobile navigation"
          className="fixed inset-0 top-16 z-40 bg-white px-6 py-10 sm:hidden flex flex-col gap-5 font-display font-normal uppercase text-3xl tracking-[0em] text-ink sf-fade-in"
        >
          <a
            href="/"
            onClick={() => setMobileDrawerOpen(false)}
            className="text-left py-2 hover:text-ink-muted active:opacity-70 transition-colors cursor-pointer"
          >
            Overview
          </a>
          <button
            type="button"
            onClick={() => {
              setActiveOverlay('about');
              setMobileDrawerOpen(false);
            }}
            className="text-left py-2 hover:text-ink-muted active:opacity-70 transition-colors cursor-pointer"
          >
            About
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveOverlay('exhibition');
              setMobileDrawerOpen(false);
            }}
            className="text-left py-2 hover:text-ink-muted active:opacity-70 transition-colors cursor-pointer"
          >
            Exhibition
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveOverlay('inquiry');
              setMobileDrawerOpen(false);
            }}
            className="text-left py-2 hover:text-ink-muted active:opacity-70 transition-colors cursor-pointer"
          >
            Anfrage
          </button>
        </nav>
      )}

      {/* Lazy-Loaded About & Exhibition Fullscreen Overlays */}
      <Suspense fallback={null}>
        {(activeOverlay === 'about' || activeOverlay === 'inquiry') && (
          <AboutOverlay
            isOpen={true}
            initialSection={activeOverlay}
            onClose={() => setActiveOverlay(null)}
            identity={identity}
          />
        )}

        {activeOverlay === 'exhibition' && (
          <ExhibitionOverlay
            isOpen={true}
            onClose={() => setActiveOverlay(null)}
            identity={identity}
            items={exhibitionItems}
          />
        )}
      </Suspense>

      {/* Discreet Floating Scroll Controls on Start Page (fade in only after scrolling past hero) */}
      {!showBackLink && (
        <div
          className={`fixed top-[max(0.875rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] sm:top-5 sm:right-5 lg:right-6 z-30 flex items-center gap-1.5 sm:gap-2 transition-opacity duration-300 ${
            showScrollMark ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={handleScrollToTop}
            aria-label="Scroll to top"
            className={`${PILL_CLASS} bg-white/90 backdrop-blur-sm font-display uppercase tracking-[0.04em]`}
          >
            SF
          </button>
          <button
            type="button"
            onClick={() => setActiveOverlay('inquiry')}
            className={`${PILL_CLASS} bg-white/90 backdrop-blur-sm`}
          >
            <span>Anfrage</span>
            <span aria-hidden="true" className="text-[11px] leading-none">
              →
            </span>
          </button>
        </div>
      )}
    </>
  );
}
