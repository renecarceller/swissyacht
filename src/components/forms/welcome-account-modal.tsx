"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { LoginAccountForm } from "@/components/forms/login-account-form";
import { RegisterAccountForm } from "@/components/forms/register-account-form";

const storageKey = "swissyacht-welcome-closed";
const openEvent = "swissyacht:open-account-modal";

export function WelcomeAccountModal({ locale, isAuthenticated = false }: { locale: string; isAuthenticated?: boolean }) {
  const [open, setOpen] = useState(() => !isAuthenticated && shouldOpenInitially());
  const [publishError] = useState(shouldShowPublishError);
  const [mode, setMode] = useState<"register" | "login">("register");
  const [returnTo, setReturnTo] = useState("");

  useEffect(() => {
    if (isAuthenticated) return;

    const params = new URLSearchParams(window.location.search);

    if (params.get("account") === "1") {
      params.delete("account");
      params.delete("publishError");
      const search = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
    }

    const handleOpen = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : null;
      setReturnTo(typeof detail?.returnTo === "string" ? detail.returnTo : "");
      setOpen(!isAuthenticated);
    };
    window.addEventListener(openEvent, handleOpen);
    return () => window.removeEventListener(openEvent, handleOpen);
  }, [isAuthenticated]);

  const close = () => {
    window.localStorage.setItem(storageKey, "true");
    setOpen(false);
  };

  if (isAuthenticated || !open) return null;

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
          <div className="mx-auto mb-6 flex w-full max-w-md rounded-md border border-[#d9e2ec] bg-white p-1">
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-md px-4 py-3 text-sm font-bold transition ${mode === "register" ? "bg-[#8bd3ff] text-navy shadow-[0_3px_0_#58b9e8]" : "text-[#607085] hover:bg-[#e8f6ff]"}`}
            >
              {registerTab(locale)}
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-md px-4 py-3 text-sm font-bold transition ${mode === "login" ? "bg-[#8bd3ff] text-navy shadow-[0_3px_0_#58b9e8]" : "text-[#607085] hover:bg-[#e8f6ff]"}`}
            >
              {loginTab(locale)}
            </button>
          </div>
          {mode === "login" ? <LoginAccountForm locale={locale} returnTo={returnTo} /> : <RegisterAccountForm locale={locale} compact returnTo={returnTo} />}
        </div>
      </div>
    </div>
  );
}

export function openAccountModal(returnTo?: string) {
  window.dispatchEvent(new CustomEvent(openEvent, { detail: { returnTo } }));
}

function shouldOpenInitially() {
  if (typeof window === "undefined") return false;
  return true;
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
    fr: "Vous devez créer un compte ou vous connecter avant de publier une annonce.",
    de: "Bitte erstellen Sie ein Konto oder melden Sie sich an, bevor Sie ein Inserat veröffentlichen.",
    it: "Devi creare un account o accedere prima di pubblicare un annuncio.",
    en: "You need to create an account or sign in before publishing a listing."
  };
  return lines[locale as keyof typeof lines] ?? lines.fr;
}

function registerTab(locale: string) {
  const labels = {
    fr: "Créer un compte",
    de: "Konto erstellen",
    it: "Crea account",
    en: "Create account"
  };
  return labels[locale as keyof typeof labels] ?? labels.fr;
}

function loginTab(locale: string) {
  const labels = {
    fr: "Se connecter",
    de: "Anmelden",
    it: "Accedi",
    en: "Sign in"
  };
  return labels[locale as keyof typeof labels] ?? labels.fr;
}
