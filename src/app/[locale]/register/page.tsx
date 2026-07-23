import { RegisterAccountForm } from "@/components/forms/register-account-form";

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <main className="container-shell py-10">
      <RegisterAccountForm locale={locale} />
    </main>
  );
}
