import { query } from "@/lib/server/db";
import { cityEdgeSections, projects as fallbackProjects } from "@/lib/data/projects";

export type WebsiteLocale = "en" | "ar" | "it";
export type LocalizedProjectCopy = { title: string; location: string; category: string; description: string };
export type LocalizedText = Record<WebsiteLocale, string>;
export type WebsiteProjectSectionImage = { id: string; image_url: string; caption: LocalizedText; alt_text: LocalizedText; layout: "auto" | "landscape" | "portrait" | "drawing" | "full_bleed" };
export type WebsiteProjectSection = { id: string; eyebrow: LocalizedText; title: LocalizedText; body: LocalizedText; hero_statement: LocalizedText; layout: "editorial" | "gallery" | "drawings" | "full_bleed"; is_visible: boolean; images: WebsiteProjectSectionImage[] };
export type WebsiteProject = { id: string; slug: string; title: string; location: string; year: string; category: string; description: string; image_url: string; gallery: string[]; translations: Partial<Record<Exclude<WebsiteLocale, "en">, Partial<LocalizedProjectCopy>>>; content_sections: WebsiteProjectSection[]; published: boolean };

const fields = "id,slug,title,location,year,category,description,image_url,gallery,translations,content_sections,published,updated_at";
const cityEdgeDescription = "City Edge is an architectural design project in Fayoum City, Egypt, developed around a clear relationship between program, circulation, façade, and spatial experience. Mason & Arc also provided execution supervision at the client’s request.";
const cityEdgeTranslations: WebsiteProject["translations"] = {
  ar: {
    title: "سيتي إيدج",
    location: "مدينة الفيوم، مصر",
    category: "العمارة",
    description: "سيتي إيدج مشروع تصميم معماري في مدينة الفيوم بمصر، تطور حول علاقة واضحة بين البرنامج والحركة والواجهة والتجربة المكانية. كما تولّى Mason & Arc الإشراف على التنفيذ بناءً على طلب العميل.",
  },
  it: {
    title: "City Edge",
    location: "Fayoum City, Egitto",
    category: "Architettura",
    description: "City Edge è un progetto di architettura a Fayoum City, in Egitto, sviluppato attorno a una relazione chiara tra programma, circolazione, facciata ed esperienza spaziale. Mason & Arc ha inoltre supervisionato la realizzazione su richiesta del cliente.",
  },
};
const fallbackWebsiteProjects: WebsiteProject[] = fallbackProjects.map((project) => ({
  id: String(project.id),
  slug: project.slug,
  title: project.title,
  location: project.location,
  year: project.year,
  category: "Architecture",
  description: project.description,
  image_url: project.image,
  gallery: project.gallery,
  translations: project.slug === "city-edge" ? cityEdgeTranslations : {},
  content_sections: project.contentSections,
  published: true,
}));
const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];
function localized(value: unknown): LocalizedText { const item = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; return { en: typeof item.en === "string" ? item.en : "", ar: typeof item.ar === "string" ? item.ar : "", it: typeof item.it === "string" ? item.it : "" }; }
function publicImage(projectId: string, source: string, updatedAt: unknown, params: string) { if (!source.startsWith("data:image/")) return source; const version = new Date(updatedAt as string | number | Date).getTime() || 0; return `/api/public/website-projects/${encodeURIComponent(projectId)}/image?${params}&v=${version}`; }

function legacySections(row: Record<string, unknown>): WebsiteProjectSection[] {
  const id = String(row.id || ""); const updatedAt = row.updated_at;
  return (Array.isArray(row.content_sections) ? row.content_sections : []).flatMap((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const raw = item as Record<string, unknown>; const sectionId = typeof raw.id === "string" && raw.id ? raw.id : `section-${index + 1}`;
    return [{ id: sectionId, eyebrow: localized(raw.eyebrow), title: localized(raw.title), body: localized(raw.body), hero_statement: localized(raw.hero_statement), layout: "editorial" as const, is_visible: raw.is_visible !== false, images: strings(raw.images).map((image, imageIndex) => ({ id: `${sectionId}-${imageIndex}`, image_url: publicImage(id, image, updatedAt, `kind=section&section=${encodeURIComponent(sectionId)}&index=${imageIndex}`), caption: localized({}), alt_text: localized({}), layout: "auto" as const })) }];
  });
}

