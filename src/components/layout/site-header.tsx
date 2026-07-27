"use client";

import Image from "next/image";
import { CircleUserRound, Globe2, ShipWheel } from "lucide-react";
import { Link } from "@/i18n/routing";
import { openAccountModal } from "@/components/forms/welcome-account-modal";
import { ui } from "@/i18n/ui";

export function SiteHeader({ locale }: { locale: string }) {
  const text = ui(locale);
  const nav = [
    { href: "/boats", label: text.nav.buy },
    { href: "/sell", label: text.nav.sell }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#d9e2ec] bg-white/95 backdrop-blur">
      <div className="container-shell flex h-24 items-center justify-between gap-4 min-[520px]:h-16">
        <Link
          href="/"
          locale={locale}
          className="flex items-center gap-3 font-bold text-navy min-[520px]:gap-2"
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
          <span className="text-2xl min-[520px]:text-lg">SwissYacht</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#324963] min-[520px]:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} locale={locale} className="hover:text-navy">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 min-[520px]:flex">
          <div className="flex items-center gap-1 rounded-md border border-[#d9e2ec] px-2 py-2 text-sm">
            <Globe2 size={15} />
            {["fr", "de", "it", "en"].map((item) => (
              <Link key={item} href="/" locale={item} className={item === locale ? "font-bold text-navy" : "text-[#607085]"}>
                {item.toUpperCase()}
              </Link>
            ))}
          </div>
          <button type="button" onClick={openAccountModal} className="rounded-md px-3 py-2 text-sm font-semibold text-navy hover:bg-[#e8f3fb]">
            {text.nav.account}
          </button>
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
