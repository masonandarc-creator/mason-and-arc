"use client";

import Link from "next/link";
import Reveal from "@/components/animations/Reveal";
import LetsCreateCTA from "@/components/shared/LetsCreateCTA";
import { useLocale } from "@/components/i18n/LocaleProvider";

const content = {
  en: {
    back: "All services",
    category: "Architecture / Specialist Service",
    title: ["Building permits.", "Handled with clarity."],
    introduction: "We support residential and commercial projects through the building-permit process in Egypt's new urban communities — from reviewing planning requirements to preparing technical documentation and coordinating the application with the relevant authority.",
    stepsLabel: "Our scope",
    stepsHeading: "From requirements to submission.",
    steps: [
      { name: "Regulatory review", description: "Review the plot information, planning conditions and building requirements set by the relevant city authority." },
      { name: "Technical documentation", description: "Prepare and coordinate the architectural drawings and supporting documents required for the application." },
      { name: "Application coordination", description: "Organise the permit file, coordinate required reviews and support submission through the applicable process." },
      { name: "Authority follow-up", description: "Follow up on comments and requests for revisions, helping the application progress toward the authority's decision." },
    ],
    areasLabel: "Areas of service",
    areasHeading: "Across new urban communities.",
    areasIntro: "Our services can be arranged for plots and developments across Greater Cairo and its new urban communities, subject to project scope and the requirements of the responsible authority.",
    areas: ["6 October", "New October", "October Gardens", "Sheikh Zayed", "New Cairo / Fifth Settlement", "Beit Al Watan / North Rehab"],
    note: "Permits are issued by the competent authorities. Requirements, processing times and approvals depend on the plot and the relevant authority.",
    contact: "Discuss your permit requirements",
    documentLabel: "Document reference",
    documentHeading: "A building permit. Redacted for privacy.",
    documentIntro: "A reference copy illustrating the format of a building permit. Identifying details, plot information and personal signatures have been removed.",
    openPdf: "Open reference PDF",
    downloadPdf: "Download PDF",
    documentNote: "This redacted document is provided for illustration only. It does not demonstrate that Mason & Arc issued or obtained the permit.",
  },
  ar: {
    back: "كل الخدمات",
    category: "العمارة / خدمة هندسية متخصصة",
    title: ["تراخيص البناء.", "بخطوات واضحة."],
    introduction: "نساعد ملاك الأراضي والمطورين في إعداد وتجهيز ومتابعة ملفات تراخيص البناء للمشروعات السكنية والتجارية بالمدن الجديدة في مصر، بدءًا من مراجعة الاشتراطات البنائية وحتى تنسيق الرسومات والمستندات ومتابعة الإجراءات مع الجهة المختصة.",
    stepsLabel: "نطاق الخدمة",
    stepsHeading: "من مراجعة الاشتراطات إلى متابعة الطلب.",
    steps: [
      { name: "مراجعة الاشتراطات", description: "دراسة بيانات قطعة الأرض والاشتراطات البنائية والتنظيمية الصادرة عن جهاز المدينة أو الجهة المختصة." },
      { name: "تجهيز الملف الهندسي", description: "إعداد ومراجعة الرسومات المعمارية والمستندات المطلوبة والتنسيق بين التخصصات وفق متطلبات الترخيص." },
      { name: "تنسيق إجراءات التقديم", description: "تجهيز ملف الترخيص ومراجعة المستندات ومتابعة خطوات التقديم والاعتمادات المطلوبة." },
      { name: "المتابعة واستيفاء الملاحظات", description: "متابعة الملاحظات الفنية والإدارية واستيفاء المتطلبات اللازمة لعرض الملف على الجهات المعنية." },
    ],
    areasLabel: "مناطق تقديم الخدمة",
    areasHeading: "خدمات هندسية للمدن الجديدة.",
    areasIntro: "يمكننا دراسة طلبات التراخيص لقطع الأراضي والمشروعات في القاهرة الكبرى والمدن الجديدة، بحسب نطاق المشروع واشتراطات الجهة المعنية.",
    areas: ["مدينة 6 أكتوبر", "أكتوبر الجديدة", "حدائق أكتوبر", "الشيخ زايد", "القاهرة الجديدة / التجمع الخامس", "بيت الوطن / شمال الرحاب"],
    note: "إصدار التراخيص من اختصاص الجهات الرسمية، وتختلف المتطلبات ومدد الإجراءات وقرارات الموافقة بحسب قطعة الأرض والجهاز المختص.",
    contact: "استفسر عن إجراءات ترخيص مشروعك",
    documentLabel: "مستند مرجعي",
    documentHeading: "نموذج رخصة بناء بعد حجب البيانات.",
    documentIntro: "نسخة مرجعية توضح شكل مستند ترخيص البناء، بعد إخفاء بيانات المالك وقطعة الأرض والتوقيعات وأي بيانات تعريفية خاصة.",
    openPdf: "فتح ملف PDF",
    downloadPdf: "تنزيل ملف PDF",
    documentNote: "المستند للعرض التوضيحي فقط، ولا يُعد إثباتًا بأن Mason & Arc أصدر هذا الترخيص أو استخرجه.",
  },
  it: {
    back: "Tutti i servizi",
    category: "Architettura / Servizio specialistico",
    title: ["Permessi edilizi.", "Un percorso chiaro."],
    introduction: "Affianchiamo clienti privati e sviluppatori nelle pratiche per i permessi di costruire relativi a progetti residenziali e commerciali nelle nuove aree urbane dell'Egitto: verifica dei requisiti, preparazione della documentazione tecnica e coordinamento con le autorità competenti.",
    stepsLabel: "Il nostro ambito",
    stepsHeading: "Dai requisiti alla presentazione.",
    steps: [
      { name: "Verifica normativa", description: "Analisi dei dati del lotto e dei requisiti edilizi stabiliti dall'autorità locale competente." },
      { name: "Documentazione tecnica", description: "Preparazione e coordinamento dei disegni architettonici e dei documenti richiesti." },
      { name: "Coordinamento della pratica", description: "Organizzazione del fascicolo, verifiche e assistenza nelle fasi di presentazione." },
      { name: "Monitoraggio e integrazioni", description: "Gestione delle osservazioni e delle richieste di integrazione fino alla decisione dell'autorità." },
    ],
    areasLabel: "Aree servite",
    areasHeading: "Nelle nuove comunità urbane.",
    areasIntro: "Possiamo valutare pratiche per lotti e sviluppi nella Grande Cairo e nelle nuove comunità urbane, secondo l'ambito del progetto e i requisiti dell'autorità responsabile.",
    areas: ["6 October", "New October", "October Gardens", "Sheikh Zayed", "New Cairo / Fifth Settlement", "Beit Al Watan / North Rehab"],
    note: "I permessi sono rilasciati dalle autorità competenti. Requisiti, tempi e approvazioni dipendono dal lotto e dall'ente responsabile.",
    contact: "Parliamo del tuo permesso edilizio",
    documentLabel: "Documento di riferimento",
    documentHeading: "Un permesso edilizio, con dati oscurati.",
    documentIntro: "Una copia di riferimento che mostra il formato del permesso. Identificativi, dati del lotto e firme personali sono stati rimossi.",
    openPdf: "Apri il PDF",
    downloadPdf: "Scarica il PDF",
    documentNote: "Il documento oscurato ha finalità esclusivamente illustrative e non dimostra che Mason & Arc abbia ottenuto o rilasciato questo permesso.",
  },
} as const;