export function mapWebsiteProject(row: Record<string, unknown>, relationSections?: Record<string, unknown>[], useCanonicalPublicCopy = false): WebsiteProject {
  const id = String(row.id || ""); const updatedAt = row.updated_at;
  const slug = String(row.slug || "");
  const savedSections = relationSections?.length ? relationSections.map((raw) => ({ id: String(raw.id), eyebrow: localized(raw.eyebrow), title: localized(raw.title), body: localized(raw.description), hero_statement: localized(raw.hero_statement), layout: ["gallery", "drawings", "full_bleed"].includes(String(raw.layout)) ? String(raw.layout) as WebsiteProjectSection["layout"] : "editorial", is_visible: raw.is_visible !== false, images: Array.isArray(raw.images) ? (raw.images as Record<string, unknown>[]).map((image) => ({ id: String(image.id), image_url: publicImage(id, String(image.image_url || ""), updatedAt, `kind=section-image&id=${encodeURIComponent(String(image.id))}`), caption: localized(image.caption), alt_text: localized(image.alt_text), layout: ["landscape", "portrait", "drawing", "full_bleed"].includes(String(image.layout)) ? String(image.layout) as WebsiteProjectSectionImage["layout"] : "auto" })) : [] })) : legacySections(row);
  const sections = slug === "city-edge" && useCanonicalPublicCopy
    ? cityEdgeSections
    : savedSections.length || slug !== "city-edge" ? savedSections : cityEdgeSections;
  const savedTranslations = row.translations && typeof row.translations === "object" && !Array.isArray(row.translations) ? row.translations as WebsiteProject["translations"] : {};
  const translations = slug === "city-edge" && useCanonicalPublicCopy ? cityEdgeTranslations : savedTranslations;
  let cover = typeof row.image_url === "string" ? row.image_url : "";
  // Recover the City Edge cover from the checked-in public asset if an older
  // admin save replaced its original payload with its own public proxy URL.
  if (slug === "city-edge" && cover.startsWith("/api/public/website-projects/")) {
    cover = "/images/projects/city-edge/city-edge-exterior-wip.jpeg";
  }
  const savedDescription = String(row.description || "");
  const description = slug === "city-edge" && useCanonicalPublicCopy
    ? cityEdgeDescription
    : savedDescription;
  const savedLocation = String(row.location || "");
  const location = slug === "city-edge" && savedLocation === "Fayoum, Egypt" ? "Fayoum City, Egypt" : savedLocation;
  return { id, slug, title: String(row.title || ""), location, year: String(row.year || ""), category: String(row.category || ""), description, image_url: publicImage(id, cover, updatedAt, "kind=cover"), gallery: strings(row.gallery).map((image, index) => publicImage(id, image, updatedAt, `kind=gallery&index=${index}`)), translations, content_sections: sections, published: Boolean(row.published) };
}

async function sectionRows(projectIds: string[]) {
  if (!projectIds.length) return new Map<string, Record<string, unknown>[]>();
  const result = await query<Record<string, unknown>>(`SELECT section.*, COALESCE(jsonb_agg(jsonb_build_object('id', image.id, 'image_url', image.image_url, 'caption', image.caption, 'alt_text', image.alt_text, 'layout', image.layout) ORDER BY image.display_order) FILTER (WHERE image.id IS NOT NULL), '[]'::jsonb) AS images FROM website_project_sections section LEFT JOIN website_project_section_images image ON image.section_id=section.id WHERE section.project_id = ANY($1::text[]) GROUP BY section.id ORDER BY section.display_order`, [projectIds]);
  const grouped = new Map<string, Record<string, unknown>[]>(); for (const row of result.rows) { const key = String(row.project_id); grouped.set(key, [...(grouped.get(key) || []), row]); } return grouped;
}
async function hydrate(rows: Record<string, unknown>[], useCanonicalPublicCopy = false) { const grouped = await sectionRows(rows.map((row) => String(row.id))); return rows.map((row) => mapWebsiteProject(row, grouped.get(String(row.id)), useCanonicalPublicCopy)); }
export async function listPublishedWebsiteProjects() { if (!process.env.DATABASE_URL) return fallbackWebsiteProjects; const result = await query<Record<string, unknown>>(`SELECT ${fields} FROM website_projects WHERE published=true ORDER BY updated_at DESC`); return hydrate(result.rows, true); }
export async function getPublishedWebsiteProject(slug: string) { if (!process.env.DATABASE_URL) return fallbackWebsiteProjects.find((project) => project.slug === slug) || null; const result = await query<Record<string, unknown>>(`SELECT ${fields} FROM website_projects WHERE slug=$1 AND published=true LIMIT 1`, [slug]); const projects = await hydrate(result.rows, true); return projects[0] || null; }
export async function listAdminWebsiteProjects() { const result = await query<Record<string, unknown>>(`SELECT ${fields} FROM website_projects ORDER BY updated_at DESC`); return hydrate(result.rows); }
export async function getAdminWebsiteProject(id: string) { const result = await query<Record<string, unknown>>(`SELECT ${fields} FROM website_projects WHERE id=$1 LIMIT 1`, [id]); const projects = await hydrate(result.rows); return projects[0] || null; }
