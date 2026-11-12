"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { WebsiteProject, WebsiteLocale, LocalizedText } from "@/lib/server/websiteProjects";

const supportedLocales: WebsiteLocale[] = ["en", "ar", "it"];

export const publicCopy = {
  en: {
    home: "Home",
    projects: "Projects",
    services: "Services",
    about: "About",
    contact: "Contact",
    workspace: "Workspace login",
    studio: "Mason & Arc Studio",
    language: "Language",
    archiveEyebrow: "01 — Archive",
    archiveTitle: "Projects Archive.",
    archiveIntro: "Architecture, interiors, and spaces developed through design, material and execution.",
    publishedWork: "Published work",
    projectSingular: "project",
    projectPlural: "projects",
    viewProject: "View project",
    emptyProjects: "No published projects yet.",
    overview: "Overview",
    projectDetails: "Project Details",
    type: "Type",
    location: "Location",
    timeline: "Timeline",
    documentation: "Project Documentation",
    theWork: "The Work.",
    allProjects: "All Projects",
    footerTagline: "Architecture, design, and execution shaped around timeless thinking, material honesty, and human experience.",
    navigate: "Navigate",
    rights: "All rights reserved.",
    heroDesign: "Design",
    heroBuild: "Designed as one.",
    heroExperience: "Built as intended.",
    heroIntro: "We design spaces, identities, and digital experiences around the people who use them. Every project starts with listening, then finding a clear, thoughtful way forward.",
    philosophyLabel: "Studio Philosophy",
    philosophyLine1: "We create architecture",
    philosophyLine2: "that balances",
    philosophyLine3: "emotion, function",
    philosophyLine4: "and simplicity.",
    philosophyIntro: "Every project has its own story. We take time to understand the people, purpose, and context behind it before deciding what the design should become.",
    featuredLabel: "Projects",
    featuredTitle1: "Experience",
    featuredTitle2: "our work.",
    featuredIntro: "A closer look at the ideas, details, and decisions behind our work.",
    view: "View",
    archive: "Archive",
    exploreAll: "Explore all projects",
    experienceMore: "Experience More",
    workWays1: "Explore the",
    workWays2: "different ways",
    workWays3: "we work.",
  },
  ar: {
    home: "الرئيسية",
    projects: "المشروعات",
    services: "الخدمات",
    about: "عن الاستوديو",
    contact: "تواصل معنا",
    workspace: "دخول مساحة العمل",
    studio: "استوديو Mason & Arc",
    language: "اللغة",
    archiveEyebrow: "01 — أرشيف المشروعات",
    archiveTitle: "أرشيف المشروعات.",
    archiveIntro: "مشروعات معمارية وداخلية تتطور من خلال التصميم والخامات والتنفيذ.",
    publishedWork: "الأعمال المنشورة",
    projectSingular: "مشروع",
    projectPlural: "مشروعات",
    viewProject: "عرض المشروع",
    emptyProjects: "لا توجد مشروعات منشورة بعد.",
    overview: "نظرة عامة",
    projectDetails: "تفاصيل المشروع",
    type: "النوع",
    location: "الموقع",
    timeline: "المدة الزمنية",
    documentation: "توثيق المشروع",
    theWork: "المشروع.",
    allProjects: "كل المشروعات",
    footerTagline: "عمارة وتصميم وتنفيذ يصنعها التفكير الخالد وصدق الخامات وتجربة الإنسان.",
    navigate: "تصفّح",
    rights: "جميع الحقوق محفوظة.",
    heroDesign: "تصميم",
    heroBuild: "Designed as one.",
    heroExperience: "Built as intended.",
    heroIntro: "نصمم مساحات وهويات وتجارب رقمية تبدأ بفهم الناس واحتياجاتهم، ثم نحول الأفكار إلى حلول واضحة ومدروسة.",
    philosophyLabel: "فلسفة الاستوديو",
    philosophyLine1: "نصنع عمارة",
    philosophyLine2: "توازن بين",
    philosophyLine3: "الإحساس والوظيفة",
    philosophyLine4: "والبساطة.",
    philosophyIntro: "لكل مشروع حكايته. نبدأ بالاستماع وفهم الناس وطبيعة المكان والهدف، ثم نختار التصميم المناسب له.",
    featuredLabel: "المشروعات",
    featuredTitle1: "اكتشف",
    featuredTitle2: "أعمالنا.",
    featuredIntro: "مجموعة مختارة من المشروعات تستكشف العمارة والتصميم الداخلي والخامات وتجربة الفراغ.",
    view: "عرض",
    archive: "الأرشيف",
    exploreAll: "استكشف كل المشروعات",
    experienceMore: "اكتشف المزيد",
    workWays1: "تعرّف على",
    workWays2: "الطرق المختلفة",
    workWays3: "التي نعمل بها.",
  },
  it: {
    home: "Home",
    projects: "Progetti",
    services: "Servizi",
    about: "Studio",
    contact: "Contatti",
    workspace: "Accesso area di lavoro",
    studio: "Studio Mason & Arc",
    language: "Lingua",
    archiveEyebrow: "01 — Archivio",
    archiveTitle: "Archivio Progetti.",
    archiveIntro: "Architettura, interni e spazi sviluppati attraverso progetto, materia e realizzazione.",
    publishedWork: "Progetti pubblicati",
    projectSingular: "progetto",
    projectPlural: "progetti",
    viewProject: "Apri il progetto",
    emptyProjects: "Nessun progetto pubblicato.",
    overview: "Panoramica",
    projectDetails: "Dettagli del progetto",
    type: "Tipologia",
    location: "Luogo",
    timeline: "Periodo",
    documentation: "Documentazione del progetto",
    theWork: "Il Progetto.",
    allProjects: "Tutti i Progetti",
    footerTagline: "Architettura, design e realizzazione plasmati da un pensiero senza tempo, dall’autenticità dei materiali e dall’esperienza umana.",
    navigate: "Naviga",
    rights: "Tutti i diritti riservati.",
    heroDesign: "Progettare",
    heroBuild: "Designed as one.",
    heroExperience: "Built as intended.",
    heroIntro: "Progettiamo spazi, identità ed esperienze digitali partendo dalle persone. Ascoltiamo, comprendiamo e trasformiamo le idee in soluzioni chiare e attente.",
    philosophyLabel: "Filosofia dello studio",
    philosophyLine1: "Creiamo architetture",
    philosophyLine2: "che equilibrano",
    philosophyLine3: "emozione, funzione",
    philosophyLine4: "e semplicità.",
    philosophyIntro: "Ogni progetto ha una storia diversa. Prima ascoltiamo e comprendiamo le persone, il contesto e gli obiettivi; poi troviamo la risposta progettuale giusta.",
    featuredLabel: "Progetti",
    featuredTitle1: "Scopri",
    featuredTitle2: "il nostro lavoro.",
    featuredIntro: "Una selezione di progetti che esplora architettura, interni, materia ed esperienza dello spazio.",
    view: "Apri",
    archive: "Archivio",
    exploreAll: "Esplora tutti i progetti",
    experienceMore: "Scopri di più",
    workWays1: "Esplora",
    workWays2: "i diversi modi",
    workWays3: "in cui lavoriamo.",
  },
} as const;

