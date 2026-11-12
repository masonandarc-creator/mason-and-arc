"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";

const aboutCopy = {
  en: {
    eyebrow: "About",
    hero: ["Designing", "spaces that", "last."],
    practiceLabel: "Professional practice in Italy",
    historyLead: "Mason & Arc is informed by professional experience developed in Italy since 2015, including contributions to and supervision of major projects across different scales and contexts.",
    historyBody: "This experience shaped a rigorous understanding of architecture, detailed coordination, material quality, and the relationship between design intent and the completed space.",
    country: "Italy",
    since: "From 2015",
    experience: "Years of professional practice in Italy, including the supervision of major projects, inform the precision and attention to detail behind the studio today.",
    chapterLabel: "A new chapter",
    chapterTitle: ["A new", "chapter"],
    chapterLead: "A new, independent architectural design studio based in Egypt.",
    chapterBody: "This experience now informs a new and independent chapter based in Egypt. Mason & Arc focuses on architecture, interiors, and detailed design development for projects in Egypt and internationally, with delivery advisory and execution supervision available selectively when requested.",
    approachLabel: "Our Approach",
    approachLead: "Our approach begins with understanding the relationship between people, space, context, and purpose.",
    approachBody: "Every project is considered as an opportunity to create environments that are not only visually distinctive, but also functional, considered, and capable of responding to the way people actually live, work, and interact with their surroundings. From the earliest concept to the development of materials, details, and spatial experience, design decisions are approached as part of one connected process.",
    servicesLabel: "What we do",
    servicesTitle: "Services",
    closingTitle: ["Places with", "character.", "Purpose.", "Lasting value."],
    closingBody: "Our ambition is not simply to produce buildings or interiors, but to create places with character, purpose, and lasting value — environments where architecture, interior, exterior, and landscape come together as one considered experience.",
    ctaLabel: "Start a project",
    ctaTitle: ["Let's", "design."],
    ctaLink: "Get in touch",
    services: [
      ["Architecture", "Our architectural work focuses on creating buildings that respond to their surroundings while establishing a clear identity of their own. Form, proportion, structure, material, light, and landscape are considered together to create architecture that is both expressive and purposeful."],
      ["Interior Design", "Interior design is approached as an extension of architecture. Rather than treating interiors as isolated spaces, we develop environments where circulation, materials, lighting, furniture, textures, and architectural elements work together to create a coherent experience."],
      ["Design Development", "From concept to detailed design, we develop every element with precision, clarity, and careful attention to material, proportion, and constructability."],
      ["Design & Delivery Advisory", "Where required, we advise on the selection and coordination of specialist delivery partners. Execution supervision is available selectively when requested by the client."],
    ],
  },
  ar: {
    eyebrow: "عن الاستوديو",
    hero: ["نصمّم", "مساحات", "تدوم."],
    practiceLabel: "خبرة مهنية في إيطاليا",
    historyLead: "تستند Mason & Arc إلى خبرة مهنية تطورت في إيطاليا منذ عام 2015، وشملت المشاركة في مشروعات كبيرة والإشراف على تنفيذها عبر مقاييس وسياقات مختلفة.",
    historyBody: "شكّلت هذه الخبرة فهمًا دقيقًا للعمارة والتنسيق التفصيلي وجودة الخامات والعلاقة بين الفكرة التصميمية والفراغ بعد اكتماله.",
    country: "إيطاليا",
    since: "منذ 2015",
    experience: "سنوات من الممارسة المهنية في إيطاليا، بما في ذلك الإشراف على مشروعات كبيرة، تقف خلف الدقة والاهتمام بالتفاصيل اللذين يميزان الاستوديو اليوم.",
    chapterLabel: "فصل جديد",
    chapterTitle: ["فصل", "جديد"],
    chapterLead: "استوديو مستقل وجديد للتصميم المعماري مقره مصر.",
    chapterBody: "تشكل هذه الخبرة اليوم أساس فصل جديد ومستقل مقره مصر. تركز Mason & Arc على العمارة والتصميم الداخلي والتطوير التفصيلي لمشروعات في مصر ودوليًا، مع تقديم استشارات التنفيذ والإشراف عليه بصورة اختيارية عند طلب العميل.",
    approachLabel: "منهجنا",
    approachLead: "يبدأ منهجنا بفهم العلاقة بين الإنسان والفراغ والسياق والغرض.",
    approachBody: "نتعامل مع كل مشروع كفرصة لصنع بيئات مميزة بصريًا وعملية ومدروسة، تستجيب لطريقة عيش الناس وعملهم وتفاعلهم مع محيطهم. ومن الفكرة الأولى إلى تطوير الخامات والتفاصيل والتجربة المكانية، نتعامل مع قرارات التصميم باعتبارها عملية واحدة مترابطة.",
    servicesLabel: "ما نقدمه",
    servicesTitle: "الخدمات",
    closingTitle: ["أماكن ذات", "شخصية.", "وهدف.", "وقيمة تدوم."],
    closingBody: "طموحنا ليس مجرد إنتاج مبانٍ أو فراغات داخلية، بل صنع أماكن ذات شخصية وهدف وقيمة تدوم، حيث تجتمع العمارة والداخل والخارج واللاندسكيب في تجربة واحدة مدروسة.",
    ctaLabel: "ابدأ مشروعًا",
    ctaTitle: ["لنصمّم", "معًا."],
    ctaLink: "تواصل معنا",
    services: [
      ["العمارة", "نصمم مباني تستجيب لمحيطها وتؤسس في الوقت نفسه هوية واضحة خاصة بها. ندرس الشكل والنِسب والإنشاء والخامات والضوء واللاندسكيب معًا لصنع عمارة معبّرة وهادفة."],
      ["التصميم الداخلي", "نتعامل مع التصميم الداخلي كامتداد للعمارة، بحيث تعمل الحركة والخامات والإضاءة والأثاث والملمس والعناصر المعمارية معًا لتكوين تجربة متماسكة."],
      ["تطوير التصميم", "من الفكرة إلى التصميم التفصيلي، نطوّر كل عنصر بدقة ووضوح واهتمام بالخامات والنِسب وقابلية التنفيذ."],
      ["استشارات التصميم والتنفيذ", "عند الحاجة، نقدم المشورة في اختيار وتنسيق شركاء تنفيذ متخصصين. ويتاح الإشراف على التنفيذ بصورة اختيارية عند طلب العميل."],
    ],
  },
  it: {
    eyebrow: "Studio",
    hero: ["Progettiamo", "spazi che", "durano."],
    practiceLabel: "Esperienza professionale in Italia",
    historyLead: "Mason & Arc si fonda su un’esperienza professionale maturata in Italia dal 2015, che comprende il contributo e la supervisione alla realizzazione di importanti progetti di scale e contesti diversi.",
    historyBody: "Questa esperienza ha costruito una conoscenza rigorosa dell’architettura, del coordinamento di dettaglio, della qualità dei materiali e del rapporto tra intento progettuale e spazio realizzato.",
    country: "Italia",
    since: "Dal 2015",
    experience: "Gli anni di pratica professionale in Italia, compresa la supervisione di importanti progetti, guidano oggi la precisione e l’attenzione al dettaglio dello studio.",
    chapterLabel: "Un nuovo capitolo",
    chapterTitle: ["Un nuovo", "capitolo"],
    chapterLead: "Un nuovo studio indipendente di progettazione architettonica con sede in Egitto.",
    chapterBody: "Questa esperienza informa oggi un nuovo capitolo indipendente con sede in Egitto. Mason & Arc si concentra su architettura, interni e sviluppo dettagliato del progetto in Egitto e a livello internazionale, con consulenza alla realizzazione e supervisione dei lavori disponibili in modo selettivo su richiesta del cliente.",
    approachLabel: "Il nostro approccio",
    approachLead: "Il nostro approccio parte dalla comprensione del rapporto tra persone, spazio, contesto e funzione.",
    approachBody: "Ogni progetto è un’opportunità per creare ambienti non solo riconoscibili, ma anche funzionali, misurati e capaci di rispondere al modo in cui le persone vivono, lavorano e interagiscono con ciò che le circonda. Dal primo concept allo sviluppo di materiali, dettagli ed esperienza spaziale, ogni decisione fa parte di un unico processo coerente.",
    servicesLabel: "Cosa facciamo",
    servicesTitle: "Servizi",
    closingTitle: ["Luoghi con", "carattere.", "Scopo.", "Valore duraturo."],
    closingBody: "La nostra ambizione non è semplicemente produrre edifici o interni, ma creare luoghi con carattere, scopo e valore duraturo, dove architettura, interni, esterni e paesaggio diventano un’unica esperienza consapevole.",
    ctaLabel: "Inizia un progetto",
    ctaTitle: ["Progettiamo", "insieme."],
    ctaLink: "Contattaci",
    services: [
      ["Architettura", "Progettiamo edifici che rispondono al contesto e, allo stesso tempo, definiscono una propria identità. Forma, proporzione, struttura, materia, luce e paesaggio vengono considerati insieme per creare un’architettura espressiva e consapevole."],
      ["Interior Design", "Affrontiamo gli interni come estensione dell’architettura, coordinando percorsi, materiali, luce, arredi, texture ed elementi architettonici in un’esperienza coerente."],
      ["Sviluppo del progetto", "Dal concept al progetto di dettaglio, sviluppiamo ogni elemento con precisione, chiarezza e attenzione a materiali, proporzioni e fattibilità."],
      ["Consulenza al progetto e alla realizzazione", "Quando richiesto, assistiamo nella selezione e nel coordinamento di partner specializzati. La supervisione dei lavori è disponibile in modo selettivo su richiesta del cliente."],
    ],
  },
} as const;

