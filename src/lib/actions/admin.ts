"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/lib/data/reference";
import { getDirectorAccess } from "@/lib/data/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminActionState = {
  error?: string;
  success?: string;
};

export async function archiveListingAsDirectorFormAction(formData: FormData) {
  await archiveListingAsDirectorAction({}, formData);
}

export async function archiveListingAsDirectorAction(
  _state: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const access = await getDirectorAccess();
  if (access.status === "unauthenticated") {
    return { error: "Connectez-vous avec le compte Director Swissnaut avant de supprimer une annonce." };
  }
  if (access.status !== "allowed") {
    return { error: "Cette action est réservée uniquement au compte Director Swissnaut." };
  }

  const listingId = String(formData.get("listingId") || "");
  if (!listingId) return { error: "Annonce introuvable." };

  try {
    const admin = createSupabaseAdminClient();
    const now = new Date().toISOString();
    const { error } = await admin
      .from("listings")
      .update({
        status: "archived",
        deleted_at: now,
        updated_at: now
      })
      .eq("id", listingId);

    if (error) throw new Error(error.message);

    await admin.from("admin_actions").insert({
      admin_id: access.adminId,
      target_table: "listings",
      target_id: listingId,
      action: "archive_listing",
      metadata: {
        source: "director_panel",
        reason: "removed_by_director"
      }
    });

    for (const locale of locales) {
      revalidatePath(`/${locale}`);
      revalidatePath(`/${locale}/boats`);
      revalidatePath(`/${locale}/admin`);
    }

    return { success: "Annonce supprimée de la web." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "L'annonce n'a pas pu être supprimée."
    };
  }
}
