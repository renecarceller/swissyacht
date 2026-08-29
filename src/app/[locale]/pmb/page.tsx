import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, MessageCircle, Send, ShipWheel } from "lucide-react";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ui } from "@/i18n/ui";

const whatsappNumber = "41774610706";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const text = ui(locale);

  return {
    title: `${text.pmb.title} · ${text.pmb.subtitle} · Swissnaut`,
    description: text.pmb.intro,
    alternates: {
      canonical: `/${locale}/pmb`
    },
    openGraph: {
      title: `${text.pmb.title} · ${text.pmb.subtitle}`,
      description: text.pmb.intro,
      type: "website"
    }
  };
}

export default async function PmbPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const text = ui(locale);
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text.pmb.whatsappMessage)}`;

  const steps = [text.pmb.step1, text.pmb.step2, text.pmb.step3];

  return (
    <main className="bg-[#f4f8fc] pb-20">
      <section className="border-b border-[#d9e2ec] bg-white">
        <div className="container-shell py-10 min-[760px]:py-14">
          <Link href="/" locale={locale} className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#0f6fae]">
            <ArrowRight className="size-4 rotate-180" />
            Swissnaut
          </Link>
          <div className="max-w-4xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-[#0f6fae]">{text.pmb.title}</p>
            <h1 className="text-4xl font-bold leading-tight text-navy min-[760px]:text-6xl">{text.pmb.subtitle}</h1>
            <p className="mt-6 max-w-2xl text-xl font-semibold leading-8 text-[#263a50]">{text.pmb.question}</p>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-[#607085]">{text.pmb.intro}</p>
          </div>
        </div>
      </section>

      <section className="container-shell py-10 min-[760px]:py-14">
        <div className="grid gap-6 min-[900px]:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-md border border-[#d9e2ec] bg-white p-6 shadow-sm min-[760px]:p-8">
            <div className="mb-6 grid size-12 place-items-center rounded-md bg-[#e8f6ff] text-[#0f6fae]">
              <ShipWheel className="size-6" />
            </div>
            <h2 className="text-2xl font-bold text-navy">{text.pmb.transmit}</h2>
            <div className="mt-6 grid gap-3">
              {[text.pmb.accountName, text.pmb.companyName].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-md border border-[#d9e2ec] bg-[#f8fbfe] p-4 font-semibold text-navy">
                  <CheckCircle2 className="size-5 shrink-0 text-[#0f6fae]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 rounded-md bg-[#e8f6ff] px-5 py-4 text-3xl font-bold text-navy">{text.pmb.thatsAll}</p>
            <p className="mt-5 leading-7 text-[#607085]">{text.pmb.rest}</p>
          </div>

          <div className="rounded-md border border-[#d9e2ec] bg-white p-6 shadow-sm min-[760px]:p-8">
            <h2 className="text-2xl font-bold text-navy">{text.pmb.howTitle}</h2>
            <div className="mt-6 grid gap-4">
              {steps.map((step, index) => (
                <div key={step} className="grid grid-cols-[2.5rem_1fr] gap-4">
                  <div className="grid size-10 place-items-center rounded-md bg-[#8bd3ff] font-bold text-navy shadow-[0_3px_0_#58b9e8]">
                    {index + 1}
                  </div>
                  <p className="self-center leading-7 text-[#263a50]">{step}</p>
                </div>
              ))}
            </div>
            <p className="mt-7 border-t border-[#d9e2ec] pt-6 font-semibold text-[#607085]">{text.pmb.noManual}</p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-md bg-[#8bd3ff] px-6 py-4 text-center text-lg font-bold text-navy shadow-[0_4px_0_#58b9e8] transition hover:bg-[#aee2ff] min-[760px]:w-auto"
            >
              <MessageCircle className="size-5" />
              {text.pmb.cta}
              <Send className="size-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
