import { BarChart3, Building2, Inbox, Store } from "lucide-react";
import { ui } from "@/i18n/ui";

export default async function ProfessionalsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const text = ui(locale);
  const rows = text.professionals.rows.split("|");
  return (
    <main className="container-shell py-10">
      <section className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="text-4xl font-bold text-navy">{text.professionals.title}</h1>
          <p className="mt-4 text-lg leading-8 text-[#607085]">
            {text.professionals.intro}
          </p>
        </div>
        <div className="rounded-md border border-[#d9e2ec] bg-white p-6">
          <h2 className="text-xl font-bold text-navy">{text.professionals.included}</h2>
          <div className="mt-5 grid gap-4">
            {[
              [Building2, rows[0], rows[1]],
              [Store, rows[2], rows[3]],
              [Inbox, rows[4], rows[5]],
              [BarChart3, rows[6], rows[7]]
            ].map(([Icon, title, text]) => (
              <div key={String(title)} className="flex gap-3">
                <Icon className="text-[#0f6fae]" />
                <div><div className="font-bold">{String(title)}</div><p className="text-sm text-[#607085]">{String(text)}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
