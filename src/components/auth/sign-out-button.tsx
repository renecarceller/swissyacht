import { LogOut } from "lucide-react";
import { logoutAccountAction } from "@/lib/actions/auth";
import { ui } from "@/i18n/ui";

export function SignOutButton({ locale, className = "" }: { locale: string; className?: string }) {
  const text = ui(locale);

  return (
    <form action={logoutAccountAction} className={className}>
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d9e2ec] bg-white px-4 py-3 text-sm font-bold text-navy transition hover:bg-[#e8f3fb]"
      >
        <LogOut className="h-4 w-4" strokeWidth={2.1} />
        {text.nav.logout}
      </button>
    </form>
  );
}
