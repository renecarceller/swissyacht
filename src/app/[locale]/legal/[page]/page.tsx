import { ui } from "@/i18n/ui";

export default async function LegalPage({ params }: { params: Promise<{ locale: string; page: string }> }) {
  const { locale, page } = await params;
  const text = ui(locale);
  const titles: Record<string, string> = {
    "legal-notice": text.legal.legalNotice,
    terms: text.legal.terms,
    privacy: text.legal.privacy,
    cookies: text.legal.cookies,
    fraud: text.legal.fraud,
    contact: text.legal.contact,
    "publishing-rules": text.legal.publishingRules
  };
  const title = titles[page] || text.legal.fallback;

  return (
    <main className="container-shell py-10">
      <article className="max-w-3xl rounded-md border border-[#d9e2ec] bg-white p-6">
        <h1 className="text-3xl font-bold text-navy">{title}</h1>
        <p className="mt-4 leading-7 text-[#607085]">
          {text.legal.placeholder1}
        </p>
        <p className="mt-4 leading-7 text-[#607085]">
          {text.legal.placeholder2}
        </p>
      </article>
    </main>
  );
}
