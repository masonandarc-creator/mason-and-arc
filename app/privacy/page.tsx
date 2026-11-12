"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";

const privacyCopy = {
  en: {
    eyebrow: "Privacy",
    title: "Privacy Notice.",
    intro: "This notice explains how Mason & Arc uses information submitted through this website.",
    sections: [
      ["Information we collect", "When you contact us, we may collect your name, email address, phone number, company, and the project information you choose to provide."],
      ["How we use it", "We use this information only to review your inquiry, respond to you, and manage the potential project relationship."],
      ["Storage and sharing", "Inquiry details are stored in the studio’s secured project-management system. We do not sell personal information. We share it only with service providers when needed to operate the website or respond to your request."],
      ["Your choices", "You may ask us to access, correct, or delete the personal information you submitted, subject to applicable legal requirements."],
    ],
    contact: "For privacy questions or requests, email",
    back: "Back to contact",
  },
  ar: {
    eyebrow: "الخصوصية",
    title: "إشعار الخصوصية.",
    intro: "يوضح هذا الإشعار كيفية استخدام Mason & Arc للمعلومات المرسلة عبر هذا الموقع.",
    sections: [
      ["المعلومات التي نجمعها", "عند التواصل معنا، قد نجمع الاسم والبريد الإلكتروني ورقم الهاتف والشركة ومعلومات المشروع التي تختار تقديمها."],
      ["كيفية استخدامها", "نستخدم هذه المعلومات فقط لمراجعة استفسارك والرد عليك وإدارة العلاقة المحتملة الخاصة بالمشروع."],
      ["الحفظ والمشاركة", "تُحفظ بيانات الاستفسار داخل نظام إدارة المشروعات المؤمّن الخاص بالاستوديو. لا نبيع البيانات الشخصية، ولا نشاركها إلا مع مقدمي الخدمات عند الحاجة لتشغيل الموقع أو الرد على طلبك."],
      ["خياراتك", "يمكنك أن تطلب الاطلاع على البيانات الشخصية التي أرسلتها أو تصحيحها أو حذفها، وفقًا للمتطلبات القانونية السارية."],
    ],
    contact: "للاستفسارات أو الطلبات المتعلقة بالخصوصية، راسلنا عبر",
    back: "العودة إلى التواصل",
  },
  it: {
    eyebrow: "Privacy",
    title: "Informativa sulla privacy.",
    intro: "Questa informativa spiega come Mason & Arc utilizza le informazioni inviate attraverso il sito.",
    sections: [
      ["Informazioni raccolte", "Quando ci contatti, possiamo raccogliere nome, indirizzo email, numero di telefono, società e le informazioni sul progetto che scegli di fornire."],
      ["Come le utilizziamo", "Utilizziamo queste informazioni esclusivamente per esaminare la richiesta, risponderti e gestire il potenziale rapporto di progetto."],
      ["Conservazione e condivisione", "I dati della richiesta sono conservati nel sistema protetto di gestione dei progetti dello studio. Non vendiamo dati personali e li condividiamo con fornitori di servizi solo quando necessario per il funzionamento del sito o per rispondere alla richiesta."],
      ["Le tue scelte", "Puoi chiederci di accedere, correggere o eliminare i dati personali inviati, nel rispetto degli obblighi di legge applicabili."],
    ],
    contact: "Per domande o richieste relative alla privacy, scrivi a",
    back: "Torna ai contatti",
  },
} as const;

export default function PrivacyPage() {
  const { locale } = useLocale();
  const copy = privacyCopy[locale];

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 pb-28 pt-36 text-neutral-900 md:px-10 md:pb-40 md:pt-44 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-400">{copy.eyebrow}</p>
        <h1 className="mt-8 max-w-5xl text-6xl font-extralight leading-[0.9] tracking-[-0.055em] sm:text-7xl md:text-8xl lg:text-9xl">{copy.title}</h1>
        <p className="mt-10 max-w-2xl text-base font-light leading-8 text-neutral-600">{copy.intro}</p>

        <div className="mt-20 border-t border-neutral-300">
          {copy.sections.map(([title, body], index) => (
            <section key={title} className="grid gap-5 border-b border-neutral-300 py-9 md:grid-cols-[80px_1fr_1.4fr] md:gap-10 md:py-12">
              <span className="text-[9px] tracking-[0.25em] text-neutral-400">{String(index + 1).padStart(2, "0")}</span>
              <h2 className="text-2xl font-light tracking-[-0.025em]">{title}</h2>
              <p className="max-w-2xl text-sm font-light leading-7 text-neutral-600 md:text-base">{body}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-6 text-sm text-neutral-600 md:flex-row md:items-center md:justify-between">
          <p>{copy.contact}{" "}<a className="underline underline-offset-4" href="mailto:Masonandarc@gmail.com">Masonandarc@gmail.com</a>.</p>
          <Link href="/contact" className="w-fit border-b border-neutral-900 pb-1 text-[10px] uppercase tracking-[0.2em] text-neutral-900">{copy.back} ↗</Link>
        </div>
      </div>
    </main>
  );
}
