import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DirectorAccess =
  | { status: "allowed"; adminId: string; email: string | null; fullName: string }
  | { status: "unauthenticated" }
  | { status: "denied"; email: string | null }
  | { status: "unavailable"; message: string };

export type AdminUserRow = {
  id: string;
  email: string | null;
  fullName: string;
  role: string;
  accountType: string;
  phone: string | null;
  suspendedAt: string | null;
  createdAt: string;
};

export type AdminProfessionalRow = {
  id: string;
  ownerId: string;
  ownerEmail: string | null;
  companyName: string;
  city: string | null;
  canton: string | null;
  website: string | null;
  publicEmail: string | null;
  suspendedAt: string | null;
  publishedAt: string | null;
  createdAt: string;
};

export type AdminListingRow = {
  id: string;
  title: string;
  status: string;
  priceChf: number;
  ownerId: string;
  ownerEmail: string | null;
  ownerName: string | null;
  sellerType: string;
  brokerName: string | null;
  createdAt: string;
  publishedAt: string | null;
};

export type AdminOverview = {
  users: AdminUserRow[];
  professionals: AdminProfessionalRow[];
  listings: AdminListingRow[];
  totals: {
    users: number;
    professionals: number;
    listings: number;
    publishedListings: number;
  };
};

type ProfileRow = {
  id: string;
  role: string;
  full_name?: string | null;
  phone?: string | null;
  suspended_at?: string | null;
  created_at: string;
  deleted_at?: string | null;
};

type ProfessionalRow = {
  id: string;
  user_id: string;
  company_name: string;
  city?: string | null;
  canton?: string | null;
  website?: string | null;
  public_email?: string | null;
  suspended_at?: string | null;
  published_at?: string | null;
  created_at: string;
  deleted_at?: string | null;
};

type ListingRow = {
  id: string;
  title: string;
  status: string;
  price_chf: number;
  owner_id: string;
  seller_type?: string | null;
  professional_profile_id?: string | null;
  created_at: string;
  published_at?: string | null;
  deleted_at?: string | null;
  profiles?: { full_name?: string | null } | null;
  professional_profiles?: { company_name?: string | null } | null;
};

export async function getDirectorAccess(): Promise<DirectorAccess> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "unavailable", message: "Supabase n'est pas configuré sur ce déploiement." };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !sessionData.user) return { status: "unauthenticated" };

  try {
    const admin = createSupabaseAdminClient();
    const { data: profile, error } = await admin
      .from("profiles")
      .select("id, role, full_name, suspended_at, deleted_at")
      .eq("id", sessionData.user.id)
      .maybeSingle<ProfileRow>();

    if (error) throw new Error(error.message);
    if (!profile || profile.role !== "admin" || profile.suspended_at || profile.deleted_at) {
      return { status: "denied", email: sessionData.user.email ?? null };
    }

    return {
      status: "allowed",
      adminId: profile.id,
      email: sessionData.user.email ?? null,
      fullName: profile.full_name || "Director Swissnaut"
    };
  } catch (error) {
    return {
      status: "unavailable",
      message: error instanceof Error ? error.message : "Le panneau directeur n'est pas disponible."
    };
  }
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const admin = createSupabaseAdminClient();
  const emailByUserId = await getAuthEmailMap();

  const [{ data: profiles }, { data: professionals }, { data: listings }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, role, full_name, phone, suspended_at, created_at, deleted_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    admin
      .from("professional_profiles")
      .select("id, user_id, company_name, city, canton, website, created_at, deleted_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    admin
      .from("listings")
      .select(`
        id,
        title,
        status,
        price_chf,
        owner_id,
        seller_type,
        professional_profile_id,
        created_at,
        published_at,
        deleted_at,
        profiles(full_name),
        professional_profiles(company_name)
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
  ]);

  const users = ((profiles || []) as ProfileRow[]).map((profile) => ({
    id: profile.id,
    email: emailByUserId.get(profile.id) || null,
    fullName: profile.full_name || "Sans nom",
    role: profile.role,
    accountType: profile.role,
    phone: profile.phone || null,
    suspendedAt: profile.suspended_at || null,
    createdAt: profile.created_at
  }));

  const proRows = ((professionals || []) as ProfessionalRow[]).map((profile) => ({
    id: profile.id,
    ownerId: profile.user_id,
    ownerEmail: emailByUserId.get(profile.user_id) || null,
    companyName: profile.company_name,
    city: profile.city || null,
    canton: profile.canton || null,
    website: profile.website || null,
    publicEmail: profile.public_email || null,
    suspendedAt: profile.suspended_at || null,
    publishedAt: profile.published_at || null,
    createdAt: profile.created_at
  }));

  const listingRows = ((listings || []) as ListingRow[]).map((listing) => ({
    id: listing.id,
    title: listing.title,
    status: listing.status,
    priceChf: Number(listing.price_chf),
    ownerId: listing.owner_id,
    ownerEmail: emailByUserId.get(listing.owner_id) || null,
    ownerName: listing.profiles?.full_name || null,
    sellerType: listing.seller_type || "private",
    brokerName: listing.professional_profiles?.company_name || null,
    createdAt: listing.created_at,
    publishedAt: listing.published_at || null
  }));

  return {
    users,
    professionals: proRows,
    listings: listingRows,
    totals: {
      users: users.length,
      professionals: proRows.length,
      listings: listingRows.length,
      publishedListings: listingRows.filter((listing) => listing.status === "published").length
    }
  };
}

async function getAuthEmailMap() {
  const emailByUserId = new Map<string, string>();

  try {
    const admin = createSupabaseAdminClient();
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    for (const user of data.users) {
      if (user.email) emailByUserId.set(user.id, user.email);
    }
  } catch {
    // The panel still works without Auth emails if the service role cannot list users.
  }

  return emailByUserId;
}
