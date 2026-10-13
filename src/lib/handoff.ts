import { BRAND } from "@/lib/constants";
import type { InquiryType } from "@/types/database";

export interface HandoffInput {
  inquiry: InquiryType;
  vehicleTitle: string;
  stockNumber: string;
  name: string;
  phone: string;
  email: string;
}

export const INQUIRY_LABELS: Record<InquiryType, string> = {
  hold_ride: "24-Hour Hold",
  test_drive: "VIP Test Drive",
};

export function buildHandoffMessage(h: HandoffInput): string {
  const ask =
    h.inquiry === "hold_ride"
      ? "I'd like to put a 24-hour hold on"
      : "I'd like to book a VIP test drive for";
  return [
    `Hi Source 1 Auto! ${ask} the ${h.vehicleTitle}.`,
    `Stock #: ${h.stockNumber}`,
    `Name: ${h.name}`,
    `Phone: ${h.phone}`,
    `Email: ${h.email}`,
  ].join("\n");
}

export function buildWhatsAppUrl(h: HandoffInput): string {
  return `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(buildHandoffMessage(h))}`;
}

export function buildSmsUrl(h: HandoffInput): string {
  return `sms:+${BRAND.whatsappNumber}?&body=${encodeURIComponent(buildHandoffMessage(h))}`;
}
