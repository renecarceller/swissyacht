import { ListingForm } from "@/components/forms/listing-form";
import { ui } from "@/i18n/ui";

export default async function SellPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const text = ui(locale);
  return (
    <main className="container-shell py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy">{text.sell.title}</h1>
        <p className="mt-2 max-w-2xl text-[#607085]">
          {text.sell.intro}
        </p>
      </div>
      <ListingForm locale={locale} />
    </main>
  );
}
