import { randomUUID } from "crypto";
import { after, NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { sendGoogleMail } from "@/lib/server/googleMail";

export const runtime = "nodejs";

const MAX = { name: 120, email: 254, phone: 60, company: 160, notes: 5000 };

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (clean(body.website, 100)) return NextResponse.json({ ok: true });

    const name = clean(body.name, MAX.name);
    const email = clean(body.email, MAX.email).toLowerCase();
    const phone = clean(body.phone, MAX.phone);
    const company = clean(body.company, MAX.company);
    const notes = clean(body.notes, MAX.notes);

    if (!name || !email || !notes) return NextResponse.json({ error: "Name, email and inquiry are required." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

    const details = [phone && `Phone: ${phone}`, company && `Company: ${company}`, notes && `Inquiry: ${notes}`].filter(Boolean).join("\n");
    const leadId = randomUUID();
    await query(
      `INSERT INTO leads (id, company, status, contact_name, email, notes) VALUES ($1, $2, $3, $4, $5, $6)`,
      [leadId, company || "Website Inquiry", "New", name, email, details],
    );

    try {
      await query(
        `INSERT INTO notifications (id, user_id, type, priority, title, body) VALUES ($1, NULL, $2, $3, $4, $5)`,
        [randomUUID(), "Website Inquiry", "High", `New website inquiry from ${name}`, `${company || "Direct inquiry"} · ${email}`],
      );
    } catch (notificationError) {
      console.error("Lead notification failed", { leadId, notificationError });
    }

    const safeName = name.replace(/[\r\n]+/g, " ");
    after(async () => {
      try {
        await sendGoogleMail({
          to: process.env.LEADS_NOTIFICATION_EMAIL || "Masonandarc@gmail.com",
          subject: `New Mason & Arc website inquiry — ${safeName}`,
          text: [
            "A new inquiry was submitted through masonandarc.com.",
            "",
            `Name: ${name}`,
            `Email: ${email}`,
            `Phone: ${phone || "Not provided"}`,
            `Company: ${company || "Not provided"}`,
            "",
            "Project / inquiry:",
            notes,
            "",
            `Lead ID: ${leadId}`,
          ].join("\n"),
        });
      } catch (emailError) {
        console.error("Lead email notification failed", { leadId, emailError });
      }
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Lead submission failed", error);
    return NextResponse.json({ error: "We couldn’t receive the inquiry right now. Please email us directly." }, { status: 503 });
  }
}
