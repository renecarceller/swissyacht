"use client";

import { Send } from "lucide-react";
import { useActionState } from "react";
import { sendConversationMessageAction } from "@/lib/actions/messages";

export function ConversationMessageForm({ locale, conversationId }: { locale: string; conversationId: string }) {
  const [state, action, pending] = useActionState(sendConversationMessageAction, { error: "" });
  const labels = formLabels(locale);

  return (
    <form action={action} className="border-t border-[#d9e2ec] bg-white p-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="conversationId" value={conversationId} />
      {state.error ? <p className="mb-3 rounded-md bg-[#fff4f4] px-3 py-2 text-sm font-semibold text-[#8a1f2d]">{state.error}</p> : null}
      <div className="flex gap-3">
        <textarea
          name="body"
          rows={2}
          maxLength={3000}
          required
          placeholder={labels.placeholder}
          className="min-h-12 flex-1 resize-none rounded-md border border-[#cbd7e4] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#8bd3ff] focus:ring-2 focus:ring-[#8bd3ff]/45"
        />
        <button
          disabled={pending}
          className="inline-flex h-12 min-w-12 items-center justify-center rounded-md bg-[#8bd3ff] px-4 font-bold text-[#06233f] shadow-[0_3px_0_#58b9e8] transition hover:bg-[#aee2ff] disabled:opacity-60"
          aria-label={labels.send}
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}

function formLabels(locale: string) {
  const labels = {
    fr: { placeholder: "Écrire un message...", send: "Envoyer" },
    de: { placeholder: "Nachricht schreiben...", send: "Senden" },
    it: { placeholder: "Scrivi un messaggio...", send: "Invia" },
    en: { placeholder: "Write a message...", send: "Send" }
  };

  return labels[locale as keyof typeof labels] ?? labels.fr;
}
