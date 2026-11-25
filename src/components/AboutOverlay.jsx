import { useEffect, useRef, useState } from 'react';
import { aboutContent, siteIdentity } from '../data/projects.js';

function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="4.5" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function AboutOverlay({
  isOpen,
  onClose,
  identity,
  content = aboutContent,
  initialSection = 'about',
}) {
  const fullIdentity = { ...siteIdentity, ...identity };
  const [inquiryClicked, setInquiryClicked] = useState(false);
  const [copied, setCopied] = useState(false);
  const inquiryRef = useRef(null);

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

  useEffect(() => {
    if (!isOpen || initialSection !== 'inquiry') return;
    const rafId = requestAnimationFrame(() => {
      inquiryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, initialSection]);

  if (!isOpen) return null;

  const subject = `Projektanfrage - ${fullIdentity.name}`;
  const anfrageHref = `mailto:${fullIdentity.email}?subject=${encodeURIComponent(subject)}`;
  const gmailHref = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(
    fullIdentity.email
  )}&su=${encodeURIComponent(subject)}`;

  const handleAnfrageClick = () => {
    setInquiryClicked(true);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(fullIdentity.email)
        .then(() => setCopied(true))
        .catch(() => {});
    }
  };

  const instagram = fullIdentity.instagram || {
    handle: '@samirfeikert',
    url: 'https://www.instagram.com/samirfeikert/',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="About & Anfrage — Samir Feikert"
      className="fixed inset-0 z-50 bg-white text-ink overflow-y-auto sf-fade-in"
    >
      {/* Top Header */}
      <div className="sticky top-0 z-10 w-full px-6 sm:px-8 lg:px-10 pt-[max(1rem,env(safe-area-inset-top))] pb-4 bg-white/95 backdrop-blur-sm flex items-center justify-between border-b border-ink/10">
        <div className="flex items-center gap-4">
          <span className="font-display font-medium uppercase text-sm sm:text-base tracking-[0.02em]">
            About & Anfrage
          </span>
          <span className="hidden sm:inline font-sans text-xs text-ink-muted tracking-[0.12px]">
            — {fullIdentity.subtitle}
          </span>
        </div>
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

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 py-16 sm:py-24 space-y-16 sm:space-y-20">
        {/* 1. Core Statement (Über mich) */}
        <section className="space-y-8">
          <h2 className="font-display font-medium text-2xl sm:text-4xl lg:text-5xl leading-[1.12] tracking-[-0.015em] text-ink">
            {content.headline}
          </h2>

          <p className="font-sans font-normal text-lg sm:text-xl lg:text-2xl leading-[1.4] text-ink/90">
            {content.lead}
          </p>

          <div className="pt-4 max-w-2xl font-sans font-normal text-base sm:text-lg leading-[1.6] text-ink-muted whitespace-pre-line">
            {content.body}
          </div>
        </section>

        {/* 2. Anfrage */}
        <section
          id="anfrage"
          ref={inquiryRef}
          className="pt-12 sm:pt-16 border-t border-ink/15 scroll-mt-24 space-y-6"
        >
          <div className="space-y-2">
            <h3 className="font-display font-medium uppercase text-base sm:text-lg tracking-[0.02em] text-ink">
              Anfrage
            </h3>
            <p className="font-sans text-sm text-ink-muted tracking-[0.12px] max-w-xl">
              Für Auftragsarbeiten oder freie Projekte schreibe mir gerne direkt eine E-Mail.
            </p>
          </div>

          <div className="space-y-3">
            <a
              href={anfrageHref}
              onClick={handleAnfrageClick}
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-ink text-white border border-ink hover:bg-white hover:text-ink active:opacity-80 font-sans text-xs uppercase tracking-[0.08em] rounded-none transition-colors cursor-pointer"
            >
              Anfrage
            </a>

            {inquiryClicked && (
              <p className="font-sans text-xs text-ink-muted tracking-[0.12px]">
                {copied ? `${fullIdentity.email} kopiert — ` : 'Kein Mail-Programm geöffnet? '}
                <a
                  href={gmailHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-4 hover:opacity-70 transition-opacity"
                >
                  In Gmail öffnen
                </a>
              </p>
            )}
          </div>
        </section>

        {/* 3. Direktkontakt & Instagram */}
        <section className="pt-10 border-t border-ink/15 font-sans text-xs tracking-[0.12px]">
          <div className="space-y-3">
            <h3 className="font-display font-medium uppercase tracking-[0.02em] text-ink">
              Kontakt
            </h3>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-6">
              <a
                href={`mailto:${fullIdentity.email}`}
                className="inline-flex items-center min-h-[44px] text-ink-muted hover:text-ink transition-colors underline underline-offset-4"
              >
                {fullIdentity.email}
              </a>
              <span className="hidden sm:inline text-ink/20">/</span>
              <a
                href={`tel:${fullIdentity.phone}`}
                className="inline-flex items-center min-h-[44px] text-ink-muted hover:text-ink transition-colors underline underline-offset-4"
              >
                {fullIdentity.phone}
              </a>
              <span className="hidden sm:inline text-ink/20">/</span>
              <a
                href={instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram ${instagram.handle}`}
                className="inline-flex items-center gap-2 min-h-[44px] text-ink-muted hover:text-ink transition-colors group"
              >
                <InstagramIcon className="w-4 h-4 shrink-0 text-ink transition-opacity group-hover:opacity-75" />
                <span className="underline underline-offset-4">{instagram.handle}</span>
              </a>
            </div>
          </div>
        </section>

        {/* 4. Subtle Legal Links */}
        <div className="pt-14 pb-4 border-t border-ink/10 flex items-center justify-end gap-6 font-sans text-xs text-ink-muted/70 tracking-[0.12px]">
          <a
            href="/impressum"
            className="inline-flex items-center min-h-[44px] hover:text-ink active:opacity-70 transition-colors"
          >
            Impressum
          </a>
          <a
            href="/datenschutz"
            className="inline-flex items-center min-h-[44px] hover:text-ink active:opacity-70 transition-colors"
          >
            Datenschutz
          </a>
        </div>
      </div>
    </div>
  );
}
