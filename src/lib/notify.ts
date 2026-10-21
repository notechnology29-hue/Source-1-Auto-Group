import "server-only";
import { INQUIRY_LABELS } from "@/lib/handoff";
import type { InquiryType } from "@/types/database";

export interface LeadNotice {
  inquiry: InquiryType;
  vehicleTitle: string;
  stockNumber: string;
  name: string;
  phone: string;
  email: string;
  message?: string;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const TIMEOUT_MS = 8000;

function post(url: string, init: RequestInit) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
}

async function notifySlack(n: LeadNotice) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  const label = INQUIRY_LABELS[n.inquiry];
  // Slack mrkdwn only needs & < > escaped.
  const s = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const res = await post(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `New lead: ${label} for ${s(n.vehicleTitle)} (Stock # ${s(n.stockNumber)})`,
      blocks: [
        { type: "header", text: { type: "plain_text", text: `🚗 New lead: ${label}` } },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Vehicle*\n${s(n.vehicleTitle)}` },
            { type: "mrkdwn", text: `*Stock #*\n${s(n.stockNumber)}` },
            { type: "mrkdwn", text: `*Name*\n${s(n.name)}` },
            { type: "mrkdwn", text: `*Phone*\n<tel:${encodeURIComponent(n.phone)}|${s(n.phone)}>` },
            { type: "mrkdwn", text: `*Email*\n${s(n.email)}` },
          ],
        },
        ...(n.message ? [{ type: "section", text: { type: "mrkdwn", text: `*Message*\n${s(n.message)}` } }] : []),
      ],
    }),
  });
  if (!res.ok) throw new Error(`Slack responded ${res.status}`);
}

async function notifyEmail(n: LeadNotice) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  const from = process.env.LEAD_FROM_EMAIL;
  if (!key || !to || !from) return;
  const label = INQUIRY_LABELS[n.inquiry];
  const rows: [string, string][] = [
    ["Request", label],
    ["Vehicle", n.vehicleTitle],
    ["Stock #", n.stockNumber],
    ["Name", n.name],
    ["Phone", n.phone],
    ["Email", n.email],
    ...(n.message ? ([["Message", n.message]] as [string, string][]) : []),
  ];
  const html = `<div style="font-family:system-ui,sans-serif"><h2>New lead: ${esc(label)}</h2><table cellpadding="6">${rows
    .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${esc(v)}</td></tr>`)
    .join("")}</table></div>`;
  const res = await post("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to.split(",").map((e) => e.trim()).filter(Boolean),
      reply_to: n.email,
      subject: `New lead: ${label} - ${n.vehicleTitle} (#${n.stockNumber})`,
      html,
      text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}`);
}

/** Fire-and-forget: each channel is independent and never throws. */
export async function notifyNewLead(n: LeadNotice): Promise<void> {
  const results = await Promise.allSettled([notifySlack(n), notifyEmail(n)]);
  for (const r of results) {
    if (r.status === "rejected") console.error("Lead notification failed:", r.reason instanceof Error ? r.reason.message : r.reason);
  }
}
