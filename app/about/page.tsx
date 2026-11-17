"use client";

import LetsCreateCTA from "@/components/shared/LetsCreateCTA";
import { useLocale } from "@/components/i18n/LocaleProvider";

const content = {
  en: {
    eyebrow: "About the studio",
    hero1: "One vision.",
    hero2: "Many disciplines.",
    intro: "Mason & Arc is an independent, multidisciplinary design studio connecting architecture, interiors, visual identity, visualization and digital experiences. Every discipline is brought together around one clear idea, from the first direction to the details that give a project its character.",
    storyLabel: "Our story",
    storyTitle: "Across places. Toward one practice.",
    story: "The professional experience behind Mason & Arc took shape in Italy in 2015, with an appreciation for proportion, material, craft and detail. In 2018, Saudi Arabia became part of that journey, bringing another context and a broader perspective. In 2024, those influences came together in a new chapter for Mason & Arc in Egypt. In 2025, the journey returned to its Italian roots, bringing those early influences into the studio’s current direction. Today, the focus is on carrying a clear idea through design, communication and the realities of execution.",
    timeline: [
      { year: "2015", title: "Italy — The professional roots", description: "An approach shaped by proportion, material, craft and attention to detail." },
      { year: "2018", title: "Saudi Arabia — A broader perspective", description: "The professional journey extends to KSA, bringing experience of a different context." },
      { year: "2024", title: "Mason & Arc — A new chapter", description: "A new chapter begins in Egypt, bringing different influences into one design practice." },
      { year: "2025", title: "Italy — Connecting past and present", description: "The journey returns to Italy, connecting the studio’s contemporary direction with its original influences." },
      { year: "2026", title: "Design + Execution", description: "Greater attention to carrying the same design intent from concept through coordination and delivery." },
    ],
    approachLabel: "Our point of view",
    approachTitle: "One idea. Carried through.",
    approach: "We begin with the place, the people and the purpose of a project. Architecture, interiors, identity and communication then develop as related decisions, not separate layers. By connecting creative direction with technical development and execution planning, we aim for work that feels coherent at every scale — designed as one, and built as intended.",
  },
  ar: {
    eyebrow: "عن الاستوديو",
    hero1: "رؤية واحدة.",
    hero2: "وتخصصات متعددة.",
    intro: "Mason & Arc استوديو تصميم مستقل ومتعدد التخصصات، يجمع بين العمارة والتصميم الداخلي والهوية البصرية والتصور المعماري والتجارب الرقمية. نربط هذه المجالات بفكرة واضحة واحدة، من أول تصور للمشروع حتى التفاصيل التي تمنحه طابعه الخاص.",
    storyLabel: "قصتنا",
    storyTitle: "مسار عبر أماكن مختلفة. ورؤية واحدة.",
    story: "تشكّلت الخبرات المهنية التي يستند إليها Mason & Arc في إيطاليا عام ٢٠١٥، مع اهتمام بالنسب والخامات والحرفة ودقة التفاصيل. وفي عام ٢٠١٨ امتد هذا المسار إلى المملكة العربية السعودية، ليضيف سياقًا مختلفًا ورؤية أوسع. ثم بدأ فصل جديد لـ Mason & Arc في مصر عام ٢٠٢٤، اجتمعت فيه هذه المؤثرات ضمن ممارسة تصميمية مترابطة. وفي عام ٢٠٢٥ عاد المسار إلى جذوره الإيطالية، ليصل بين البدايات والرؤية الحالية للاستوديو. واليوم نعمل على الحفاظ على وضوح الفكرة واتساقها عبر التصميم وطريقة تقديم المشروع ومتطلبات تنفيذه.",
    timeline: [
      { year: "٢٠١٥", title: "إيطاليا — الجذور المهنية", description: "خبرات تشكّلت حول النسب والخامات والحرفة والاهتمام بالتفاصيل." },
      { year: "٢٠١٨", title: "السعودية — منظور أوسع", description: "امتداد المسار المهني إلى المملكة العربية السعودية والتعرّف على سياق عمل مختلف." },
      { year: "٢٠٢٤", title: "Mason & Arc — فصل جديد", description: "بداية فصل جديد في مصر يجمع خبرات ومؤثرات متعددة في ممارسة تصميمية واحدة." },
      { year: "٢٠٢٥", title: "إيطاليا — وصل الماضي بالحاضر", description: "عودة المسار إلى إيطاليا، وربط توجّه الاستوديو الحالي بالجذور التي انطلقت منها القصة." },
      { year: "٢٠٢٦", title: "التصميم والتنفيذ", description: "التركيز على استمرار رؤية التصميم خلال التنسيق الفني والتخطيط للتنفيذ." },
    ],
    approachLabel: "وجهة نظرنا",
    approachTitle: "فكرة واحدة. من البداية للنهاية.",
    approach: "نبدأ بفهم المكان واحتياجات مستخدميه والهدف من المشروع. ثم نطوّر العمارة والتصميم الداخلي والهوية وطريقة عرض المشروع باعتبارها قرارات مترابطة، لا مراحل منفصلة. ونسعى إلى وصل التوجّه الإبداعي بالتفاصيل الفنية والتخطيط للتنفيذ، حتى يظل المشروع متسقًا في كل مستوى — يُصمَّم برؤية واحدة ويُنفَّذ كما خُطِّط له.",
  },
  it: {
    eyebrow: "Lo studio",
    hero1: "Una visione.",
    hero2: "Molte discipline.",
    intro: "Mason & Arc è uno studio di design multidisciplinare indipendente che connette architettura, interni, identità visiva, visualizzazione ed esperienze digitali. Ogni disciplina segue un'idea chiara, dalla direzione iniziale ai dettagli che danno carattere al progetto.",
    storyLabel: "La nostra storia",
    storyTitle: "Luoghi diversi. Una direzione comune.",
    story: "L'esperienza professionale alla base di Mason & Arc ha preso forma in Italia nel 2015, con attenzione alle proporzioni, ai materiali, alla qualità artigianale e ai dettagli. Nel 2018 il percorso si è esteso all'Arabia Saudita, aggiungendo un contesto diverso e una prospettiva più ampia. Nel 2024 queste influenze hanno trovato un nuovo capitolo in Egitto con Mason & Arc. Nel 2025 il percorso è tornato alle radici italiane, collegando le influenze iniziali alla direzione attuale dello studio. Oggi l’obiettivo è accompagnare ogni idea attraverso progetto, comunicazione e attenzione alla realizzazione.",
    timeline: [
      { year: "2015", title: "Italia — Le radici professionali", description: "Un approccio fondato su proporzioni, materiali, artigianalità e cura del dettaglio." },
      { year: "2018", title: "Arabia Saudita — Nuove prospettive", description: "Il percorso professionale si estende all'Arabia Saudita, incontrando un contesto diverso." },
      { year: "2024", title: "Mason & Arc — Un nuovo capitolo", description: "In Egitto inizia un nuovo capitolo che unisce influenze diverse in una pratica progettuale." },
      { year: "2025", title: "Italia — Tra origini e presente", description: "Il percorso torna in Italia, collegando la direzione attuale dello studio alle sue influenze originarie." },
      { year: "2026", title: "Progetto + Realizzazione", description: "Maggiore attenzione alla continuità dell'idea progettuale nel coordinamento e nella realizzazione." },
    ],
    approachLabel: "Il nostro punto di vista",
    approachTitle: "Un'idea, portata fino in fondo.",
    approach: "Partiamo dal luogo, dalle persone e dallo scopo del progetto. Architettura, interni, identità e comunicazione crescono come decisioni connesse, non come livelli separati. Colleghiamo direzione creativa, sviluppo tecnico e pianificazione della realizzazione per mantenere il progetto coerente a ogni scala — progettato come un insieme, realizzato come previsto.",
  },
} as const;

