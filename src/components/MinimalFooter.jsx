import { useState } from 'react';

export default function MinimalFooter({ identity }) {
  const [activeLegal, setActiveLegal] = useState(null);

  return (
    <>
      <footer
        id="contact-footer"
        className="sf-snap-footer mt-16 py-6 px-6 sm:px-8 lg:px-10"
      >
        <div className="flex items-center justify-end gap-6 font-sans font-normal text-xs tracking-[0.12px] text-ink-muted">
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
      </footer>

      {activeLegal && (
        <div
          onClick={() => setActiveLegal(null)}
          className="fixed inset-0 z-50 bg-white/95 backdrop-blur-[2px] p-6 sm:p-10 flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-lg w-full bg-white border border-ink/15 p-6 sm:p-8 space-y-4 text-ink"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-medium uppercase text-base tracking-[0em]">
                {activeLegal === 'imprint' ? 'Imprint (§ 5 DDG)' : 'Privacy Policy'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveLegal(null)}
                className="font-sans font-normal text-xs text-ink-muted hover:text-ink"
              >
                Close
              </button>
            </div>

            {activeLegal === 'imprint' ? (
              <div className="space-y-2 text-xs leading-relaxed text-ink-muted">
                <p className="font-medium text-ink">{identity.name}</p>
                <p>Düsseldorf, Germany</p>
                <p>[Street & House Number — to be added before launch]</p>
                <p>Email: {identity.email}</p>
              </div>
            ) : (
              <div className="space-y-2 text-xs leading-relaxed text-ink-muted">
                <p>
                  Controller: {identity.name}, Düsseldorf ({identity.email}).
                </p>
                <p>
                  This website does not use tracking cookies or analytics profiles. Server log files are processed solely to ensure technical delivery in accordance with Art. 6(1)(f) GDPR.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
