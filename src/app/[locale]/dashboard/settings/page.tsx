import { ui } from "@/i18n/ui";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const text = ui(locale);
  return (
    <main className="container-shell py-8">
      <h1 className="text-3xl font-bold text-navy">{text.dashboard.settingsTitle}</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[text.dashboard.basic, text.dashboard.premium, text.common.professional].map((plan) => (
          <div key={plan} className="rounded-md border border-[#d9e2ec] bg-white p-5">
            <h2 className="text-xl font-bold text-navy">{plan}</h2>
            <p className="mt-2 text-sm text-[#607085]">{text.dashboard.planText}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
