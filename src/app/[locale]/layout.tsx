import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WelcomeAccountModal } from "@/components/forms/welcome-account-modal";
import { getUnreadMessageCount } from "@/lib/data/messages";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(routing.locales.map((item) => [item, `/${item}`]))
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as never)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const [unreadMessages, accountHref] = await Promise.all([
    getUnreadMessageCount(),
    getAccountHref(locale)
  ]);
  const isAuthenticated = Boolean(accountHref);

  return (
    <NextIntlClientProvider messages={messages}>
      <SiteHeader locale={locale} unreadMessages={unreadMessages} accountHref={accountHref} />
      {children}
      <SiteFooter locale={locale} />
      <WelcomeAccountModal locale={locale} isAuthenticated={isAuthenticated} />
    </NextIntlClientProvider>
  );
}

async function getAccountHref(locale: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return undefined;

  let data;
  try {
    ({ data } = await supabase.auth.getUser());
  } catch (error) {
    console.error("Supabase account session read failed", error);
    return undefined;
  }

  if (!data.user) return undefined;

  try {
    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle<{ role: string | null }>();

    if (profile?.role === "admin") return `/${locale}/admin`;
    if (profile?.role === "professional") return `/${locale}/dashboard/professional`;
  } catch {
    // Keep the signed-in navigation usable even if the profile lookup fails.
  }

  return `/${locale}/dashboard`;
}
