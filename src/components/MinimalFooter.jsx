import { useState } from 'react';
import LegalModal from './LegalModal.jsx';

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

      <LegalModal
        activeLegal={activeLegal}
        onClose={() => setActiveLegal(null)}
        identity={identity}
      />
    </>
  );
}
