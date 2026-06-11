import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const NOTIFY_EMAIL = Deno.env.get("NOTIFY_EMAIL");

interface AttendanceRecord {
  name: string;
  status: string;
  created_at: string;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: AttendanceRecord | null;
  old_record: AttendanceRecord | null;
}

function statusEmoji(status: string): string {
  if (status === "confirmed") return "✅";
  if (status === "maybe") return "🤔";
  return "❌";
}

function buildSubject(payload: WebhookPayload): string {
  const name = payload.record?.name ?? payload.old_record?.name ?? "Someone";
  if (payload.type === "INSERT") {
    return `⚽ ${name} just joined the game`;
  }
  if (payload.type === "DELETE") {
    return `❌ ${name} dropped out`;
  }
  // UPDATE
  const oldStatus = payload.old_record?.status ?? "unknown";
  const newStatus = payload.record?.status ?? "unknown";
  return `🔄 ${name} changed: ${oldStatus} → ${newStatus}`;
}

function buildHtml(payload: WebhookPayload): string {
  const name = payload.record?.name ?? payload.old_record?.name ?? "Someone";
  const timestamp = new Date().toLocaleString("en-GB", {
    timeZone: "Asia/Riyadh",
    dateStyle: "full",
    timeStyle: "short",
  });

  let actionLine = "";
  if (payload.type === "INSERT") {
    const status = payload.record!.status;
    actionLine = `<b>${name}</b> marked themselves as <b>${statusEmoji(status)} ${status}</b>.`;
  } else if (payload.type === "DELETE") {
    actionLine = `<b>${name}</b> removed their RSVP (was <b>${payload.old_record?.status}</b>).`;
  } else {
    const oldStatus = payload.old_record?.status ?? "";
    const newStatus = payload.record?.status ?? "";
    actionLine = `<b>${name}</b> changed from <b>${statusEmoji(oldStatus)} ${oldStatus}</b> to <b>${statusEmoji(newStatus)} ${newStatus}</b>.`;
  }

  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px;">
      <h2 style="margin:0 0 16px;color:#1a202c;">⚽ Football Confirmer Update</h2>
      <p style="font-size:16px;color:#2d3748;">${actionLine}</p>
      <p style="font-size:13px;color:#718096;margin-top:24px;">${timestamp} (Riyadh time)</p>
    </div>
  `;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!RESEND_API_KEY || !NOTIFY_EMAIL) {
    console.error("Missing RESEND_API_KEY or NOTIFY_EMAIL env vars");
    return new Response("Server misconfigured", { status: 500 });
  }

  const subject = buildSubject(payload);
  const html = buildHtml(payload);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Football Confirmer <onboarding@resend.dev>",
      to: [NOTIFY_EMAIL],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return new Response("Failed to send email", { status: 502 });
  }

  return new Response("OK", { status: 200 });
});
