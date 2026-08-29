import { getLegalPage, legalDocumentVersion } from "@/lib/legal/content";

export default async function LegalPage({ params }: { params: Promise<{ locale: string; page: string }> }) {
  const { locale, page } = await params;
  const content = getLegalPage(locale, page);

  return (
    <main className="container-shell py-10">
      <article className="mx-auto max-w-4xl rounded-md border border-[#d9e2ec] bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold text-[#607085]">Version {legalDocumentVersion}</p>
        <h1 className="mt-2 text-3xl font-bold text-navy md:text-4xl">{content.title}</h1>
        <p className="mt-4 text-lg leading-8 text-[#607085]">{content.intro}</p>
        <div className="mt-8 grid gap-8">
          {content.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-bold text-navy">{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-7 text-[#40546b]">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="mt-3 grid gap-2 leading-7 text-[#40546b]">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="mt-3 size-1.5 shrink-0 rounded-full bg-[#8bd3ff]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
