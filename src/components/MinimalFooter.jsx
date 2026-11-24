export default function MinimalFooter({ showBackLink = false }) {
  return (
    <footer
      id="contact-footer"
      className={`w-full px-6 sm:px-8 lg:px-10 py-5 ${
        showBackLink ? 'border-t border-ink/10' : 'mt-16'
      }`}
    >
      <div
        className={`flex items-center ${
          showBackLink ? 'justify-between' : 'justify-end'
        } gap-6 font-sans font-normal text-xs tracking-[0.12px] text-ink-muted`}
      >
        {showBackLink && (
          <a
            href="/"
            className="inline-flex items-center min-h-[44px] hover:text-ink active:opacity-70 transition-colors"
          >
            ← Overview
          </a>
        )}
        <div className="flex items-center gap-6">
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
    </footer>
  );
}
