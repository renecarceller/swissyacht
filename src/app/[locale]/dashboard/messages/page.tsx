/* eslint-disable @next/next/no-img-element */

import { Inbox, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ConversationMessageForm } from "@/components/messages/conversation-message-form";
import { getMessageInbox } from "@/lib/data/messages";

export default async function MessagesPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ conversation?: string }>;
}) {
  const { locale } = await params;
  const { conversation } = await searchParams;
  const inbox = await getMessageInbox(conversation);
  const labels = pageLabels(locale);

  if (!inbox) {
    return (
      <main className="container-shell py-8">
        <section className="rounded-md border border-[#d9e2ec] bg-white p-6">
          <h1 className="text-3xl font-bold text-navy">{labels.title}</h1>
          <p className="mt-3 text-[#607085]">{labels.loginRequired}</p>
          <Link href="/login" locale={locale} className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-[#8bd3ff] px-5 font-bold text-[#06233f] shadow-[0_3px_0_#58b9e8]">
            {labels.login}
          </Link>
        </section>
      </main>
    );
  }

  const selected = inbox.selectedConversation;

  return (
    <main className="container-shell py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-md bg-[#e8f6ff] text-[#0f6fae]"><MessageCircle size={24} /></span>
        <div>
          <h1 className="text-3xl font-bold text-navy">{labels.title}</h1>
          <p className="text-[#607085]">{labels.intro}</p>
        </div>
      </div>

      {inbox.conversations.length ? (
        <section className="grid min-h-[620px] overflow-hidden rounded-md border border-[#d9e2ec] bg-white lg:grid-cols-[360px_1fr]">
          <aside className="border-b border-[#d9e2ec] lg:border-b-0 lg:border-r">
            <div className="border-b border-[#d9e2ec] p-4 text-sm font-bold uppercase tracking-[0.16em] text-[#607085]">{labels.conversations}</div>
            <div className="max-h-[620px] overflow-y-auto">
              {inbox.conversations.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/messages?conversation=${item.id}`}
                  locale={locale}
                  className={`flex gap-3 border-b border-[#edf2f7] p-4 transition hover:bg-[#f6fbff] ${selected?.id === item.id ? "bg-[#e8f6ff]" : "bg-white"}`}
                >
                  <ConversationImage src={item.listingImageUrl} title={item.listingTitle} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-bold text-navy">{item.listingTitle}</p>
                      {item.unreadCount ? <span className="grid min-w-6 place-items-center rounded-full bg-[#e51b34] px-2 text-xs font-bold text-white">{item.unreadCount}</span> : null}
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold text-[#607085]">{item.otherParticipantName}</p>
                    <p className="mt-1 truncate text-sm text-[#607085]">{item.lastMessage || labels.noMessage}</p>
                    <p className="mt-2 text-xs text-[#8a98aa]">{formatDate(item.lastMessageAt, locale)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </aside>

          <section className="flex min-h-[620px] flex-col">
            {selected ? (
              <>
                <header className="flex items-center gap-3 border-b border-[#d9e2ec] p-4">
                  <ConversationImage src={selected.listingImageUrl} title={selected.listingTitle} large />
                  <div className="min-w-0 flex-1">
                    <Link href={`/listing/${selected.listingSlug}`} locale={locale} className="block truncate text-lg font-bold text-navy hover:underline">
                      {selected.listingTitle}
                    </Link>
                    <p className="truncate text-sm text-[#607085]">{labels.with} {selected.otherParticipantName}</p>
                  </div>
                </header>
                <div className="flex-1 space-y-3 overflow-y-auto bg-[#f6f8fb] p-4">
                  {inbox.messages.map((message) => {
                    const own = message.senderId === inbox.userId;
                    return (
                      <div key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[78%] rounded-md px-4 py-3 shadow-sm ${own ? "bg-[#8bd3ff] text-[#06233f]" : "bg-white text-[#21354b]"}`}>
                          <p className="whitespace-pre-wrap leading-6">{message.body}</p>
                          <div className={`mt-2 text-xs ${own ? "text-[#16445f]" : "text-[#77869a]"}`}>
                            {formatTime(message.createdAt, locale)}
                            {own ? ` · ${message.readAt ? labels.read : labels.sent}` : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <ConversationMessageForm locale={locale} conversationId={selected.id} />
              </>
            ) : null}
          </section>
        </section>
      ) : (
        <section className="rounded-md border border-[#d9e2ec] bg-white p-8 text-center">
          <Inbox className="mx-auto h-10 w-10 text-[#8bd3ff]" />
          <h2 className="mt-4 text-2xl font-bold text-navy">{labels.emptyTitle}</h2>
          <p className="mt-2 text-[#607085]">{labels.emptyText}</p>
        </section>
      )}
    </main>
  );
}

function ConversationImage({ src, title, large = false }: { src?: string; title: string; large?: boolean }) {
  const size = large ? "size-16" : "size-14";
  return src ? (
    <img src={src} alt={title} className={`${size} shrink-0 rounded-md border border-[#d9e2ec] object-cover`} />
  ) : (
    <span className={`${size} grid shrink-0 place-items-center rounded-md border border-[#d9e2ec] bg-[#eef6fc] text-sm font-bold text-navy`}>SN</span>
  );
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(`${locale}-CH`, { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function formatTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(`${locale}-CH`, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function pageLabels(locale: string) {
  const labels = {
    fr: {
      title: "Messages",
      intro: "Conversations internes liées aux annonces.",
      loginRequired: "Connectez-vous pour consulter vos messages.",
      login: "Se connecter",
      conversations: "Conversations",
      with: "Avec",
      noMessage: "Aucun message",
      read: "lu",
      sent: "envoyé",
      emptyTitle: "Aucune conversation",
      emptyText: "Vos messages avec les vendeurs et acheteurs apparaîtront ici."
    },
    de: {
      title: "Nachrichten",
      intro: "Interne Unterhaltungen zu Inseraten.",
      loginRequired: "Melden Sie sich an, um Ihre Nachrichten zu sehen.",
      login: "Anmelden",
      conversations: "Unterhaltungen",
      with: "Mit",
      noMessage: "Keine Nachricht",
      read: "gelesen",
      sent: "gesendet",
      emptyTitle: "Keine Unterhaltung",
      emptyText: "Ihre Nachrichten mit Verkäufern und Käufern erscheinen hier."
    },
    it: {
      title: "Messaggi",
      intro: "Conversazioni interne collegate agli annunci.",
      loginRequired: "Accedi per consultare i messaggi.",
      login: "Accedi",
      conversations: "Conversazioni",
      with: "Con",
      noMessage: "Nessun messaggio",
      read: "letto",
      sent: "inviato",
      emptyTitle: "Nessuna conversazione",
      emptyText: "I messaggi con venditori e acquirenti appariranno qui."
    },
    en: {
      title: "Messages",
      intro: "Internal conversations linked to listings.",
      loginRequired: "Sign in to view your messages.",
      login: "Sign in",
      conversations: "Conversations",
      with: "With",
      noMessage: "No message",
      read: "read",
      sent: "sent",
      emptyTitle: "No conversations",
      emptyText: "Your messages with sellers and buyers will appear here."
    }
  };

  return labels[locale as keyof typeof labels] ?? labels.fr;
}
