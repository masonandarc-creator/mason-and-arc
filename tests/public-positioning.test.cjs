const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");

const read = (file) => readFileSync(path.join(__dirname, "..", file), "utf8");

test("public services present Mason & Arc as design-first with optional delivery support", () => {
  const services = read("components/services/ServicesHero.tsx");

  assert.match(services, /Design & Delivery Advisory/);
  assert.match(services, /Where required, we advise on the selection and coordination of specialist delivery partners/);
  assert.doesNotMatch(services, /Design\.\s*Build\.\s*Experience\./);
  assert.doesNotMatch(services, /Architecture,\s*interior,\s*design and execution\./);
});

test("City Edge records execution supervision as a client-requested exception", () => {
  const project = read("lib/data/projects.ts");

  assert.match(project, /Execution Supervision — at the client’s request/);
  assert.match(project, /provided execution supervision for City Edge/);
  assert.match(project, /الإشراف على التنفيذ — بناءً على طلب العميل/);
  assert.doesNotMatch(project, /landmark 12-storey/);
  assert.doesNotMatch(project, /first project in the country/);
});

test("locked brand lines and languages remain present", () => {
  const locale = read("components/i18n/LocaleProvider.tsx");

  assert.match(locale, /Designed as one\./);
  assert.match(locale, /Built as intended\./);
  assert.match(locale, /const supportedLocales: WebsiteLocale\[\] = \["en", "ar", "it"\]/);
});

test("public calls to action remain design-first", () => {
  const about = read("app/about/page.tsx");
  const loader = read("components/ui/Loader.tsx");

  assert.match(about, /design\./i);
  assert.doesNotMatch(about, /Let(?:&apos;|’)s\s*[\s\S]{0,40}build\./i);
  assert.match(loader, /FROM CONCEPT TO DETAIL/);
  assert.doesNotMatch(loader, /FROM DRAWING TO REALITY/);
});

test("About presents Italy as institutional experience and Egypt as a new independent chapter", () => {
  const about = read("app/about/page.tsx");

  assert.match(about, /professional experience developed in Italy since 2015/);
  assert.match(about, /new and independent chapter/);
  assert.match(about, /Execution supervision is available selectively when requested by the client/);
  assert.doesNotMatch(about, /Founded in Italy|first branch in Egypt|350\+|founder|مؤسس|المؤسس|fondatore/i);
});

test("About and contact content remain complete in English, Arabic, and Italian", () => {
  const about = read("app/about/page.tsx");
  const contact = read("app/contact/ContactForm.tsx");

  assert.match(about, /خبرة مهنية في إيطاليا/);
  assert.match(about, /Esperienza professionale in Italia/);
  assert.match(contact, /حدّثنا عن مشروعك/);
  assert.match(contact, /Raccontaci il tuo progetto/);
  assert.match(contact, /\/privacy/);
});

test("services expose the same four design-first disciplines throughout", () => {
  const themes = read("components/sections/Themes.tsx");
  assert.doesNotMatch(themes, /\"Research\"|\"Collaboration\"|\"البحث\"|\"التعاون\"/);
});

test("public metadata relies on the root Mason & Arc title template without duplication", () => {
  for (const path of ["app/about/layout.tsx", "app/services/page.tsx", "app/projects/page.tsx", "app/contact/page.tsx"]) {
    const source = read(path);
    assert.doesNotMatch(source, /title:\s*\"[^\"]*\| Mason & Arc\"/);
  }
});

test("website inquiries trigger both an internal and asynchronous email alert", () => {
  const leads = read("app/api/leads/route.ts");
  assert.match(leads, /INSERT INTO notifications/);
  assert.match(leads, /after\(async \(\) =>/);
  assert.match(leads, /sendGoogleMail/);
  assert.match(leads, /LEADS_NOTIFICATION_EMAIL/);
});

test("new website projects start with a multilingual architecture case-study template", () => {
  const editor = read("app/app/admin/website-projects/page.tsx");
  for (const section of ["Project Overview", "Concept", "Site & Context", "Plans & Sections", "Façade Development", "Spatial Experience", "Materials & Details", "Visualization"]) {
    assert.match(editor, new RegExp(section.replace(/[&]/g, "\\&")));
  }
  assert.match(editor, /Project publishing kit/);
  assert.match(editor, /Nothing is public until Publish is selected/);
});
