"use client";

import Link from "next/link";
import LetsCreateCTA from "@/components/shared/LetsCreateCTA";
import Reveal from "@/components/animations/Reveal";
import { useLocale } from "@/components/i18n/LocaleProvider";

export const servicesContent = {
  en: {
    hero: ["Think.", "Connect.", "Make."],
    intro: "The studio brings space, identity, image and digital experience into one working process. The team changes with the brief; the creative direction stays clear.",
    scroll: "Explore the practices", label: "01 — Services", heading: ["Four practices.", "Built to work together."],
    fieldLabels: { capabilities: "Capabilities", for: "Who it is for", deliverables: "Typical deliverables", examples: "Where it can lead", specialist: "Specialist offering", cta: "Start a conversation" },
    services: [
      { title: "Architecture & Interiors", intro: "We shape places around how they should feel, work and endure. Architecture and interiors develop together, with material, light, movement and detail considered from the start.", capabilities: ["Architecture", "Interior design", "Spatial strategy", "Concept design", "Design development", "Material and furniture direction", "Execution documentation", "Delivery guidance and coordination"], for: "Developers, private clients, hospitality, workplace, retail and cultural projects.", deliverables: "Brief and spatial strategy, concept packages, plans and sections, material direction, detailed design, coordinated documentation and review support.", examples: "New buildings, renovations, residential interiors, hospitality environments, sales spaces and multi-site spatial standards.", specialist: "Design Systems for Developers — repeatable spatial principles, material families and project tools that protect quality across teams and sites." },
      { title: "Branding & Creative Direction", intro: "We give projects a point of view people can recognise. Strategy, language and visual identity are developed as a useful system—not a collection of isolated graphics.", capabilities: ["Brand strategy", "Positioning", "Naming", "Verbal direction", "Visual identity", "Art direction", "Campaign direction", "Brand guidelines"], for: "New ventures, real-estate developments, places, hospitality brands and established organisations entering a new chapter.", deliverables: "Positioning, naming routes, identity concepts, logo systems, typography and colour rules, art direction, templates and practical guidelines.", examples: "Place brands, development identities, hospitality concepts, corporate refreshes, launches and brand families.", specialist: "Signature Design Language — a distinctive visual and verbal grammar that can guide every touchpoint without becoming rigid." },
      { title: "Visualization & Communication", intro: "We make complex ideas easy to see and easier to understand. Still imagery, motion and editorial presentation are shaped around the story the project needs to tell.", capabilities: ["Architectural visualization", "Creative image direction", "Motion and film direction", "Presentation systems", "Pitch and competition material", "Campaign imagery", "Diagrams and visual narratives", "Editorial layouts"], for: "Architects, developers, brands and teams preparing a launch, approval, pitch or public story.", deliverables: "Image sets, film or motion direction, storyboards, presentation decks, diagrams, campaign assets and coordinated visual systems.", examples: "Planning and sales narratives, investor presentations, design competitions, launch campaigns and project films.", specialist: "Motion & Architectural Storytelling — sequence, pace and image direction that help an audience experience an unbuilt idea." },
      { title: "Digital Experiences", intro: "We design and develop digital experiences that feel like the brand and work for the people using them. Structure, interface, content and build are considered as one piece of work.", capabilities: ["Digital strategy", "UX and content structure", "Web design", "Web development", "Responsive systems", "Interaction and motion", "Digital brand systems", "Social content direction"], for: "Studios, developments, hospitality brands, cultural projects and organisations that need a clear digital home.", deliverables: "Sitemaps, wireframes, interface systems, responsive websites, development, CMS setup, launch support and digital templates.", examples: "Portfolio sites, launch sites, place platforms, campaign pages, content systems and social toolkits.", specialist: "Brand Experience Design — connecting physical and digital touchpoints so the same identity is felt before, during and after the visit." },
    ],
  },
  ar: {
    hero: ["نفكّر.", "نربط.", "نصنع."],
    intro: "يجمع الاستوديو المكان والهوية والصورة والتجربة الرقمية داخل عملية عمل واحدة. يتغير الفريق حسب المشروع، بينما يظل الاتجاه الإبداعي واضحًا.",
    scroll: "استكشف الممارسات", label: "01 — الخدمات", heading: ["أربع ممارسات.", "مصممة لتعمل معًا."],
    fieldLabels: { capabilities: "القدرات", for: "لمن هذه الخدمة", deliverables: "المخرجات المعتادة", examples: "ما الذي يمكن أن تصنعه", specialist: "خدمة متخصصة", cta: "ابدأ محادثة" },
    services: [
      { title: "العمارة والتصميم الداخلي", intro: "نصوغ الأماكن حول الإحساس المطلوب منها وطريقة عملها وقدرتها على الاستمرار. تتطور العمارة والداخلية معًا، مع دراسة الخامات والضوء والحركة والتفاصيل من البداية.", capabilities: ["العمارة", "التصميم الداخلي", "الاستراتيجية المكانية", "التصميم المفاهيمي", "تطوير التصميم", "توجيه الخامات والأثاث", "وثائق التنفيذ", "دعم التنفيذ والتنسيق"], for: "المطورون والعملاء الأفراد ومشروعات الضيافة والعمل والتجزئة والثقافة.", deliverables: "البرنامج والاستراتيجية المكانية، حزم المفهوم، المساقط والقطاعات، توجيه الخامات، التصميم التفصيلي، الوثائق المنسقة ودعم المراجعة.", examples: "المباني الجديدة والتجديدات والداخلية السكنية والضيافة ومساحات البيع والمعايير المكانية متعددة المواقع.", specialist: "أنظمة تصميم للمطورين — مبادئ مكانية وعائلات خامات وأدوات مشروع قابلة للتكرار وتحمي الجودة عبر الفرق والمواقع." },
      { title: "الهوية والتوجيه الإبداعي", intro: "نمنح المشروع وجهة نظر يسهل تمييزها. تتطور الاستراتيجية واللغة والهوية البصرية كنظام عملي، لا كمجموعة عناصر منفصلة.", capabilities: ["استراتيجية العلامة", "التموضع", "التسمية", "التوجيه اللفظي", "الهوية البصرية", "التوجيه الفني", "توجيه الحملات", "إرشادات العلامة"], for: "المشروعات الجديدة والتطوير العقاري والأماكن والضيافة والمؤسسات التي تبدأ فصلًا جديدًا.", deliverables: "التموضع، مسارات التسمية، مفاهيم الهوية، أنظمة الشعار، قواعد الخط واللون، التوجيه الفني، القوالب والإرشادات العملية.", examples: "هويات الأماكن والتطويرات والضيافة وتحديث المؤسسات والإطلاقات وعائلات العلامات.", specialist: "لغة تصميم مميزة — قواعد بصرية ولفظية خاصة تقود كل نقطة تواصل من دون أن تتحول إلى نظام جامد." },
      { title: "التصور والتواصل", intro: "نجعل الأفكار المعقدة سهلة الرؤية والفهم. تُصاغ الصور والحركة والعروض التحريرية حول القصة التي يحتاج المشروع إلى روايتها.", capabilities: ["التصور المعماري", "التوجيه الإبداعي للصورة", "توجيه الحركة والفيلم", "أنظمة العرض", "مواد العروض والمسابقات", "صور الحملات", "المخططات والسرد البصري", "التصميم التحريري"], for: "المعماريون والمطورون والعلامات والفرق التي تستعد لإطلاق أو اعتماد أو عرض أو قصة عامة.", deliverables: "مجموعات صور، توجيه فيلم أو حركة، لوحات سرد، عروض تقديمية، مخططات، أصول حملات وأنظمة بصرية منسقة.", examples: "سرد التخطيط والمبيعات، عروض المستثمرين، المسابقات، حملات الإطلاق وأفلام المشروعات.", specialist: "الحركة والسرد المعماري — تسلسل وإيقاع وتوجيه للصورة يساعد الجمهور على تجربة فكرة لم تُبنَ بعد." },
      { title: "التجارب الرقمية", intro: "نصمم ونطوّر تجارب رقمية تشبه العلامة وتخدم مستخدميها. نتعامل مع البنية والواجهة والمحتوى والبرمجة كعمل واحد.", capabilities: ["الاستراتيجية الرقمية", "تجربة المستخدم وبنية المحتوى", "تصميم المواقع", "تطوير المواقع", "الأنظمة المتجاوبة", "التفاعل والحركة", "أنظمة العلامة الرقمية", "توجيه المحتوى الاجتماعي"], for: "الاستوديوهات والتطويرات والعلامات الفندقية والمشروعات الثقافية والمؤسسات التي تحتاج إلى حضور رقمي واضح.", deliverables: "خرائط المواقع، النماذج الأولية، أنظمة الواجهة، مواقع متجاوبة، التطوير، إعداد إدارة المحتوى، دعم الإطلاق والقوالب الرقمية.", examples: "مواقع الأعمال والإطلاقات ومنصات الأماكن وصفحات الحملات وأنظمة المحتوى وأدوات التواصل الاجتماعي.", specialist: "تصميم تجربة العلامة — ربط النقاط المادية والرقمية ليُحسّ بالهوية نفسها قبل الزيارة وأثناءها وبعدها." },
    ],
  },
  it: {
    hero: ["Pensare.", "Connettere.", "Creare."],
    intro: "Lo studio riunisce spazio, identità, immagine ed esperienza digitale in un unico processo di lavoro. Il team cambia con il brief; la direzione creativa resta chiara.",
    scroll: "Esplora le pratiche", label: "01 — Servizi", heading: ["Quattro pratiche.", "Pensate per lavorare insieme."],
    fieldLabels: { capabilities: "Competenze", for: "Per chi", deliverables: "Deliverable tipici", examples: "Dove può portare", specialist: "Offerta specialistica", cta: "Inizia una conversazione" },
    services: [
      { title: "Architettura & Interni", intro: "Diamo forma ai luoghi attorno a come devono essere vissuti, funzionare e durare. Architettura e interni crescono insieme, considerando materia, luce, movimento e dettaglio fin dall’inizio.", capabilities: ["Architettura", "Interior design", "Strategia spaziale", "Concept design", "Sviluppo del progetto", "Direzione materiali e arredi", "Documentazione esecutiva", "Supporto e coordinamento"], for: "Developer, clienti privati, hospitality, workplace, retail e progetti culturali.", deliverables: "Brief e strategia spaziale, concept, piante e sezioni, direzione materica, progetto di dettaglio, documentazione coordinata e supporto alla revisione.", examples: "Nuovi edifici, ristrutturazioni, interni residenziali, hospitality, spazi vendita e standard per più sedi.", specialist: "Design Systems for Developers — principi spaziali, famiglie di materiali e strumenti replicabili che proteggono la qualità tra team e luoghi diversi." },
      { title: "Branding & Direzione Creativa", intro: "Diamo ai progetti un punto di vista riconoscibile. Strategia, linguaggio e identità visiva diventano un sistema utile, non una collezione di elementi isolati.", capabilities: ["Strategia di brand", "Posizionamento", "Naming", "Direzione verbale", "Identità visiva", "Art direction", "Direzione campagne", "Linee guida"], for: "Nuove iniziative, sviluppi immobiliari, luoghi, brand hospitality e organizzazioni che iniziano un nuovo capitolo.", deliverables: "Posizionamento, percorsi di naming, concept d’identità, sistemi di logo, regole tipografiche e cromatiche, art direction, template e linee guida pratiche.", examples: "Place brand, identità immobiliari, concept hospitality, rebranding, lanci e famiglie di brand.", specialist: "Signature Design Language — una grammatica visiva e verbale distintiva che guida ogni touchpoint senza diventare rigida." },
      { title: "Visualizzazione & Comunicazione", intro: "Rendiamo le idee complesse più facili da vedere e capire. Immagini, motion e presentazioni editoriali sono costruiti attorno alla storia che il progetto deve raccontare.", capabilities: ["Visualizzazione architettonica", "Direzione creativa dell’immagine", "Direzione motion e film", "Sistemi di presentazione", "Pitch e concorsi", "Immagini di campagna", "Diagrammi e narrazioni visive", "Layout editoriali"], for: "Architetti, developer, brand e team che preparano un lancio, un’approvazione, un pitch o un racconto pubblico.", deliverables: "Serie di immagini, direzione film o motion, storyboard, deck, diagrammi, asset di campagna e sistemi visivi coordinati.", examples: "Narrazioni commerciali e urbanistiche, presentazioni per investitori, concorsi, campagne di lancio e film di progetto.", specialist: "Motion & Architectural Storytelling — sequenza, ritmo e direzione dell’immagine per far vivere al pubblico un’idea non ancora costruita." },
      { title: "Esperienze Digitali", intro: "Progettiamo e sviluppiamo esperienze digitali che riflettono il brand e funzionano per chi le usa. Struttura, interfaccia, contenuti e sviluppo sono un unico lavoro.", capabilities: ["Strategia digitale", "UX e struttura dei contenuti", "Web design", "Sviluppo web", "Sistemi responsive", "Interazione e motion", "Sistemi digitali di brand", "Direzione contenuti social"], for: "Studi, sviluppi immobiliari, brand hospitality, progetti culturali e organizzazioni che hanno bisogno di una casa digitale chiara.", deliverables: "Sitemap, wireframe, sistemi di interfaccia, siti responsive, sviluppo, CMS, supporto al lancio e template digitali.", examples: "Portfolio, siti di lancio, piattaforme per luoghi, pagine di campagna, sistemi di contenuto e toolkit social.", specialist: "Brand Experience Design — connettere i touchpoint fisici e digitali affinché la stessa identità si senta prima, durante e dopo la visita." },
    ],
  },
} as const;

