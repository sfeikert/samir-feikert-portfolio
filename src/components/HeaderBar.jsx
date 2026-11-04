import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AboutOverlay from './AboutOverlay.jsx';
import ExhibitionOverlay from './ExhibitionOverlay.jsx';
import { aboutContent, exhibitionItems } from '../data/projects.js';

export default function HeaderBar({ identity }) {
  const [menuOpen, setMenuOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showScrollMark, setShowScrollMark] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(null);

  useEffect(() => {
    const scroller = document.querySelector('.sf-snap-container');

    const handleScroll = () => {
      const y = scroller && scroller.scrollTop > 0 ? scroller.scrollTop : window.scrollY;
      setShowScrollMark(y >= 280);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    if (scroller) {
      scroller.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scroller) {
        scroller.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <>
      <header className="relative z-30 w-full px-6 sm:px-8 lg:px-10 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-7">
            {/* Desktop Toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? 'Collapse navigation' : 'Expand navigation'}
              className="hidden lg:inline-flex items-center justify-center w-6 h-6 text-ink hover:text-ink-muted transition-colors"
            >
              {menuOpen ? (
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="1.5">
                  <path d="M2 2L14 14M14 2L2 14" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 14" className="w-4 h-3 fill-current">
                  <rect y="0" width="20" height="1.5" />
                  <rect y="6" width="20" height="1.5" />
                  <rect y="12" width="20" height="1.5" />
                </svg>
              )}
            </button>

            {/* Mobile Toggle */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen((prev) => !prev)}
              aria-label="Toggle menu"
              className="lg:hidden inline-flex items-center justify-center w-6 h-6 text-ink"
            >
              {mobileDrawerOpen ? (
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="1.5">
                  <path d="M2 2L14 14M14 2L2 14" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 14" className="w-4 h-3 fill-current">
                  <rect y="0" width="20" height="1.5" />
                  <rect y="6" width="20" height="1.5" />
                  <rect y="12" width="20" height="1.5" />
                </svg>
              )}
            </button>

            {/* Desktop Horizontal Links (intentional placeholders until subpages are built) */}
            <AnimatePresence initial={false}>
              {menuOpen && (
                <motion.nav
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  aria-label="Primary navigation"
                  className="hidden lg:flex items-center gap-8 font-sans font-normal text-[1rem] tracking-[0.12px] text-ink"
                >
                  <button
                    type="button"
                    onClick={() => setActiveOverlay('about')}
                    className="hover:text-ink-muted transition-colors cursor-pointer"
                  >
                    About
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveOverlay('exhibition')}
                    className="hover:text-ink-muted transition-colors cursor-pointer"
                  >
                    Exhibition
                  </button>
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 top-16 z-40 bg-white px-6 py-10 lg:hidden flex flex-col gap-7 font-display font-normal uppercase text-3xl tracking-[0em] text-ink"
          >
            <button
              type="button"
              onClick={() => {
                setActiveOverlay('about');
                setMobileDrawerOpen(false);
              }}
              className="text-left hover:text-ink-muted transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveOverlay('exhibition');
                setMobileDrawerOpen(false);
              }}
              className="text-left hover:text-ink-muted transition-colors cursor-pointer"
            >
              Exhibition
            </button>
            <a
              href={`mailto:${identity.email}?subject=Projektanfrage%20%E2%80%94%20Samir%20Feikert`}
              onClick={() => setMobileDrawerOpen(false)}
              className="text-left hover:text-ink-muted transition-colors cursor-pointer"
            >
              Anfrage
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About & Exhibition Fullscreen Overlays */}
      <AnimatePresence>
        {activeOverlay === 'about' && (
          <AboutOverlay
            isOpen={true}
            onClose={() => setActiveOverlay(null)}
            identity={identity}
            content={aboutContent}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeOverlay === 'exhibition' && (
          <ExhibitionOverlay
            isOpen={true}
            onClose={() => setActiveOverlay(null)}
            identity={identity}
            items={exhibitionItems}
          />
        )}
      </AnimatePresence>

      {/* Top-Right Sticky Controls: "Anfrage" + Scroll Wordmark */}
      <div className="fixed top-6 right-6 sm:right-8 lg:right-10 z-30 flex items-center gap-5 sm:gap-7">
        <a
          href={`mailto:${identity.email}?subject=Projektanfrage%20%E2%80%94%20Samir%20Feikert`}
          className="font-sans font-normal text-xs sm:text-sm tracking-[0.12px] text-ink hover:text-ink-muted transition-colors cursor-pointer py-1"
        >
          Anfrage
        </a>

        {/* Floating Scroll Wordmark (fades in past 280px) */}
        <div
          className={`transition-opacity duration-300 ${
            showScrollMark ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <a
            href="#top"
            className="inline-block text-right leading-none group"
            aria-label="Scroll to top"
          >
            <span className="block font-display font-medium uppercase tracking-[0em] text-sm sm:text-base text-ink group-hover:text-ink-muted transition-colors">
              {identity.monogram}
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
