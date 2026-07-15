import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ui } from "@/i18n/ui";

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const text = ui(locale);
  return (
    <main className="container-shell grid min-h-[70vh] place-items-center py-10">
      <form className="w-full max-w-md rounded-md border border-[#d9e2ec] bg-white p-6">
        <div className="mb-5 flex items-center gap-2 text-xl font-bold text-navy"><UserPlus />{text.auth.registerTitle}</div>
        <div className="grid gap-4">
          <Field label={text.auth.accountType}><Select name="role"><option value="private">{text.common.private}</option><option value="professional">{text.common.professional}</option></Select></Field>
          <Field label={text.common.name}><Input name="name" required /></Field>
          <Field label={text.common.email}><Input type="email" name="email" required /></Field>
          <Field label={text.common.password}><Input type="password" name="password" required minLength={8} /></Field>
          <Button type="submit">{text.auth.registerSubmit}</Button>
        </div>
      </form>
    </main>
  );
}
