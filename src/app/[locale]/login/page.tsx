import { LoginAccountForm } from "@/components/forms/login-account-form";
import { Link } from "@/i18n/routing";
import { ui } from "@/i18n/ui";

export default async function LoginPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { locale } = await params;
  const { returnTo = "" } = await searchParams;
  const text = ui(locale);
  return (
    <main className="container-shell grid min-h-[70vh] place-items-center py-10">
      <div>
        <LoginAccountForm locale={locale} returnTo={returnTo} />
        <p className="mt-4 max-w-md text-sm text-[#607085]">{text.auth.loginHelp}</p>
        <Link href="/register" locale={locale} className="mt-4 inline-flex text-sm font-bold text-[#0f6fae] hover:underline">
          {text.auth.registerTitle}
        </Link>
      </div>
    </main>
  );
}
