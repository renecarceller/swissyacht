"use client";

import Image from "next/image";
import { Globe2, Menu, ShipWheel } from "lucide-react";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ui } from "@/i18n/ui";

export function SiteHeader({ locale }: { locale: string }) {
  const text = ui(locale);
  const [open, setOpen] = useState(false);
  const nav = [
    { href: "/boats", label: text.nav.buy },
    { href: "/sell", label: text.nav.sell },
    { href: "/professionals", label: text.nav.professionals }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#d9e2ec] bg-white/95 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          locale={locale}
          className="flex items-center gap-2 font-bold text-navy"
          onClick={(event) => {
            if (!window.location.search) return;
            event.preventDefault();
            window.location.href = `/${locale}${window.location.search}`;
          }}
        >
          <span className="relative size-9 overflow-hidden rounded-md border border-[#d9e2ec] bg-white">
            <Image
              src="/images/swissyacht-sw-logo.jpg"
              alt=""
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </span>
          <span className="text-lg">SwissYacht</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#324963] md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} locale={locale} className="hover:text-navy">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-1 rounded-md border border-[#d9e2ec] px-2 py-2 text-sm">
            <Globe2 size={15} />
            {["fr", "de", "it", "en"].map((item) => (
              <Link key={item} href="/" locale={item} className={item === locale ? "font-bold text-navy" : "text-[#607085]"}>
                {item.toUpperCase()}
              </Link>
            ))}
          </div>
          <Link href="/login" locale={locale} className="rounded-md px-3 py-2 text-sm font-semibold text-navy hover:bg-[#e8f3fb]">
            {text.nav.login}
          </Link>
          <Link href="/sell" locale={locale} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#8bd3ff] px-4 text-sm font-semibold text-[#06233f] shadow-[0_3px_0_#58b9e8] transition hover:bg-[#aee2ff]">
            <ShipWheel size={16} />
            {text.nav.publish}
          </Link>
        </div>
        <Button variant="ghost" className="md:hidden" aria-label={text.nav.openMenu} onClick={() => setOpen((value) => !value)}>
          <Menu size={20} />
        </Button>
      </div>
      {open ? (
        <div className="border-t border-[#d9e2ec] bg-white p-4 md:hidden">
          <div className="container-shell grid gap-3">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} locale={locale} className="py-2 font-semibold">
                {item.label}
              </Link>
            ))}
            <Link href="/login" locale={locale} className="py-2 font-semibold">
              {text.nav.login}
            </Link>
            <Link href="/sell" locale={locale} className="rounded-md bg-[#8bd3ff] px-4 py-3 text-center font-semibold text-[#06233f] shadow-[0_3px_0_#58b9e8] transition hover:bg-[#aee2ff]">
              {text.nav.publish}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