export default function AboutPage() {
  const { locale } = useLocale();
  const copy = content[locale];

  return (
    <main className="bg-[#f8f7f4] text-neutral-900">
      <section className="px-6 pb-24 pt-36 sm:px-8 md:px-10 md:pb-36 md:pt-44 lg:px-16">
        <div className="grid gap-10 border-t border-neutral-300 pt-7 lg:grid-cols-[.35fr_1.65fr]">
          <p className="text-[9px] uppercase tracking-[.3em] text-neutral-500">{copy.eyebrow}</p>
          <div>
            <h1 className="max-w-6xl text-[clamp(3.8rem,9vw,9rem)] font-light leading-[.91] tracking-[-.055em]">
              <span className="block">{copy.hero1}</span>
              <span className="block">{copy.hero2}</span>
            </h1>
            <p className="mt-12 max-w-2xl text-base font-light leading-8 text-neutral-600 md:mt-16 md:text-lg">
              {copy.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8 md:px-10 md:py-28 lg:px-16">
        <div className="grid gap-10 border-t border-neutral-300 pt-7 lg:grid-cols-[.35fr_1.65fr]">
          <p className="text-[9px] uppercase tracking-[.3em] text-neutral-500">{copy.storyLabel}</p>
          <div>
            <h2 className="max-w-5xl text-[clamp(2.8rem,6vw,6rem)] font-light leading-[.96] tracking-[-.05em]">
              {copy.storyTitle}
            </h2>
            <p className="mt-9 max-w-2xl text-base font-light leading-8 text-neutral-600">{copy.story}</p>
            <div className="mt-14 grid gap-0 border-t border-neutral-300 md:mt-20">
              {copy.timeline.map((item) => (
                <div key={item.year} className="grid grid-cols-[85px_minmax(0,1fr)] gap-x-5 gap-y-3 border-b border-neutral-300 py-7 sm:grid-cols-[110px_minmax(0,1fr)] md:gap-x-8 md:py-9">
                  <span className="text-xl font-light tracking-[-.03em] text-[#4F6B7A] md:text-2xl" dir={locale === "ar" ? "rtl" : "ltr"}>{item.year}</span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-light leading-snug text-neutral-800 md:text-2xl">{item.title}</h3>
                    <p className="mt-3 max-w-2xl text-sm font-light leading-7 text-neutral-500 md:text-base md:leading-8">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-8 md:px-10 md:py-28 lg:px-16">
        <div className="grid gap-10 border-t border-neutral-300 pt-7 lg:grid-cols-[.35fr_1.65fr]">
          <p className="text-[9px] uppercase tracking-[.3em] text-neutral-500">{copy.approachLabel}</p>
          <div>
            <h2 className="max-w-5xl text-[clamp(2.8rem,6vw,6rem)] font-light leading-[.96] tracking-[-.05em]">
              {copy.approachTitle}
            </h2>
            <p className="mt-9 max-w-2xl text-base font-light leading-8 text-neutral-600">{copy.approach}</p>
          </div>
        </div>
      </section>

      <LetsCreateCTA />
    </main>
  );
}
