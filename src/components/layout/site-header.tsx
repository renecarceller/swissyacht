"use client";

import { useState } from "react";
import Image from "next/image";
import { CircleUserRound, Heart, LogOut, Menu, MessageCircle, ShipWheel } from "lucide-react";
import { Link } from "@/i18n/routing";
import { logoutAccountAction } from "@/lib/actions/auth";
import { openAccountModal } from "@/components/forms/welcome-account-modal";
import { ui } from "@/i18n/ui";

export function SiteHeader({
  locale,
  unreadMessages = 0,
  accountHref
}: {
  locale: string;
  unreadMessages?: number;
  accountHref?: string;
}) {
  const text = ui(locale);
  const [languageOpen, setLanguageOpen] = useState(false);
  const accountButton = accountHref ? (
    <a href={accountHref} className="grid size-10 place-items-center rounded-md text-navy transition hover:bg-[#e8f3fb]" aria-label={text.nav.account}>
      <CircleUserRound size={25} strokeWidth={2.1} />
    </a>
  ) : (
    <button type="button" onClick={() => openAccountModal()} className="grid size-10 place-items-center rounded-md text-navy transition hover:bg-[#e8f3fb]" aria-label={text.nav.account}>
      <CircleUserRound size={25} strokeWidth={2.1} />
    </button>
  );
  const mobileAccountButton = accountHref ? (
    <a href={accountHref} className="grid size-12 place-items-center rounded-full text-[#2f3033] transition hover:bg-[#eef6fc] min-[520px]:hidden" aria-label={text.nav.account}>
      <CircleUserRound className="size-10" strokeWidth={2.1} />
    </a>
  ) : (
    <button type="button" onClick={() => openAccountModal()} className="grid size-12 place-items-center rounded-full text-[#2f3033] transition hover:bg-[#eef6fc] min-[520px]:hidden" aria-label={text.nav.account}>
      <CircleUserRound className="size-10" strokeWidth={2.1} />
    </button>
  );
  const logoutButton = accountHref ? (
    <form action={logoutAccountAction}>
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="inline-flex h-10 items-center gap-2 rounded-md border border-[#d9e2ec] bg-white px-3 text-sm font-semibold text-navy transition hover:bg-[#e8f3fb]"
        aria-label={text.nav.logout}
      >
        <LogOut size={18} strokeWidth={2.1} />
        <span className="hidden xl:inline">{text.nav.logout}</span>
      </button>
    </form>
  ) : null;
  const mobileLogoutButton = accountHref ? (
    <form action={logoutAccountAction} className="min-[520px]:hidden">
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="grid size-12 place-items-center rounded-full text-navy transition hover:bg-[#eef6fc]"
        aria-label={text.nav.logout}
      >
        <LogOut className="size-7" strokeWidth={2.1} />
      </button>
    </form>
  ) : null;

  return (
    <header className="sticky top-0 z-50 w-full max-w-full border-b border-[#d9e2ec] bg-white/95 backdrop-blur">
      <div className="container-shell grid h-24 min-w-0 grid-cols-[1fr_auto] items-center gap-4 min-[520px]:h-16 min-[520px]:grid-cols-[1fr_auto_1fr]">
        <Link href="/" locale={locale} className="flex min-w-0 items-center gap-3 font-bold text-navy min-[520px]:gap-2">
          <span className="relative size-12 overflow-hidden rounded-md border border-[#d9e2ec] bg-white min-[520px]:size-9">
            <Image
              src="/images/swissyacht-sw-logo.jpg"
              alt=""
              fill
              sizes="(max-width: 519px) 48px, 36px"
              className="object-cover"
              priority
            />
          </span>
          <span className="min-w-0 truncate text-2xl min-[520px]:text-lg">Swissnaut</span>
        </Link>
        <Link href="/sell" locale={locale} className="hidden h-10 items-center gap-2 justify-self-center rounded-md bg-[#8bd3ff] px-5 text-sm font-semibold text-[#06233f] shadow-[0_3px_0_#58b9e8] transition hover:bg-[#aee2ff] min-[520px]:inline-flex">
          <ShipWheel size={16} />
          {text.nav.publish}
        </Link>
        <div className="hidden items-center justify-end gap-2 min-[520px]:flex">
          <Link
            href="/pmb"
            locale={locale}
            title={text.pmb.navTitle}
            aria-label={text.pmb.navTitle}
            className="hidden h-10 items-center rounded-md border border-[#d9e2ec] bg-white px-3 text-sm font-bold text-navy transition hover:bg-[#e8f3fb] lg:inline-flex"
          >
            {text.pmb.navLabel}
          </Link>
          <Link href="/dashboard/messages" locale={locale} className="relative grid size-10 place-items-center rounded-md text-navy transition hover:bg-[#e8f3fb]" aria-label={headerLabels(locale).messages}>
            <MessageCircle size={23} strokeWidth={2.1} />
            {unreadMessages > 0 ? (
              <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[#e51f35] px-1 text-[11px] font-bold text-white">
                {unreadMessages > 99 ? "99+" : unreadMessages}
              </span>
            ) : null}
          </Link>
          <Link href="/dashboard/favorites" locale={locale} className="grid size-10 place-items-center rounded-md text-[#8bd3ff] transition hover:bg-[#eef9ff]" aria-label={text.dashboard.favorites}>
            <Heart size={23} className="text-[#8bd3ff]" fill="#8bd3ff" stroke="#8bd3ff" strokeWidth={2.2} />
          </Link>
          {accountButton}
          {logoutButton}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLanguageOpen((open) => !open)}
              className="grid size-10 place-items-center rounded-md border border-[#d9e2ec] bg-white text-navy transition hover:bg-[#e8f3fb]"
              aria-label={text.nav.openMenu}
              aria-expanded={languageOpen}
            >
              <Menu size={25} strokeWidth={2.1} />
            </button>
            {languageOpen ? (
              <div className="absolute right-0 top-12 z-[90] w-24 overflow-hidden rounded-md border border-[#d9e2ec] bg-white shadow-xl">
                <Link
                  href="/pmb"
                  locale={locale}
                  onClick={() => setLanguageOpen(false)}
                  className="block border-b border-[#d9e2ec] px-4 py-3 text-center text-sm font-bold text-navy hover:bg-[#f6fbff]"
                  title={text.pmb.navTitle}
                >
                  PMB
                </Link>
                {["fr", "de", "it", "en"].map((item) => (
                  <Link
                    key={item}
                    href="/"
                    locale={item}
                    onClick={() => setLanguageOpen(false)}
                    className={`block border-b border-[#d9e2ec] px-4 py-3 text-center text-sm font-bold last:border-b-0 ${item === locale ? "bg-[#eef9ff] text-navy" : "text-[#607085] hover:bg-[#f6fbff] hover:text-navy"}`}
                  >
                    {item.toUpperCase()}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-1 min-[520px]:hidden">
          <Link
            href="/pmb"
            locale={locale}
            title={text.pmb.navTitle}
            aria-label={text.pmb.navTitle}
            className="grid h-10 min-w-12 place-items-center rounded-md border border-[#d9e2ec] bg-[#eef9ff] px-2 text-sm font-bold text-navy"
          >
            PMB
          </Link>
          {mobileAccountButton}
          {mobileLogoutButton}
        </div>
      </div>
    </header>
  );
}

function headerLabels(locale: string) {
  const labels = {
    fr: { messages: "Messages" },
    de: { messages: "Nachrichten" },
    it: { messages: "Messaggi" },
    en: { messages: "Messages" }
  };
  return labels[locale as keyof typeof labels] ?? labels.fr;
}