type PublicCopy = { [Key in keyof typeof publicCopy.en]: string };
type LocaleContextValue = {
  locale: WebsiteLocale;
  direction: "ltr" | "rtl";
  copy: PublicCopy;
  setLocale: (locale: WebsiteLocale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: string | null): value is WebsiteLocale {
  return Boolean(value && supportedLocales.includes(value as WebsiteLocale));
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [locale, updateLocale] = useState<WebsiteLocale>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("mason-public-locale");
    if (isLocale(saved)) updateLocale(saved);
  }, []);

  useEffect(() => {
    const isWorkspace = pathname.startsWith("/app");
    document.documentElement.lang = isWorkspace ? "en" : locale;
    document.documentElement.dir = isWorkspace || locale !== "ar" ? "ltr" : "rtl";
  }, [locale, pathname]);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    direction: locale === "ar" ? "rtl" : "ltr",
    copy: publicCopy[locale] as PublicCopy,
    setLocale(nextLocale) {
      updateLocale(nextLocale);
      window.localStorage.setItem("mason-public-locale", nextLocale);
    },
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside LocaleProvider.");
  return value;
}

export function projectCopy(project: WebsiteProject, locale: WebsiteLocale) {
  if (locale === "en") {
    return { title: project.title, location: project.location, category: project.category, description: project.description };
  }
  const translated = project.translations?.[locale];
  return {
    title: translated?.title || project.title,
    location: translated?.location || project.location,
    category: translated?.category || project.category,
    description: translated?.description || project.description,
  };
}

export function localizedText(value: LocalizedText, locale: WebsiteLocale) {
  return value?.[locale] || value?.en || "";
}

export function localizedYear(value: string, locale: WebsiteLocale) {
  if (locale === "ar") return value.replace(/ongoing/gi, "قيد التنفيذ");
  if (locale === "it") return value.replace(/ongoing/gi, "In corso");
  return value;
}
