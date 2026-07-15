import { Send } from "lucide-react";
import { createInquiryAction } from "@/lib/actions/inquiries";
import type { Listing } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { ui } from "@/i18n/ui";

export function InquiryForm({ listing, locale }: { listing: Listing; locale: string }) {
  const text = ui(locale);
  return (
    <form action={createInquiryAction} className="grid gap-4 rounded-md border border-[#d9e2ec] bg-white p-5">
      <input type="hidden" name="listingId" value={listing.id} />
      <input type="hidden" name="listingSlug" value={listing.slug} />
      <input type="hidden" name="sellerId" value={listing.seller.id} />
      <h2 className="text-lg font-bold text-navy">{text.listing.contactSeller}</h2>
      <Field label={text.common.name}><Input name="name" required /></Field>
      <Field label={text.common.email}><Input name="email" type="email" required /></Field>
      <Field label={text.common.optionalPhone}><Input name="phone" /></Field>
      <Field label={text.common.message}><Textarea name="message" required defaultValue={`${text.listing.defaultMessage} ${listing.title}.`} /></Field>
      <label className="flex items-start gap-2 text-sm text-[#324963]">
        <input name="privacyConsent" type="checkbox" required className="mt-1" />
        {text.listing.privacyConsent}
      </label>
      <Button className="w-full"><Send size={17} />{text.listing.sendInquiry}</Button>
    </form>
  );
}
