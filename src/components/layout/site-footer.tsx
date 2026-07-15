import { Link } from "@/i18n/routing";
import { lakes } from "@/lib/data/reference";
import { refLabel, ui } from "@/i18n/ui";

export function SiteFooter({ locale }: { locale: string }) {
  const text = ui(locale);
  const legal = [
    ["legal-notice", text.legal.legalNotice],
    ["terms", text.legal.terms],
    ["privacy", text.legal.privacy],
    ["cookies", text.legal.cookies],
    ["fraud", text.legal.fraud],
    ["publishing-rules", text.legal.publishingRules]
  ];

  return (
    <footer className="mt-16 border-t border-[#d9e2ec] bg-[#061b31] py-12 text-white">
      <div className="container-shell grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <div className="text-xl font-bold">SwissYacht</div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[#b8c7d8]">
            {text.home.subtitle}
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Marketplace</h2>
          <div className="mt-3 grid gap-2 text-sm text-[#b8c7d8]">
            <Link href="/boats" locale={locale}>{text.nav.buy}</Link>
            <Link href="/sell" locale={locale}>{text.nav.sell}</Link>
            <Link href="/professionals" locale={locale}>{text.nav.professionals}</Link>
            <Link href="/dashboard" locale={locale}>{text.dashboard.title}</Link>
          </div>
        </div>
        <div>
          <h2 className="font-semibold">{text.common.lake}</h2>
          <div className="mt-3 grid gap-2 text-sm text-[#b8c7d8]">
            {lakes.slice(0, 6).map((lake) => (
              <Link key={lake} href={{ pathname: "/boats", query: { lake } }} locale={locale}>
                {refLabel(locale, lake)}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-semibold">Legal</h2>
          <div className="mt-3 grid gap-2 text-sm text-[#b8c7d8]">
            {legal.map(([slug, label]) => (
              <Link key={slug} href={`/legal/${slug}`} locale={locale}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