export default function AboutPage() {
  const { locale } = useLocale();
  const copy = aboutCopy[locale];
  const services = copy.services.map(([title, text], index) => ({
    number: String(index + 1).padStart(2, "0"),
    title,
    text,
  }));

  return (
    <main className="bg-white text-black">

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="min-h-screen px-6 pb-24 pt-36 md:px-10 md:pt-44">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">

          <div className="lg:col-span-3">
            <p className="text-[9px] uppercase tracking-[0.25em] text-black/50">
              {copy.eyebrow}
            </p>
          </div>

          <div className="lg:col-span-9">
            <h1
              className="
                max-w-[1200px]
                font-[var(--font-display)]
                text-[48px]
                uppercase
                leading-[0.82]
                tracking-[-0.025em]

                sm:text-[60px]
                md:text-[120px]
                lg:text-[150px]
                xl:text-[175px]
              "
            >
              {copy.hero[0]}
              <br />
              {copy.hero[1]}
              <br />
              {copy.hero[2]}
            </h1>
          </div>

        </div>
      </section>


      {/* =====================================================
          HISTORY
      ===================================================== */}

      <section className="border-t border-black/15 px-6 py-24 md:px-10 md:py-32">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">

          <div className="lg:col-span-3">
            <div
              className="
                font-[var(--font-display)]
                text-[60px]
                leading-none
                tracking-[-0.03em]
                md:text-[100px]
              "
            >
              2015
            </div>

            <p className="mt-4 text-[9px] uppercase tracking-[0.2em] text-black/50">
              {copy.practiceLabel}
            </p>
          </div>

          <div className="lg:col-span-7 lg:col-start-5">

            <p
              className="
                text-[20px]
                leading-[1.2]
                tracking-[-0.02em]
                sm:text-[24px]
                md:text-[34px]
                lg:text-[42px]
              "
            >
              {copy.historyLead}
            </p>

            <p
              className="
                mt-10
                max-w-[720px]
                text-[14px]
                leading-[1.6]
                text-black/65
                md:text-[16px]
              "
            >
              {copy.historyBody}
            </p>

          </div>
        </div>
      </section>


      {/* =====================================================
          PROFESSIONAL EXPERIENCE
      ===================================================== */}

      <section className="bg-black px-6 py-28 text-white md:px-10 md:py-40">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-end">

          <div className="lg:col-span-8">
            <div
              className="
                font-[var(--font-display)]
                text-[120px]
                leading-[0.7]
                tracking-[-0.04em]

                sm:text-[180px]
                md:text-[300px]
                lg:text-[360px]
              "
            >
              {copy.country}
            </div>
          </div>

          <div className="lg:col-span-3 lg:col-start-10">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">
              {copy.since}
            </p>

            <p className="mt-5 text-[14px] leading-[1.55] text-white/75 md:text-[16px]">
              {copy.experience}
            </p>
          </div>

        </div>
      </section>


      {/* =====================================================
          A NEW CHAPTER IN EGYPT
      ===================================================== */}

      <section className="px-6 py-28 md:px-10 md:py-40">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-12">

          <div className="lg:col-span-8">

            <p className="mb-8 text-[9px] uppercase tracking-[0.25em] text-black/45">
              {copy.chapterLabel}
            </p>

            <h2
              className="
                font-[var(--font-display)]
                text-[58px]
                uppercase
                leading-[0.78]
                tracking-[-0.025em]

                sm:text-[76px]
                md:text-[130px]
                lg:text-[170px]
              "
            >
              {copy.chapterTitle[0]}
              <br />
              {copy.chapterTitle[1]}
            </h2>

          </div>

          <div className="flex items-end lg:col-span-4">
            <div>

              <p
                className="
                  text-[20px]
                  leading-[1.15]
                  tracking-[-0.02em]
                  sm:text-[24px]
                  md:text-[32px]
                "
              >
                {copy.chapterLead}
              </p>

              <p className="mt-8 text-[14px] leading-[1.6] text-black/65 md:text-[16px]">
                {copy.chapterBody}
              </p>

            </div>
          </div>

        </div>
      </section>


      {/* =====================================================
          APPROACH
      ===================================================== */}

      <section className="border-t border-black/15 px-6 py-24 md:px-10 md:py-32">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">

          <div className="lg:col-span-3">
            <p className="text-[9px] uppercase tracking-[0.25em] text-black/50">
              {copy.approachLabel}
            </p>
          </div>

          <div className="lg:col-span-8 lg:col-start-5">

            <p
              className="
                text-[26px]
                leading-[1.08]
                tracking-[-0.025em]
                sm:text-[30px]
                md:text-[46px]
                lg:text-[56px]
              "
            >
              {copy.approachLead}
            </p>

            <p
              className="
                mt-12
                max-w-[760px]
                text-[15px]
                leading-[1.7]
                text-black/65
                md:text-[17px]
              "
            >
              {copy.approachBody}
            </p>

          </div>
        </div>
      </section>


      {/* =====================================================
          SERVICES
      ===================================================== */}

      <section className="bg-[#f2f2f0] px-6 py-24 md:px-10 md:py-32">

        <div className="mb-20 flex items-end justify-between">

          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-black/45">
              {copy.servicesLabel}
            </p>

            <h2
              className="
                mt-5
                font-[var(--font-display)]
                text-[56px]
                uppercase
                leading-[0.8]
                tracking-[-0.025em]

                sm:text-[72px]
                md:text-[120px]
                lg:text-[150px]
              "
            >
              {copy.servicesTitle}
            </h2>
          </div>

          <span className="hidden text-[9px] uppercase tracking-[0.2em] text-black/40 md:block">
            01 — 04
          </span>

        </div>


        <div className="border-t border-black/20">

          {services.map((service) => (
            <div
              key={service.number}
              className="
                grid
                grid-cols-1
                gap-8
                border-b
                border-black/20
                py-10

                md:grid-cols-12
                md:gap-10
                md:py-14
              "
            >

              <div className="md:col-span-1">
                <span className="text-[9px] tracking-[0.2em] text-black/40">
                  {service.number}
                </span>
              </div>

              <div className="md:col-span-4">
                <h3
                  className="
                    font-[var(--font-display)]
                    text-[42px]
                    uppercase
                    leading-[0.8]
                    tracking-[-0.02em]

                    sm:text-[48px]
                    md:text-[64px]
                    lg:text-[78px]
                  "
                >
                  {service.title}
                </h3>
              </div>

              <div className="md:col-span-5 md:col-start-8">
                <p
                  className="
                    max-w-[560px]
                    text-[14px]
                    leading-[1.65]
                    text-black/65
                    md:text-[16px]
                  "
                >
                  {service.text}
                </p>
              </div>

            </div>
          ))}

        </div>
      </section>


      {/* =====================================================
          CLOSING
      ===================================================== */}

      <section className="bg-black px-6 py-28 text-white md:px-10 md:py-40">

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">

          <div className="lg:col-span-9">

            <h2
              className="
                font-[var(--font-display)]
                text-[48px]
                uppercase
                leading-[0.8]
                tracking-[-0.025em]

                sm:text-[64px]
                md:text-[120px]
                lg:text-[155px]
              "
            >
              {copy.closingTitle[0]}
              <br />
              {copy.closingTitle[1]}
              <br />
              {copy.closingTitle[2]}
              <br />
              {copy.closingTitle[3]}
            </h2>

          </div>

          <div className="lg:col-span-3 lg:col-start-10 lg:flex lg:items-end">

            <p className="text-[14px] leading-[1.65] text-white/60 md:text-[16px]">
              {copy.closingBody}
            </p>

          </div>

        </div>
      </section>


      {/* =====================================================
          CONTACT CTA
      ===================================================== */}

      <section className="px-6 py-24 md:px-10 md:py-32">

        <div className="flex flex-col gap-10 border-t border-black/20 pt-8 md:flex-row md:items-end md:justify-between">

          <div>

            <p className="text-[9px] uppercase tracking-[0.25em] text-black/45">
              {copy.ctaLabel}
            </p>

            <h2
              className="
                mt-5
                font-[var(--font-display)]
                text-[56px]
                uppercase
                leading-[0.8]
                tracking-[-0.025em]

                sm:text-[72px]
                md:text-[110px]
                lg:text-[140px]
              "
            >
              {copy.ctaTitle[0]}
              <br />
              {copy.ctaTitle[1]}
            </h2>

          </div>

          <Link
            href="/contact"
            className="
              inline-flex
              items-center
              gap-4
              border-b
              border-black
              pb-2
              text-[10px]
              uppercase
              tracking-[0.2em]
              transition-opacity
              duration-300
              hover:opacity-50
            "
          >
            {copy.ctaLink}
            <span className="text-base">↗</span>
          </Link>

        </div>
      </section>

    </main>
  );
}
