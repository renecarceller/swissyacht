import { NextResponse } from "next/server";
import { getListings, parseFilters } from "@/lib/data/listings";
import { listingFormSchema } from "@/lib/validation/listing";

export async function GET(request: Request) {
  const filters = parseFilters(new URL(request.url).searchParams);
  return NextResponse.json(getListings(filters));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = listingFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid listing", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  return NextResponse.json({ ok: true, status: parsed.data.saveAsDraft ? "draft" : "pending_review" }, { status: 201 });
}
