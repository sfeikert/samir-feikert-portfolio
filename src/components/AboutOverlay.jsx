import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LegalModal from './LegalModal.jsx';

export default function AboutOverlay({ isOpen, onClose, identity, content }) {
  const [activeLegal, setActiveLegal] = useState(null);
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 bg-white text-ink overflow-y-auto"
    >
      {/* Top Header */}
      <div className="sticky top-0 z-10 w-full px-6 sm:px-8 lg:px-10 pt-[max(1.25rem,env(safe-area-inset-top))] pb-5 bg-white/95 backdrop-blur-sm flex items-center justify-between border-b border-ink/10">
        <div className="flex items-center gap-4">
          <span className="font-display font-medium uppercase text-sm sm:text-base tracking-[0.02em]">
            About
          </span>
          <span className="hidden sm:inline font-sans text-xs text-ink-muted tracking-[0.12px]">
            — {identity.subtitle}
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

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-24 space-y-16 sm:space-y-20">
        {/* Core Statement */}
        <div className="space-y-8">
          <h2 className="font-display font-medium text-2xl sm:text-4xl lg:text-5xl leading-[1.12] tracking-[-0.015em] text-ink">
            {content.headline}
          </h2>

          <p className="font-sans font-normal text-lg sm:text-xl lg:text-2xl leading-[1.4] text-ink/90">
            {content.lead}
          </p>

          <div className="pt-4 max-w-2xl font-sans font-normal text-base sm:text-lg leading-[1.6] text-ink-muted whitespace-pre-line">
            {content.body}
          </div>
        </div>

        {/* Minimal Contact Line */}
        <div className="pt-12 border-t border-ink/15 font-sans text-xs tracking-[0.12px]">
          <div className="space-y-2">
            <h3 className="font-display font-medium uppercase tracking-[0.02em] text-ink">
              Kontakt
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pt-1">
              <a
                href={`mailto:${identity.email}`}
                className="text-ink-muted hover:text-ink transition-colors underline"
              >
                {identity.email}
              </a>
              <span className="hidden sm:inline text-ink/20">/</span>
              <a
                href={`tel:${identity.phone}`}
                className="text-ink-muted hover:text-ink transition-colors underline"
              >
                {identity.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Subtle Legal Links */}
        <div className="pt-16 pb-4 border-t border-ink/10 flex items-center justify-end gap-6 font-sans text-xs text-ink-muted/70 tracking-[0.12px]">
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
  );
}

