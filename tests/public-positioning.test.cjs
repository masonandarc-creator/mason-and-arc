const { test } = require("node:test");
const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");

const read = (file) => readFileSync(path.join(__dirname, "..", file), "utf8");

test("public services present Mason & Arc through four connected practices", () => {
  const services = read("components/services/ServicesHero.tsx");

  for (const discipline of [
    "Architecture & Interiors",
    "Branding & Creative Direction",
    "Visualization & Communication",
    "Digital Experiences",
  ]) {
    assert.match(services, new RegExp(discipline.replaceAll("&", "\\&")));
  }
  assert.match(services, /one working process/i);
  assert.match(services, /Design Systems for Developers/);
  assert.match(services, /Signature Design Language/);
  assert.match(services, /Motion & Architectural Storytelling/);
  assert.match(services, /Brand Experience Design/);
  assert.doesNotMatch(services, /Design & Delivery Advisory/);
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

test("public positioning and the approved loader remain intact", () => {
  const about=read("app/about/page.tsx");
  const loader=read("components/ui/Loader.tsx");
  assert.match(about,/independent, multidisciplinary design studio/);
  assert.match(loader,/FROM CONCEPT TO DETAIL/);
  assert.doesNotMatch(loader,/FROM DRAWING TO REALITY/);
});
test("current live About copy states Italian roots and a 2024 Egypt chapter", () => {
  const about=read("app/about/page.tsx");
  assert.match(about,/Our roots in Italy/);
  assert.match(about,/current Mason & Arc chapter began in 2024/);
  assert.match(about,/based in Egypt/);
  assert.doesNotMatch(about,/350\+|founder|مؤسس|المؤسس|fondatore/i);
});
test("current live About story and timeline retain distinct studio chapters", () => {
  const about=read("app/about/page.tsx");
  assert.match(about,/Origins in Italy/);
  assert.match(about,/Mason & Arc, a new chapter/);
  assert.match(about,/Design \+ Execution/);
  assert.match(about,/the current Mason & Arc chapter began in 2024/i);
});
test("live About and contact keep English, Arabic and Italian narratives", () => {
  const about=read("app/about/page.tsx");
  const contact=read("app/contact/ContactForm.tsx");
  assert.match(about,/An Italian origin\. A new chapter\./);
  assert.match(about,/جذور إيطالية/);
  assert.match(about,/Origini italiane/);
  assert.match(contact,/privacyPrefix/);
  assert.match(contact,/إشعار الخصوصية/);
  assert.match(contact,/Informativa sulla privacy/);
  assert.match(contact,/\/privacy/);
});
test("service categories expose the same four practices throughout", () => {
  const themes = read("components/sections/Themes.tsx");
  for (const discipline of ["Architecture & Interiors", "Branding & Creative Direction", "Visualization & Communication", "Digital Experiences"]) {
    assert.match(themes, new RegExp(discipline.replaceAll("&", "\\&")));
  }
  assert.doesNotMatch(themes, /Design Development|Delivery Advisory/);
  assert.doesNotMatch(themes, /\"Research\"|\"Collaboration\"|\"البحث\"|\"التعاون\"/);
});

test("services page stays focused and avoids repeating the About timeline", () => {
  const servicesPage = read("app/services/page.tsx");
  const servicesHero = read("components/services/ServicesHero.tsx");
  const serviceDetail = read("components/services/ServiceDetail.tsx");
  const servicePage = read("app/services/[slug]/page.tsx");
  const sitemap = read("app/sitemap.ts");

  assert.doesNotMatch(servicesPage, /<Timeline|<Themes/);
  assert.doesNotMatch(servicesPage, /ServicesProjects|listPublishedWebsiteProjects/);
  assert.equal(existsSync(path.join(__dirname, "..", "components/services/Projects.tsx")), false);
  assert.match(servicesHero, /The studio brings space, identity, image and digital experience/);
  assert.doesNotMatch(servicesHero, /Mason & Arc brings space/);
  assert.doesNotMatch(servicesHero, /copy\.fieldLabels\.examples/);
  assert.match(servicesHero, /href=\{`\/services\/\$\{serviceSlugs\[index\]\}`\}/);
  assert.match(serviceDetail, /service\.capabilities/);
  assert.match(serviceDetail, /service\.deliverables/);
  assert.match(servicePage, /generateStaticParams/);
  assert.match(sitemap, /services\/\$\{slug\}/);
  assert.match(servicesHero, /Think\./);
  assert.match(servicesHero, /Connect\./);
  assert.match(servicesHero, /Make\./);
  assert.doesNotMatch(servicesHero, /service\.intro/);
});

test("contact hero keeps an editorial scale without overwhelming the details", () => {
  const contactHero = read("components/contact/ContactHero.tsx");
  assert.match(contactHero, /text-\[clamp\(3\.5rem,7vw,6\.5rem\)\]/);
  assert.doesNotMatch(contactHero, /lg:text-\[150px\]/);
  assert.doesNotMatch(contactHero, /Start a conversation|Space · Identity · Image · Digital|copy\.start|copy\.disciplines/);
});

test("public navigation keeps Mason & Arc OS access and current hero copy", () => {
  const navbar=read("components/layout/Navbar.tsx");
  const hero=read("components/home/Hero.tsx");
  assert.match(navbar,/href="\/app\/login"/);
  assert.match(navbar,/copy\.workspace/);
  assert.match(hero,/copy\.heroBuild/);
  assert.match(hero,/copy\.heroExperience/);
  assert.doesNotMatch(hero,/copy\.heroIntro/);
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
  assert.match(leads, /Service:/);
});

test("current live homepage retains hero, disciplines, projects and perspective", () => {
  const home=read("app/page.tsx");
  assert.match(home,/<Hero imageUrl=\{approvedHeroImage\}/);
  assert.match(home,/<Disciplines/);
  assert.match(home,/<Projects projects=\{projects\}/);
  assert.match(home,/<StudioPerspective \/>/);
});
test("the empty Journal feature is fully removed from public and admin surfaces", () => {
  const footer = read("components/layout/Footer.tsx");
  const sitemap = read("app/sitemap.ts");
  const schema = read("db/schema.sql");
  assert.doesNotMatch(footer, /\/journal|copy\.journal/);
  assert.doesNotMatch(sitemap, /journal/i);
  assert.doesNotMatch(schema, /website_journal_articles/);
  assert.equal(existsSync(path.join(__dirname, "..", "app/journal/page.tsx")), false);
  assert.equal(existsSync(path.join(__dirname, "..", "app/app/admin/journal/page.tsx")), false);
});

test("portfolio copy is honest about the current published archive and avoids duplicate service lists", () => {
  const locale = read("components/i18n/LocaleProvider.tsx");
  const homeProjects = read("components/home/Projects.tsx");
  assert.doesNotMatch(locale, /completed and approved/i);
  assert.doesNotMatch(homeProjects, /experienceMore|workWays|themes\.map/);
  assert.match(homeProjects, /translated\.category/);
});

test("homepage point of view uses original multidisciplinary language", () => {
  const locale = read("components/i18n/LocaleProvider.tsx");
  assert.match(locale, /Our Point of View/);
  assert.match(locale, /One clear idea/);
  assert.match(locale, /space, identity, image and digital experience/);
  assert.doesNotMatch(locale, /Studio Philosophy|lasting relevance/);
});

test("current live About typography stays restrained and story-driven", () => {
  const about=read("app/about/page.tsx");
  assert.doesNotMatch(about,/font-\[var\(--font-display\)\]/);
  assert.match(about,/storyTitle/);
  assert.match(about,/approachTitle/);
  assert.match(about,/font-light/);
  assert.match(about,/<LetsCreateCTA \/>/);
});
test("new website projects start with a multilingual architecture case-study template", () => {
  const editor = read("app/app/admin/website-projects/page.tsx");
  for (const section of ["Project Overview", "Concept", "Site & Context", "Plans & Sections", "Façade Development", "Spatial Experience", "Materials & Details", "Visualization"]) {
    assert.match(editor, new RegExp(section.replace(/[&]/g, "\\&")));
  }
  assert.match(editor, /Project publishing kit/);
  assert.match(editor, /Nothing is public until Publish is selected/);
});