export const serviceSlugs = [
  "architecture-interiors",
  "branding-creative-direction",
  "visualization-communication",
  "digital-experiences",
] as const;

export type ServiceSlug = (typeof serviceSlugs)[number];

export default function ServicesHero() {
  const { locale } = useLocale(); const copy = servicesContent[locale];
  return <main className="bg-[#f8f7f4] text-neutral-900">
    <section className="px-6 pb-20 pt-36 sm:px-8 md:px-10 md:pb-24 md:pt-40 lg:px-16 lg:pb-28 lg:pt-44">
      <div className="grid gap-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-20">
        <Reveal>
          <h1 className={`${locale === "ar" ? "text-[clamp(4.4rem,13vw,10rem)]" : "text-[clamp(4.8rem,12vw,10.5rem)]"} font-extralight leading-[.82] tracking-[-.065em]`}>
            {copy.hero.map((line) => <span key={line} className="block">{line}</span>)}
          </h1>
        </Reveal>
        <Reveal>
          <div>
            <p className="max-w-2xl text-xl font-light leading-8 text-neutral-600 md:text-2xl md:leading-10">{copy.intro}</p>
            <p className="mt-12 text-[9px] uppercase tracking-[.35em] text-neutral-400">{copy.scroll} ↓</p>
          </div>
        </Reveal>
      </div>
    </section>
    <section className="border-t border-neutral-300 px-6 py-24 sm:px-8 md:px-10 md:py-32 lg:px-16">
      <div className="mx-auto grid max-w-[1600px] gap-10 lg:grid-cols-[.25fr_1.75fr]">
        <p className="text-[9px] uppercase tracking-[.35em] text-neutral-400">{copy.label}</p>
        <h2 className="text-[clamp(2.75rem,5.2vw,5.25rem)] font-extralight leading-[1.02] tracking-[-.045em]">{copy.heading[0]}<br />{copy.heading[1]}</h2>
      </div>
      <div className="mx-auto mt-20 max-w-[1600px] border-t border-neutral-300 md:mt-28">
        {copy.services.map((service, index) => (
          <Link
            id={`discipline-${index + 1}`}
            key={service.title}
            href={`/services/${serviceSlugs[index]}`}
            className="group grid scroll-mt-20 grid-cols-[40px_minmax(0,1fr)_24px] items-start gap-4 border-b border-neutral-300 py-10 transition-colors hover:text-[#4F6B7A] md:grid-cols-[100px_minmax(0,1fr)_40px] md:gap-10 md:py-14"
          >
            <p className="pt-2 text-[10px] tracking-[.25em] text-[#4F6B7A]">0{index + 1}</p>
            <Reveal>
              <h3 className={`${locale === "ar" ? "text-[clamp(2.5rem,5vw,4.5rem)]" : "text-[clamp(2.1rem,3.75vw,3.625rem)]"} min-w-0 font-extralight leading-[1.04] tracking-[-.045em]`}>{service.title}</h3>
            </Reveal>
            <span aria-hidden="true" className="pt-1 text-right text-2xl transition-transform group-hover:translate-x-1">↗</span>
          </Link>
        ))}
      </div>
    </section>
    <LetsCreateCTA />
  </main>;
}
