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
          className="fixed inset-0 z-50 bg-white/95 backdrop-blur-[2px] p-4 sm:p-8 flex items-center justify-center animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-xl w-full max-h-[85vh] overflow-y-auto bg-white border border-ink/15 p-6 sm:p-8 space-y-6 text-ink shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <h2 className="font-display font-medium uppercase text-sm sm:text-base tracking-[0.02em]">
                {activeLegal === 'imprint' ? 'Impressum (§ 5 DDG)' : 'Datenschutzerklärung (DSGVO)'}
              </h2>
              <button
                type="button"
                onClick={() => setActiveLegal(null)}
                className="font-sans font-normal text-xs text-ink-muted hover:text-ink px-2 py-1 tracking-[0.12px] uppercase cursor-pointer"
              >
                Schließen ×
              </button>
            </div>

            {activeLegal === 'imprint' ? (
              <div className="space-y-4 text-xs leading-relaxed text-ink-muted font-sans">
                <div>
                  <h3 className="font-medium text-ink uppercase tracking-wider text-[11px] mb-1">
                    Angaben gemäß § 5 DDG
                  </h3>
                  <p className="font-medium text-ink">{identity.name}</p>
                  <p>Fotograf</p>
                  <p>{identity.address?.street || 'Ruhrtalstraße 16'}</p>
                  <p>{identity.address?.city || '40233 Düsseldorf'}</p>
                  <p>{identity.address?.country || 'Deutschland'}</p>
                </div>

                <div>
                  <h3 className="font-medium text-ink uppercase tracking-wider text-[11px] mb-1">
                    Kontakt
                  </h3>
                  <p>
                    Telefon:{' '}
                    <a href={`tel:${identity.phone || '+4917631501119'}`} className="hover:text-ink underline">
                      {identity.phone || '0176 31501119'}
                    </a>
                  </p>
                  <p>
                    E-Mail:{' '}
                    <a href={`mailto:${identity.email}`} className="hover:text-ink underline">
                      {identity.email}
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-ink uppercase tracking-wider text-[11px] mb-1">
                    Umsatzsteuer
                  </h3>
                  <p>
                    Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-ink uppercase tracking-wider text-[11px] mb-1">
                    Redaktionell verantwortlich
                  </h3>
                  <p>
                    {identity.name}, Ruhrtalstraße 16, 40233 Düsseldorf
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-ink uppercase tracking-wider text-[11px] mb-1">
                    EU-Streitschlichtung
                  </h3>
                  <p>
                    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                    <a
                      href="https://ec.europa.eu/consumers/odr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-ink underline"
                    >
                      https://ec.europa.eu/consumers/odr
                    </a>
                    .<br />
                    Ich bin nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                    Verbraucherschlichtungsstelle teilzunehmen.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs leading-relaxed text-ink-muted font-sans">
                <div>
                  <h3 className="font-medium text-ink uppercase tracking-wider text-[11px] mb-1">
                    1. Verantwortlicher
                  </h3>
                  <p className="font-medium text-ink">{identity.name}</p>
                  <p>{identity.address?.street || 'Ruhrtalstraße 16'}, {identity.address?.city || '40233 Düsseldorf'}</p>
                  <p>E-Mail: {identity.email}</p>
                  <p>Telefon: {identity.phone || '0176 31501119'}</p>
                </div>

                <div>
                  <h3 className="font-medium text-ink uppercase tracking-wider text-[11px] mb-1">
                    2. Bereitstellung der Website & Hosting (Cloudflare)
                  </h3>
                  <p>
                    Diese Website wird über das Content Delivery Network (CDN) und Hosting von{' '}
                    <strong>Cloudflare, Inc.</strong> (101 Townsend St, San Francisco, CA 94107, USA)
                    bereitgestellt.
                  </p>
                  <p className="mt-1">
                    Beim Aufruf dieser Website erfasst Cloudflare automatisch Informationen, die Ihr Browser
                    übermittelt (u.&nbsp;a. Ihre IP-Adresse, Datum und Uhrzeit des Zugriffs, übertragene Datenmenge,
                    den anfragenden Provider, Referrer-URL sowie Browsertyp und Betriebssystem). Dies ist technisch
                    erforderlich, um die Website fehlerfrei, schnell und vor Cyberangriffen geschützt auszuliefern.
                  </p>
                  <p className="mt-1">
                    <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer
                    stabilen, sicheren und schnellen Bereitstellung des Onlineangebots).
                  </p>
                  <p className="mt-1">
                    Cloudflare ist unter dem <em>EU-US Data Privacy Framework (DPF)</em> zertifiziert, wodurch ein
                    angemessenes Datenschutzniveau gemäß Art. 45 DSGVO gewährleistet wird.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-ink uppercase tracking-wider text-[11px] mb-1">
                    3. Cookies, Tracking & Analyse
                  </h3>
                  <p>
                    Diese Website ist bewusst minimalistisch gehalten: Es werden <strong>keine Tracking-Cookies</strong>,
                    keine Werbe-Pixel und keine externen Web-Analytics-Dienste (wie Google Analytics) eingesetzt.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-ink uppercase tracking-wider text-[11px] mb-1">
                    4. Kontaktaufnahme
                  </h3>
                  <p>
                    Wenn Sie per E-Mail oder Telefon Kontakt mit mir aufnehmen, werden Ihre Angaben (Name, E-Mail-Adresse,
                    Telefonnummer sowie die Nachricht) ausschließlich zur Bearbeitung und Beantwortung Ihrer Anfrage
                    gespeichert und verarbeitet.
                  </p>
                  <p className="mt-1">
                    <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen oder
                    Vertragserfüllung) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Kommunikation).
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-ink uppercase tracking-wider text-[11px] mb-1">
                    5. Ihre Rechte
                  </h3>
                  <p>
                    Sie haben nach der DSGVO jederzeit das Recht auf unentgeltliche <strong>Auskunft</strong> über Ihre
                    gespeicherten personenbezogenen Daten (Art. 15), <strong>Berichtigung</strong> (Art. 16),{' '}
                    <strong>Löschung</strong> (Art. 17), <strong>Einschränkung der Verarbeitung</strong> (Art. 18),{' '}
                    <strong>Datenübertragbarkeit</strong> (Art. 20) sowie das Recht auf <strong>Widerspruch</strong> gegen
                    die Verarbeitung (Art. 21).
                  </p>
                  <p className="mt-1">
                    Zudem haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Die für mich
                    zuständige Aufsichtsbehörde ist die{' '}
                    <em>Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW)</em>,
                    Kavalleriestr. 2–4, 40213 Düsseldorf.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
