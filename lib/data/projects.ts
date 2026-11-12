const emptyText = { en: "", ar: "", it: "" };

export const cityEdgeSections = [
  {
    id: "concept",
    eyebrow: emptyText,
    title: { en: "Concept", ar: "الفكرة التصميمية", it: "Concept" },
    body: {
      en: "City Edge is shaped by a clear relationship between program, circulation, façade, and spatial experience, expressed through one coherent architectural identity.",
      ar: "يتشكل سيتي إيدج من علاقة واضحة بين البرنامج والحركة والواجهة والتجربة المكانية، ضمن هوية معمارية متماسكة.",
      it: "City Edge nasce da una relazione chiara tra programma, circolazione, facciata ed esperienza spaziale, espressa attraverso un’identità architettonica coerente.",
    },
    hero_statement: emptyText,
    layout: "editorial" as const,
    is_visible: true,
    images: [
      {
        id: "city-edge-concept-board",
        image_url: "/images/projects/city-edge/city-edge-concept-board.jpg",
        caption: {
          en: "City Edge — concept development and façade studies.",
          ar: "سيتي إيدج — تطوير الفكرة ودراسات الواجهة.",
          it: "City Edge — sviluppo del concept e studi di facciata.",
        },
        alt_text: {
          en: "City Edge concept board",
          ar: "لوحة الفكرة التصميمية لسيتي إيدج",
          it: "Tavola concettuale di City Edge",
        },
        layout: "drawing" as const,
      },
    ],
  },
  {
    id: "program",
    eyebrow: emptyText,
    title: { en: "Program", ar: "البرنامج", it: "Programma" },
    body: {
      en: "The design organizes the project’s different uses through clear circulation, considered transitions, and a unified architectural language.",
      ar: "ينظم التصميم الاستخدامات المختلفة للمشروع من خلال حركة واضحة وانتقالات مدروسة ولغة معمارية موحّدة.",
      it: "Il progetto organizza le diverse funzioni attraverso percorsi chiari, transizioni studiate e un linguaggio architettonico unitario.",
    },
    hero_statement: emptyText,
    layout: "editorial" as const,
    is_visible: true,
    images: [],
  },
  {
    id: "scope",
    eyebrow: emptyText,
    title: { en: "Design Scope", ar: "نطاق التصميم", it: "Ambito progettuale" },
    body: {
      en: "Architectural Design\nFaçade Design\nDesign Development\nExecution Supervision — at the client’s request",
      ar: "التصميم المعماري\nتصميم الواجهات\nتطوير التصميم\nالإشراف على التنفيذ — بناءً على طلب العميل",
      it: "Progettazione architettonica\nProgetto di facciata\nSviluppo del progetto\nSupervisione della realizzazione — su richiesta del cliente",
    },
    hero_statement: emptyText,
    layout: "editorial" as const,
    is_visible: true,
    images: [],
  },
  {
    id: "status",
    eyebrow: emptyText,
    title: { en: "Status", ar: "الحالة", it: "Stato" },
    body: {
      en: "Ongoing\nStarted 2025",
      ar: "جارٍ\nبدأ في ٢٠٢٥",
      it: "In corso\nAvviato nel 2025",
    },
    hero_statement: emptyText,
    layout: "editorial" as const,
    is_visible: true,
    images: [],
  },
  {
    id: "execution-supervision",
    eyebrow: emptyText,
    title: { en: "Execution Supervision", ar: "الإشراف على التنفيذ", it: "Supervisione della realizzazione" },
    body: {
      en: "At the client’s request, Mason & Arc provided execution supervision for City Edge, helping maintain the approved architectural vision throughout delivery.",
      ar: "بناءً على طلب العميل، تولّى Mason & Arc الإشراف على تنفيذ سيتي إيدج للمساعدة في الحفاظ على الرؤية المعمارية المعتمدة خلال مرحلة التنفيذ.",
      it: "Su richiesta del cliente, Mason & Arc ha supervisionato la realizzazione di City Edge, contribuendo a preservare la visione architettonica approvata durante questa fase.",
    },
    hero_statement: {
      en: "Designed by us.\nSupervised on request.",
      ar: "من تصميمنا.\nوالإشراف حسب الطلب.",
      it: "Progettato da noi.\nSupervisionato su richiesta.",
    },
    layout: "editorial" as const,
    is_visible: true,
    images: [],
  },
  {
    id: "documentation",
    eyebrow: {
      en: "Project Documentation",
      ar: "توثيق المشروع",
      it: "Documentazione di progetto",
    },
    title: { en: "The Work.", ar: "العمل.", it: "Il lavoro." },
    body: emptyText,
    hero_statement: emptyText,
    layout: "full_bleed" as const,
    is_visible: true,
    images: [
      {
        id: "city-edge-the-work",
        image_url: "/images/projects/city-edge/city-edge-exterior-wip.jpeg",
        caption: emptyText,
        alt_text: {
          en: "City Edge exterior",
          ar: "واجهة سيتي إيدج",
          it: "Esterno di City Edge",
        },
        layout: "full_bleed" as const,
      },
    ],
  },
];

export const projects = [
  {
    id: 1,
    slug: "city-edge",
    title: "City Edge",
    location: "Fayoum City, Egypt",
    year: "2025 — Ongoing",

    image: "/images/projects/city-edge/city-edge-exterior-wip.jpeg",

    description:
      "City Edge is an architectural design project in Fayoum City, Egypt, developed around a clear relationship between program, circulation, façade, and spatial experience. Mason & Arc also provided execution supervision at the client’s request.",

    gallery: [
      "/images/projects/city-edge/city-edge-exterior-wip.jpeg",
    ],
    contentSections: cityEdgeSections,
  },
];