export default function BuildingPermits() {
  const { locale } = useLocale();
  const copy = content[locale];

  return (
    <main className="bg-[#f8f7f4] text-neutral-900">
      <section className="px-6 pb-24 pt-32 sm:px-8 md:px-10 md:pb-32 lg:px-16 lg:pt-40">
        <div className="mx-auto max-w-[1600px]">
          <Link href="/services" className="text-[9px] uppercase tracking-[.3em] text-neutral-500 transition-colors hover:text-neutral-900">← {copy.back}</Link>
          <div className="mt-16 grid gap-12 lg:grid-cols-[.28fr_1fr] lg:gap-16">
            <span className="pt-3 text-[10px] uppercase tracking-[.22em] text-[#4F6B7A]">{copy.category}</span>
            <div>
              <Reveal>
                <h1 className={`${locale === "ar" ? "text-[clamp(3.4rem,7vw,7.5rem)]" : "text-[clamp(3.7rem,7vw,7.8rem)]"} max-w-6xl font-extralight leading-[.94] tracking-[-.055em]`}>
                  <span className="block">{copy.title[0]}</span>
                  <span className="block">{copy.title[1]}</span>
                </h1>
              </Reveal>
              <p className="mt-12 max-w-3xl text-lg font-light leading-9 text-neutral-600 md:text-2xl md:leading-10">{copy.introduction}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-300 px-6 py-20 sm:px-8 md:px-10 md:py-28 lg:px-16">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-10 lg:grid-cols-[.28fr_1fr]">
            <p className="text-[9px] uppercase tracking-[.3em] text-[#4F6B7A]">{copy.stepsLabel}</p>
            <h2 className="max-w-4xl text-[clamp(2.7rem,5vw,5rem)] font-extralight leading-[1.02] tracking-[-.05em]">{copy.stepsHeading}</h2>
          </div>
          <ol className="mt-20 grid border-t border-neutral-300 md:grid-cols-2">
            {copy.steps.map((step, index) => (
              <li key={step.name} className="border-b border-neutral-300 p-7 md:p-10">
                <span className="text-[10px] tracking-[.25em] text-[#4F6B7A]">0{index + 1}</span>
                <h3 className="mt-8 text-2xl font-light tracking-[-.035em] md:text-3xl">{step.name}</h3>
                <p className="mt-5 max-w-xl text-base font-light leading-8 text-neutral-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-neutral-900 px-6 py-20 text-white sm:px-8 md:px-10 md:py-28 lg:px-16">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid gap-10 lg:grid-cols-[.28fr_1fr]">
            <p className="text-[9px] uppercase tracking-[.3em] text-white/45">{copy.areasLabel}</p>
            <div>
              <h2 className="max-w-4xl text-[clamp(2.7rem,5vw,5rem)] font-extralight leading-[1.04] tracking-[-.045em]">{copy.areasHeading}</h2>
              <p className="mt-9 max-w-3xl text-lg font-light leading-9 text-white/65">{copy.areasIntro}</p>
              <ul className="mt-14 grid border-t border-white/20 sm:grid-cols-2">
                {copy.areas.map((area) => <li key={area} className="border-b border-white/20 py-5 text-base font-light text-white/80">{area}</li>)}
              </ul>
              <p className="mt-10 max-w-3xl text-sm font-light leading-7 text-white/50">{copy.note}</p>
              <Link href="/contact?service=building-permits" className="mt-12 inline-flex border-b border-white/60 pb-3 text-sm font-light text-white transition-colors hover:border-[#4F6B7A]">{copy.contact} ↗</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-300 bg-[#f8f7f4] px-6 py-20 sm:px-8 md:px-10 md:py-28 lg:px-16">
        <div className="mx-auto grid max-w-[1600px] gap-10 lg:grid-cols-[.28fr_1fr]">
          <p className="text-[9px] uppercase tracking-[.3em] text-[#4F6B7A]">{copy.documentLabel}</p>
          <div>
            <h2 className="max-w-4xl text-[clamp(2.4rem,4.4vw,4.5rem)] font-extralight leading-[1.07] tracking-[-.045em]">{copy.documentHeading}</h2>
            <p className="mt-8 max-w-3xl text-lg font-light leading-8 text-neutral-600">{copy.documentIntro}</p>
            <div className="mt-12 overflow-hidden border border-neutral-300 bg-white">
              <iframe
                title={copy.documentHeading}
                src="/docs/building-permit-reference.pdf#toolbar=0"
                className="h-[320px] w-full md:h-[520px] lg:h-[670px]"
                loading="lazy"
              />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-5">
              <a href="/docs/building-permit-reference.pdf" target="_blank" rel="noopener noreferrer" className="border-b border-neutral-900 pb-2 text-sm font-light text-neutral-900 transition-colors hover:border-[#4F6B7A]">{copy.openPdf} ↗</a>
              <a href="/docs/building-permit-reference.pdf" download="mason-arc-building-permit-reference.pdf" className="border-b border-neutral-900 pb-2 text-sm font-light text-neutral-900 transition-colors hover:border-[#4F6B7A]">{copy.downloadPdf} ↓</a>
            </div>
            <p className="mt-7 max-w-3xl text-xs font-light leading-6 text-neutral-500">{copy.documentNote}</p>
          </div>
        </div>
      </section>

      <LetsCreateCTA href="/contact?service=building-permits" />
    </main>
  );
}
