import { ui } from "@/i18n/ui";

export default async function MessagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const text = ui(locale);
  return (
    <main className="container-shell py-8">
      <h1 className="text-3xl font-bold text-navy">{text.dashboard.messagesTitle}</h1>
      <div className="mt-6 rounded-md border border-[#d9e2ec] bg-white p-6">
        <p className="text-[#607085]">{text.dashboard.messagesText}</p>
      </div>
    </main>
  );
}
