import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { ui } from "@/i18n/ui";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const text = ui(locale);
  return (
    <main className="container-shell py-8">
      <h1 className="text-3xl font-bold text-navy">{text.dashboard.profile}</h1>
      <form className="mt-6 grid max-w-3xl gap-4 rounded-md border border-[#d9e2ec] bg-white p-5">
        <Field label={text.common.name}><Input defaultValue="Demo Seller" /></Field>
        <Field label={text.dashboard.company}><Input placeholder={text.common.professional} /></Field>
        <Field label={text.dashboard.website}><Input placeholder="https://..." /></Field>
        <Field label={text.common.description}><Textarea placeholder={text.dashboard.publicDescription} /></Field>
        <Button>{text.dashboard.saveProfile}</Button>
      </form>
    </main>
  );
}
