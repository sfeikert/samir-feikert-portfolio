function handleOverviewClick(e) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  if (window.history.length > 1 && document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      if (refUrl.origin === window.location.origin && refUrl.pathname === '/') {
        e.preventDefault();
        window.history.back();
      }
    } catch {
      // Fall back to standard href="/" navigation
    }
  }
}

export default function MinimalFooter({ showBackLink = false }) {
  return (
    <footer
      id="contact-footer"
      className={`w-full px-6 sm:px-8 lg:px-10 py-5 ${
        showBackLink ? 'border-t border-ink/10' : 'mt-16'
      }`}
    >
      <div className="flex items-center justify-between gap-6 font-sans font-normal text-xs tracking-[0.12px] text-ink-muted">
        {showBackLink ? (
          <a
            href="/"
            onClick={handleOverviewClick}
            className="inline-flex items-center min-h-[44px] hover:text-ink active:opacity-70 transition-colors"
          >
            ← Übersicht
          </a>
        ) : (
          <span className="inline-flex items-center min-h-[44px] text-ink-muted/70">
            © 2026 Samir Feikert
          </span>
        )}

        <div className="flex items-center gap-6">
          {showBackLink && (
            <span className="hidden sm:inline text-ink-muted/60">
              © 2026 Samir Feikert
            </span>
          )}
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
