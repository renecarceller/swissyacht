"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { locales } from "@/lib/data/reference";

export type MessageActionState = {
  error: string;
};

type ListingForMessage = {
  id: string;
  owner_id: string;
  slug: string;
  status: string;
  deleted_at?: string | null;
};

type ConversationForMessage = {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  status: string;
};

export async function startListingConversationAction(_state: MessageActionState, formData: FormData): Promise<MessageActionState> {
  const locale = localeFromForm(formData);
  const listingId = String(formData.get("listingId") || "");
  const listingSlug = String(formData.get("listingSlug") || "");
  const body = normalizeBody(formData.get("body"));

  if (!body) return { error: labels(locale).empty };

  const userId = await currentUserId();
  if (!userId) {
    const returnTo = `/${locale}/listing/${listingSlug}`;
    redirect(`/${locale}/listing/${listingSlug}?account=1&mode=login&returnTo=${encodeURIComponent(returnTo)}` as never);
  }

  const admin = createSupabaseAdminClient();
  const { data: listing } = await admin
    .from("listings")
    .select("id, owner_id, slug, status, deleted_at")
    .eq("id", listingId)
    .maybeSingle<ListingForMessage>();

  if (!listing || listing.deleted_at || listing.status !== "published") return { error: labels(locale).listing };
  if (listing.owner_id === userId) return { error: labels(locale).ownListing };

  const { data: existing } = await admin
    .from("conversations")
    .select("id, buyer_id, seller_id, listing_id, status")
    .eq("buyer_id", userId)
    .eq("seller_id", listing.owner_id)
    .eq("listing_id", listing.id)
    .maybeSingle<ConversationForMessage>();

  let conversationId = existing?.id;
  if (!conversationId) {
    const { data: created, error } = await admin
      .from("conversations")
      .insert({
        listing_id: listing.id,
        buyer_id: userId,
        seller_id: listing.owner_id,
        status: "open"
      })
      .select("id")
      .single<{ id: string }>();
    if (error || !created) {
      console.error("Conversation creation failed", error);
      return { error: labels(locale).generic };
    }
    conversationId = created.id;
  }

  const sent = await appendMessage(conversationId, userId, listing.owner_id, body);
  if (!sent) return { error: labels(locale).generic };

  revalidatePath(`/${locale}/dashboard/messages`);
  redirect(`/${locale}/dashboard/messages?conversation=${conversationId}` as never);
}

export async function sendConversationMessageAction(_state: MessageActionState, formData: FormData): Promise<MessageActionState> {
  const locale = localeFromForm(formData);
  const conversationId = String(formData.get("conversationId") || "");
  const body = normalizeBody(formData.get("body"));
  if (!body) return { error: labels(locale).empty };

  const userId = await currentUserId();
  if (!userId) redirect(`/${locale}?account=1&mode=login&returnTo=${encodeURIComponent(`/${locale}/dashboard/messages`)}` as never);

  const admin = createSupabaseAdminClient();
  const { data: conversation } = await admin
    .from("conversations")
    .select("id, buyer_id, seller_id, listing_id, status")
    .eq("id", conversationId)
    .maybeSingle<ConversationForMessage>();

  if (!conversation || conversation.status !== "open" || (conversation.buyer_id !== userId && conversation.seller_id !== userId)) {
    return { error: labels(locale).conversation };
  }

  const recipientId = conversation.buyer_id === userId ? conversation.seller_id : conversation.buyer_id;
  const sent = await appendMessage(conversation.id, userId, recipientId, body);
  if (!sent) return { error: labels(locale).generic };

  revalidatePath(`/${locale}/dashboard/messages`);
  redirect(`/${locale}/dashboard/messages?conversation=${conversation.id}` as never);
}

async function appendMessage(conversationId: string, senderId: string, recipientId: string, body: string) {
  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { data: message, error } = await admin
    .from("conversation_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !message) {
    console.error("Message creation failed", error);
    return false;
  }

  await admin
    .from("conversations")
    .update({ last_message: body.slice(0, 500), last_message_at: now, updated_at: now })
    .eq("id", conversationId);
  await admin
    .from("message_notifications")
    .insert({
      user_id: recipientId,
      conversation_id: conversationId,
      message_id: message.id,
      type: "new_message",
      email_status: "pending"
    });

  return true;
}

async function currentUserId() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id || null;
  } catch (error) {
    console.error("Message action session read failed", error);
    return null;
  }
}

function normalizeBody(value: FormDataEntryValue | null) {
  const body = String(value || "").trim();
  return body.length ? body.slice(0, 3000) : "";
}

function localeFromForm(formData: FormData) {
  const rawLocale = String(formData.get("locale") || "fr");
  return locales.includes(rawLocale as (typeof locales)[number]) ? rawLocale : "fr";
}

function labels(locale: string) {
  const dictionary = {
    fr: {
      empty: "Écrivez un message avant de l'envoyer.",
      listing: "Cette annonce n'est pas disponible.",
      conversation: "Cette conversation n'est pas disponible.",
      ownListing: "Vous ne pouvez pas envoyer un message à votre propre annonce.",
      generic: "Le message n'a pas pu être envoyé. Réessayez."
    },
    de: {
      empty: "Schreiben Sie eine Nachricht, bevor Sie sie senden.",
      listing: "Dieses Inserat ist nicht verfügbar.",
      conversation: "Diese Unterhaltung ist nicht verfügbar.",
      ownListing: "Sie können Ihrer eigenen Anzeige keine Nachricht senden.",
      generic: "Die Nachricht konnte nicht gesendet werden. Bitte erneut versuchen."
    },
    it: {
      empty: "Scrivi un messaggio prima di inviarlo.",
      listing: "Questo annuncio non è disponibile.",
      conversation: "Questa conversazione non è disponibile.",
      ownListing: "Non puoi inviare un messaggio al tuo annuncio.",
      generic: "Il messaggio non è stato inviato. Riprova."
    },
    en: {
      empty: "Write a message before sending it.",
      listing: "This listing is not available.",
      conversation: "This conversation is not available.",
      ownListing: "You cannot send a message to your own listing.",
      generic: "The message could not be sent. Try again."
    }
  };

  return dictionary[locale as keyof typeof dictionary] ?? dictionary.fr;
}
