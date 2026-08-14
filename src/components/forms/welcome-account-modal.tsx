"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { RegisterAccountForm } from "@/components/forms/register-account-form";

const storageKey = "swissyacht-welcome-closed";
const openEvent = "swissyacht:open-account-modal";

export function WelcomeAccountModal({ locale }: { locale: string }) {
  const [open, setOpen] = useState(shouldOpenInitially);
  const [publishError] = useState(shouldShowPublishError);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("account") === "1") {
      params.delete("account");
      params.delete("publishError");
      const search = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
    }

    const handleOpen = () => setOpen(true);
    window.addEventListener(openEvent, handleOpen);
    return () => window.removeEventListener(openEvent, handleOpen);
  }, []);

  const close = () => {
    window.localStorage.setItem(storageKey, "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#031527]/70 p-3 backdrop-blur-md" role="dialog" aria-modal="true">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-white/35 bg-[#f8fbfd] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white/90 text-navy shadow-sm transition hover:bg-[#e8f6ff]"
        >
          <X size={22} />
        </button>
        <div className="border-b border-[#d9e2ec] bg-white px-6 py-5 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.34em] text-[#0f6fae]">Swissnaut</p>
          <p className="mt-2 text-sm text-[#607085]">{welcomeLine(locale)}</p>
          {publishError ? (
            <p className="mx-auto mt-3 max-w-2xl rounded-md bg-[#e8f6ff] px-4 py-3 text-sm font-semibold text-navy">
              {publishErrorLine(locale)}
            </p>
          ) : null}
        </div>
        <div className="p-5 md:p-8">
          <RegisterAccountForm locale={locale} compact />
        </div>
      </div>
    </div>
  );
}

export function openAccountModal() {
  window.dispatchEvent(new Event(openEvent));
}

function shouldOpenInitially() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("account") === "1" || window.localStorage.getItem(storageKey) !== "true";
}

function shouldShowPublishError() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("publishError") === "auth_required";
}

function welcomeLine(locale: string) {
  const lines = {
    fr: "Bienvenue sur le marketplace nautique suisse.",
    de: "Willkommen auf dem Schweizer Bootsmarktplatz.",
    it: "Benvenuto nel marketplace nautico svizzero.",
    en: "Welcome to the Swiss nautical marketplace."
  };
  return lines[locale as keyof typeof lines] ?? lines.fr;
}

function publishErrorLine(locale: string) {
  const lines = {
    fr: "Vous devez creer un compte ou vous connecter avant de publier une annonce.",
    de: "Bitte erstellen Sie ein Konto oder melden Sie sich an, bevor Sie ein Inserat veroffentlichen.",
    it: "Devi creare un account o accedere prima di pubblicare un annuncio.",
    en: "You need to create an account or sign in before publishing a listing."
  };
  return lines[locale as keyof typeof lines] ?? lines.fr;
}
