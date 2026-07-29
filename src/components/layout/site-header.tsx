"use client";

import { useState } from "react";
import Image from "next/image";
import { CircleUserRound, Heart, Menu, ShipWheel } from "lucide-react";
import { Link } from "@/i18n/routing";
import { openAccountModal } from "@/components/forms/welcome-account-modal";
import { ui } from "@/i18n/ui";

export function SiteHeader({ locale }: { locale: string }) {
  const text = ui(locale);
  const [languageOpen, setLanguageOpen] = useState(false);
  const nav = [
    { href: "/boats", label: text.nav.buy },
    { href: "/sell", label: text.nav.sell }
  ];

  return (
    <header className="sticky top-0 z-50 w-full max-w-full overflow-x-hidden border-b border-[#d9e2ec] bg-white/95 backdrop-blur">
      <div className="container-shell flex h-24 min-w-0 items-center justify-between gap-4 min-[520px]:h-16">
        <Link
          href="/"
          locale={locale}
          className="flex min-w-0 items-center gap-3 font-bold text-navy min-[520px]:gap-2"
          onClick={(event) => {
            if (!window.location.search) return;
            event.preventDefault();
            window.location.href = `/${locale}${window.location.search}`;
          }}
        >
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
          <span className="min-w-0 truncate text-2xl min-[520px]:text-lg">SwissYacht</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#324963] min-[520px]:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} locale={locale} className="hover:text-navy">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 min-[520px]:flex">
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
              <div className="absolute right-0 top-12 z-50 w-24 overflow-hidden rounded-md border border-[#d9e2ec] bg-white shadow-xl">
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
          <button type="button" onClick={openAccountModal} className="grid size-10 place-items-center rounded-md text-navy transition hover:bg-[#e8f3fb]" aria-label={text.nav.account}>
            <CircleUserRound size={25} strokeWidth={2.1} />
          </button>
          <Link href="/dashboard/favorites" locale={locale} className="grid size-10 place-items-center rounded-md text-[#8bd3ff] transition hover:bg-[#eef9ff]" aria-label={text.dashboard.favorites}>
            <Heart size={23} className="text-[#8bd3ff]" fill="#8bd3ff" stroke="#8bd3ff" strokeWidth={2.2} />
          </Link>
          <Link href="/sell" locale={locale} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#8bd3ff] px-4 text-sm font-semibold text-[#06233f] shadow-[0_3px_0_#58b9e8] transition hover:bg-[#aee2ff]">
            <ShipWheel size={16} />
            {text.nav.publish}
          </Link>
        </div>
        <button type="button" onClick={openAccountModal} className="grid size-12 place-items-center rounded-full text-[#2f3033] transition hover:bg-[#eef6fc] min-[520px]:hidden" aria-label={text.nav.account}>
          <CircleUserRound className="size-10" strokeWidth={2.1} />
        </button>
      </div>
    </header>
  );
}
