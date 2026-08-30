import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type MessageConversationSummary = {
  id: string;
  listingId: string;
  listingSlug: string;
  listingTitle: string;
  listingImageUrl?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  otherParticipantName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: string;
};

export type ConversationMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

export type MessageInbox = {
  userId: string;
  conversations: MessageConversationSummary[];
  selectedConversation?: MessageConversationSummary;
  messages: ConversationMessage[];
};

type ConversationRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
};

type ListingRow = {
  id: string;
  slug: string;
  title: string | null;
  brand_name: string | null;
  model_name: string | null;
  professional_profile_id: string | null;
  listing_images?: {
    public_url: string | null;
    storage_path: string | null;
    is_primary: boolean | null;
    sort_order: number | null;
  }[] | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
};

type ProfessionalRow = {
  id: string;
  company_name: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export async function getUnreadMessageCount() {
  try {
    const user = await getCurrentUserId();
    if (!user) return 0;

    const admin = createSupabaseAdminClient();
    const { data: conversations } = await admin
      .from("conversations")
      .select("id")
      .or(`buyer_id.eq.${user},seller_id.eq.${user}`);

    const ids = (conversations || []).map((conversation) => conversation.id).filter(Boolean);
    if (!ids.length) return 0;

    const { count } = await admin
      .from("conversation_messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", ids)
      .neq("sender_id", user)
      .is("read_at", null);

    return count || 0;
  } catch {
    return 0;
  }
}

export async function getMessageInbox(selectedConversationId?: string): Promise<MessageInbox | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const admin = createSupabaseAdminClient();
  const { data: conversationsData } = await admin
    .from("conversations")
    .select("id, listing_id, buyer_id, seller_id, status, last_message, last_message_at, created_at")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const conversations = (conversationsData || []) as ConversationRow[];
  if (!conversations.length) return { userId, conversations: [], messages: [] };

  const listingIds = unique(conversations.map((conversation) => conversation.listing_id));
  const profileIds = unique(conversations.flatMap((conversation) => [conversation.buyer_id, conversation.seller_id]));

  const [{ data: listingsData }, { data: profilesData }, { data: unreadMessagesData }] = await Promise.all([
    admin
      .from("listings")
      .select("id, slug, title, brand_name, model_name, professional_profile_id, listing_images(public_url, storage_path, is_primary, sort_order)")
      .in("id", listingIds),
    admin.from("profiles").select("id, full_name").in("id", profileIds),
    admin
      .from("conversation_messages")
      .select("conversation_id")
      .in("conversation_id", conversations.map((conversation) => conversation.id))
      .neq("sender_id", userId)
      .is("read_at", null)
  ]);

  const listings = new Map((listingsData || []).map((listing) => [listing.id, listing as ListingRow]));
  const profiles = new Map((profilesData || []).map((profile) => [profile.id, profile as ProfileRow]));
  const professionalIds = unique((listingsData || []).map((listing) => (listing as ListingRow).professional_profile_id).filter(Boolean) as string[]);
  const { data: professionalsData } = professionalIds.length
    ? await admin.from("professional_profiles").select("id, company_name").in("id", professionalIds)
    : { data: [] };
  const professionals = new Map((professionalsData || []).map((profile) => [profile.id, profile as ProfessionalRow]));
  const unreadCounts = (unreadMessagesData || []).reduce<Record<string, number>>((counts, message) => {
    counts[message.conversation_id] = (counts[message.conversation_id] || 0) + 1;
    return counts;
  }, {});

  const summaries = conversations.map((conversation) => {
    const listing = listings.get(conversation.listing_id);
    const professional = listing?.professional_profile_id ? professionals.get(listing.professional_profile_id) : undefined;
    const buyerName = profiles.get(conversation.buyer_id)?.full_name || "Acheteur";
    const sellerName = professional?.company_name || profiles.get(conversation.seller_id)?.full_name || "Vendeur";
    const otherParticipantName = userId === conversation.seller_id ? buyerName : sellerName;
    const image = primaryImage(listing);

    return {
      id: conversation.id,
      listingId: conversation.listing_id,
      listingSlug: listing?.slug || "",
      listingTitle: listing?.title || `${listing?.brand_name || ""} ${listing?.model_name || ""}`.trim() || "Annonce",
      listingImageUrl: image,
      buyerId: conversation.buyer_id,
      buyerName,
      sellerId: conversation.seller_id,
      sellerName,
      otherParticipantName,
      lastMessage: conversation.last_message || "",
      lastMessageAt: conversation.last_message_at || conversation.created_at,
      unreadCount: unreadCounts[conversation.id] || 0,
      status: conversation.status
    } satisfies MessageConversationSummary;
  });

  const selected = summaries.find((conversation) => conversation.id === selectedConversationId) || summaries[0];
  await markConversationRead(selected.id, userId);

  const { data: messagesData } = await admin
    .from("conversation_messages")
    .select("id, conversation_id, sender_id, body, read_at, created_at")
    .eq("conversation_id", selected.id)
    .order("created_at", { ascending: true });

  return {
    userId,
    conversations: summaries.map((conversation) => conversation.id === selected.id ? { ...conversation, unreadCount: 0 } : conversation),
    selectedConversation: { ...selected, unreadCount: 0 },
    messages: ((messagesData || []) as MessageRow[]).map((message) => ({
      id: message.id,
      senderId: message.sender_id,
      body: message.body,
      createdAt: message.created_at,
      readAt: message.read_at
    }))
  };
}

export async function markConversationRead(conversationId: string, userId: string) {
  const admin = createSupabaseAdminClient();
  const { data: conversation } = await admin
    .from("conversations")
    .select("buyer_id, seller_id")
    .eq("id", conversationId)
    .maybeSingle<{ buyer_id: string; seller_id: string }>();

  if (!conversation || (conversation.buyer_id !== userId && conversation.seller_id !== userId)) return;

  const now = new Date().toISOString();
  await admin
    .from("conversation_messages")
    .update({ read_at: now })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("read_at", null);
  await admin
    .from("message_notifications")
    .update({ read_at: now })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .is("read_at", null);
  await admin
    .from("conversations")
    .update(userId === conversation.buyer_id ? { buyer_last_seen_at: now } : { seller_last_seen_at: now })
    .eq("id", conversationId);
}

async function getCurrentUserId() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id || null;
  } catch (error) {
    console.error("Message session read failed", error);
    return null;
  }
}

function primaryImage(listing?: ListingRow) {
  const images = listing?.listing_images || [];
  const sorted = [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || Number(a.sort_order || 0) - Number(b.sort_order || 0));
  const image = sorted.find((item) => item.public_url || item.storage_path);
  return image?.public_url || image?.storage_path || undefined;
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
