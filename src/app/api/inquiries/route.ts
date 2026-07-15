import { NextResponse } from "next/server";
import { inquirySchema } from "@/lib/validation/listing";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid inquiry", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  return NextResponse.json({ ok: true, status: "stored", demoMode: true });
}
