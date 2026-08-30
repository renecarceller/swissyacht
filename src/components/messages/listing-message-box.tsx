"use client";

import { MessageCircle, X } from "lucide-react";
import { useActionState, useState } from "react";
import type { Listing } from "@/types/domain";
import { startListingConversationAction } from "@/lib/actions/messages";
import { openAccountModal } from "@/components/forms/welcome-account-modal";

export function ListingMessageBox({
  listing,
  locale,
  isAuthenticated
}: {
  listing: Listing;
  locale: string;
  isAuthenticated: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [state, action, pending] = useActionState(startListingConversationAction, { error: "" });
  const text = labels(locale);
  const returnTo = `/${locale}/listing/${listing.slug}`;

  if (!isAuthenticated) {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#8bd3ff] font-bold text-[#06233f] shadow-[0_3px_0_#58b9e8] transition hover:bg-[#aee2ff]"
        >
          <MessageCircle size={18} />
          {text.sendMessage}
        </button>
        {modalOpen ? (
          <div className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0f6fae]">Swissnaut</p>
                  <h3 className="mt-2 text-2xl font-bold text-navy">{text.loginTitle}</h3>
                </div>
                <button type="button" onClick={() => setModalOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-[#eef6fc]" aria-label={text.close}>
                  <X size={22} />
                </button>
              </div>
              <p className="mt-3 leading-6 text-[#607085]">{text.loginText}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    openAccountModal(returnTo, "login");
                  }}
                  className="flex h-11 items-center justify-center rounded-md bg-[#8bd3ff] font-bold text-[#06233f] shadow-[0_3px_0_#58b9e8]"
                >
                  {text.login}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    openAccountModal(returnTo, "register");
                  }}
                  className="flex h-11 items-center justify-center rounded-md border border-[#cbd7e4] font-bold text-navy"
                >
                  {text.create}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <form action={action} className="rounded-md border border-[#d9e2ec] bg-[#f8fbfe] p-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="listingId" value={listing.id} />
      <input type="hidden" name="listingSlug" value={listing.slug} />
      <label className="text-sm font-bold text-navy" htmlFor="listing-message">{text.messageLabel}</label>
      <textarea
        id="listing-message"
        name="body"
        rows={4}
        maxLength={3000}
        required
        placeholder={text.placeholder}
        className="mt-2 w-full rounded-md border border-[#cbd7e4] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#8bd3ff] focus:ring-2 focus:ring-[#8bd3ff]/45"
      />
      {state.error ? <p className="mt-2 text-sm font-semibold text-[#9b1c2b]">{state.error}</p> : null}
      <button
        disabled={pending}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#8bd3ff] font-bold text-[#06233f] shadow-[0_3px_0_#58b9e8] transition hover:bg-[#aee2ff] disabled:opacity-60"
      >
        <MessageCircle size={18} />
        {pending ? text.sending : text.sendMessage}
      </button>
    </form>
  );
}

function labels(locale: string) {
  const dictionary = {
    fr: {
      sendMessage: "Envoyer un message",
      messageLabel: "Votre message",
      placeholder: "Écrivez votre message au vendeur...",
      sending: "Envoi...",
      loginTitle: "Connectez-vous pour écrire au vendeur",
      loginText: "Le chat interne est réservé aux comptes Swissnaut. Après connexion, vous reviendrez automatiquement sur cette annonce.",
      login: "Se connecter",
      create: "Créer un compte",
      close: "Fermer"
    },
    de: {
      sendMessage: "Nachricht senden",
      messageLabel: "Ihre Nachricht",
      placeholder: "Schreiben Sie Ihre Nachricht an den Verkäufer...",
      sending: "Senden...",
      loginTitle: "Einloggen, um dem Verkäufer zu schreiben",
      loginText: "Der interne Chat ist Swissnaut-Konten vorbehalten. Nach dem Login kehren Sie automatisch zu diesem Inserat zurück.",
      login: "Anmelden",
      create: "Konto erstellen",
      close: "Schliessen"
    },
    it: {
      sendMessage: "Invia un messaggio",
      messageLabel: "Il tuo messaggio",
      placeholder: "Scrivi il tuo messaggio al venditore...",
      sending: "Invio...",
      loginTitle: "Accedi per scrivere al venditore",
      loginText: "La chat interna è riservata agli account Swissnaut. Dopo l'accesso tornerai automaticamente a questo annuncio.",
      login: "Accedi",
      create: "Crea account",
      close: "Chiudi"
    },
    en: {
      sendMessage: "Send a message",
      messageLabel: "Your message",
      placeholder: "Write your message to the seller...",
      sending: "Sending...",
      loginTitle: "Sign in to message the seller",
      loginText: "Internal chat is reserved for Swissnaut accounts. After login, you will return automatically to this listing.",
      login: "Sign in",
      create: "Create account",
      close: "Close"
    }
  };

  return dictionary[locale as keyof typeof dictionary] ?? dictionary.fr;
}
