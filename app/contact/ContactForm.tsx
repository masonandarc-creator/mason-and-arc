"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";

const formCopy = {
  en: {
    eyebrow: "02 — Inquiry",
    title: "Tell us about your project.",
    name: "Name",
    email: "Email",
    phone: "Phone",
    company: "Company",
    inquiry: "Project / Inquiry",
    placeholder: "Tell us briefly about your project, scope, location, or what you need.",
    sending: "Sending…",
    send: "Send Inquiry ↗",
    success: "Thank you. We’ll get back to you shortly.",
    error: "We couldn’t receive the inquiry right now. Please email us directly.",
    privacyPrefix: "By sending this inquiry, you agree that Mason & Arc may use the details provided to respond. Read our",
    privacyLink: "Privacy Notice",
  },
  ar: {
    eyebrow: "02 — الاستفسار",
    title: "حدّثنا عن مشروعك.",
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    company: "الشركة",
    inquiry: "المشروع / الاستفسار",
    placeholder: "اكتب لنا نبذة عن المشروع أو نطاقه أو موقعه أو ما تحتاجه.",
    sending: "جارٍ الإرسال…",
    send: "إرسال الاستفسار ↗",
    success: "شكرًا لك. سنتواصل معك قريبًا.",
    error: "تعذر استلام الاستفسار الآن. يرجى مراسلتنا مباشرة عبر البريد الإلكتروني.",
    privacyPrefix: "بإرسال هذا الاستفسار، فإنك توافق على استخدام Mason & Arc للبيانات المقدمة للرد عليك. اقرأ",
    privacyLink: "إشعار الخصوصية",
  },
  it: {
    eyebrow: "02 — Richiesta",
    title: "Raccontaci il tuo progetto.",
    name: "Nome",
    email: "Email",
    phone: "Telefono",
    company: "Società",
    inquiry: "Progetto / Richiesta",
    placeholder: "Descrivi brevemente il progetto, l’ambito, il luogo o ciò di cui hai bisogno.",
    sending: "Invio…",
    send: "Invia la richiesta ↗",
    success: "Grazie. Ti contatteremo al più presto.",
    error: "Non è stato possibile ricevere la richiesta. Scrivici direttamente via email.",
    privacyPrefix: "Inviando questa richiesta, accetti che Mason & Arc utilizzi i dati forniti per risponderti. Leggi la nostra",
    privacyLink: "Informativa sulla privacy",
  },
} as const;

export default function ContactForm() {
  const { locale } = useLocale();
  const copy = formCopy[locale];
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await response.json();
      if (!response.ok) throw new Error(copy.error);
      form.reset();
      setStatus("success");
      setMessage(copy.success);
    } catch {
      setStatus("error");
      setMessage(copy.error);
    }
  }

  return (
    <section className="bg-[#f8f7f4] px-8 pb-28 md:px-12 md:pb-40 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.35fr_1.65fr] lg:gap-x-16">
          <span className="text-[9px] uppercase tracking-[0.35em] text-neutral-400">{copy.eyebrow}</span>
          <div>
            <h2 className="max-w-4xl text-4xl font-light tracking-[-0.04em] text-neutral-900 md:text-6xl">{copy.title}</h2>
            <form onSubmit={handleSubmit} className="mt-16 border-t border-neutral-300 pt-8 text-neutral-900">
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <div className="grid gap-8 md:grid-cols-2">
                <Field name="name" label={copy.name} required />
                <Field name="email" label={copy.email} type="email" required />
                <Field name="phone" label={copy.phone} type="tel" />
                <Field name="company" label={copy.company} />
              </div>
              <label className="mt-8 block">
                <span className="text-[9px] uppercase tracking-[0.3em] text-neutral-500">{copy.inquiry}</span>
                <textarea name="notes" required rows={5} className="mt-3 w-full resize-y border-b border-neutral-300 bg-transparent px-0 py-3 text-sm font-light text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-neutral-900" placeholder={copy.placeholder} />
              </label>
              <p className="mt-5 max-w-2xl text-[11px] leading-5 text-neutral-500">
                {copy.privacyPrefix}{" "}
                <Link href="/privacy" className="underline underline-offset-4 transition-opacity hover:opacity-60">
                  {copy.privacyLink}
                </Link>.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p aria-live="polite" className={`text-xs ${status === "error" ? "text-red-600" : "text-neutral-500"}`}>{message}</p>
                <button disabled={status === "sending"} type="submit" className="inline-flex items-center justify-center rounded-full border border-neutral-900 px-7 py-3 text-[9px] uppercase tracking-[0.25em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-wait disabled:opacity-50">
                  {status === "sending" ? copy.sending : copy.send}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[9px] uppercase tracking-[0.3em] text-neutral-500">{label}{required ? " *" : ""}</span>
      <input name={name} type={type} required={required} className="mt-3 w-full border-b border-neutral-300 bg-transparent px-0 py-3 text-sm font-light text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-neutral-900" />
    </label>
  );
}
