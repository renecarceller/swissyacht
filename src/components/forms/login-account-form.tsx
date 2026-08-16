"use client";

import { Lock } from "lucide-react";
import { useActionState } from "react";
import { loginAccountAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { ui } from "@/i18n/ui";

export function LoginAccountForm({ locale, returnTo = "" }: { locale: string; returnTo?: string }) {
  const [state, action, pending] = useActionState(loginAccountAction, { error: "" });
  const text = ui(locale);
  const labels = loginLabels(locale);

  return (
    <form action={action} className="mx-auto w-full max-w-md rounded-md border border-[#d9e2ec] bg-white p-5 shadow-sm">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className="mb-5 flex items-center gap-2 text-2xl font-bold text-navy">
        <Lock className="h-6 w-6" />
        {labels.title}
      </div>
      {state.error ? (
        <div className="mb-4 rounded-md border border-[#8bd3ff] bg-[#e8f6ff] px-4 py-3 text-sm font-semibold text-navy">
          {state.error}
        </div>
      ) : null}
      <div className="grid gap-4">
        <Field label={text.common.email}>
          <Input type="email" name="email" autoComplete="email" required />
        </Field>
        <Field label={text.common.password}>
          <Input type="password" name="password" autoComplete="current-password" required />
        </Field>
        <Button disabled={pending} className="bg-[#8bd3ff] text-[#06233f] shadow-[0_4px_0_#58b9e8] hover:bg-[#aee2ff]">
          {pending ? labels.loading : labels.submit}
        </Button>
      </div>
    </form>
  );
}

function loginLabels(locale: string) {
  const labels = {
    fr: {
      title: "Se connecter",
      submit: "Entrer dans mon compte",
      loading: "Connexion..."
    },
    de: {
      title: "Anmelden",
      submit: "In mein Konto einloggen",
      loading: "Anmeldung..."
    },
    it: {
      title: "Accedi",
      submit: "Entra nel mio account",
      loading: "Accesso..."
    },
    en: {
      title: "Sign in",
      submit: "Enter my account",
      loading: "Signing in..."
    }
  };

  return labels[locale as keyof typeof labels] ?? labels.fr;
}
