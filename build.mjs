#!/usr/bin/env node
/**
 * Fills the generated parts of the site from data/plans.json (exported from Daybreak's
 * src/billing/plans.ts), so prices live in one place. No dependencies.
 *
 *   cd ../daybreak && npx tsx --tsconfig tsconfig.json scripts/export-plans.ts > ../datadoesnotlie-final/data/plans.json
 *   node build.mjs
 *
 * Each page marks generated regions with <!-- @name --> ... <!-- /@name -->. Running it twice changes nothing.
 */
import fs from "node:fs";

const SITE = "https://datadoesnotlie.com";
const APP = "https://daybreak.datadoesnotlie.com";
const TODAY = new Date().toISOString().slice(0, 10);
const data = JSON.parse(fs.readFileSync(new URL("./data/plans.json", import.meta.url)));
const plan = Object.fromEntries(data.plans.map((p) => [p.id, p]));
const ORDER = ["growth", "premier", "enterprise", "partner"];

const $ = (c) => (c % 100 === 0 ? `$${(c / 100).toLocaleString("en-US")}` : `$${(c / 100).toFixed(2)}`);
const n = (x) => x.toLocaleString("en-US");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const CHECK = `<svg class="check" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 5.53 12.7a.996.996 0 0 0-1.41 0c-.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71c.39-.39.39-1.02 0-1.41a.996.996 0 0 0-1.41 0z"/></svg>`;
const ARROW = `<svg class="arrow" width="18" height="18" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M5 13h11.17l-4.88 4.88c-.39.39-.39 1.03 0 1.42s1.02.39 1.41 0l6.59-6.59c.39-.39.39-1.02 0-1.41l-6.58-6.6a.996.996 0 0 0-1.41 0c-.39.39-.39 1.02 0 1.41L16.17 11H5c-.55 0-1 .45-1 1s.45 1 1 1"/></svg>`;

// ---------- plans ----------
function cta(p) {
  if (p.id === "partner") return `<a class="btn btn-ghost btn-block" href="partners.html#apply">Apply to partner</a><p class="alt muted">Accounts open in the order we receive applications</p>`;
  if (p.salesLed) return `<a class="btn btn-ghost btn-block" href="index.html?plan=enterprise#demo">Book a call</a><p class="alt muted">Custom pricing for your stores</p>`;
  const primary = p.id === "growth" ? "btn-primary" : "btn-primary";
  const alt = p.id === "premier" ? `<p class="alt"><a class="link" href="index.html?plan=premier#demo">or book a call first</a></p>` : `<p class="alt muted">Cancel any time</p>`;
  return `<a class="btn ${primary} btn-block" href="${APP}/api/billing/checkout?plan=${p.id}">Start free month ${ARROW}</a>${alt}`;
}
function setupLine(p) {
  if (p.salesLed) return "Setup quoted with your plan";
  return `${$(p.setupCents)} one-time setup, then ${p.freeDays} days free`;
}
function planCard(p, { compact = false } = {}) {
  const featured = p.id === "growth";
  const price = p.salesLed
    ? `<div class="price"><span class="from">From</span><span class="amt">${$(p.monthlyCents)}</span><span class="per">/ month</span></div>`
    : `<div class="price"><span class="amt">${$(p.monthlyCents)}</span><span class="per">/ month</span></div>`;
  const items = (compact ? p.highlights.slice(0, 3) : p.highlights).map((h) => `<li>${CHECK}<span>${esc(h)}</span></li>`).join("");
  return `<article class="plan${featured ? " featured" : ""}">
          ${featured ? `<span class="badge">Recommended</span>` : ""}
          <h3>${esc(p.name)}</h3>
          <p class="for">${esc(p.tagline)}</p>
          ${price}
          <p class="setup">${setupLine(p)}</p>
          ${cta(p)}
          <ul>${items}</ul>
        </article>`;
}
const plansFull = () => `<div class="plans">\n        ${ORDER.map((id) => planCard(plan[id])).join("\n        ")}\n      </div>`;
const plansCompact = () => `<div class="plans">\n        ${ORDER.map((id) => planCard(plan[id], { compact: true })).join("\n        ")}\n      </div>`;

function compareTable() {
  const cols = ORDER.map((id) => plan[id]);
  const row = (label, f) => `<tr><th scope="row">${label}</th>${cols.map((p) => `<td>${f(p)}</td>`).join("")}</tr>`;
  const group = (label) => `<tr class="group"><th colspan="${cols.length + 1}" scope="colgroup">${label}</th></tr>`;
  const yes = `<span class="yes">Included</span>`;
  const stores = (p) => (p.id === "partner" ? `${p.clientsIncluded} client businesses` : p.storesIncluded == null ? "Unlimited" : n(p.storesIncluded));
  const extra = (p) => (p.id === "partner" ? `${$(p.extraClientCents)} per extra client, ${$(p.extraClientCentsFrom11)} from the 11th` : p.extraStoreCents ? `${$(p.extraStoreCents)} per store / month` : p.salesLed ? "Included" : "");
  const texts = (p) => (p.id === "partner" ? `Buy at ${data.partnerTextCents}¢ a text, resell at your price` : p.textsIncluded == null ? "Custom" : `${n(p.textsIncluded)} a month`);
  const emails = (p) => (p.emailsIncluded == null ? "Custom" : `${n(p.emailsIncluded)} a month`);
  const wl = (p) => (p.whiteLabel === "included" ? yes : p.whiteLabel === "add-on" ? `Add-on, ${$(data.addOns.find((a) => a.id === "premier-white-label").monthlyCents)} / month` : `<span class="no">Not available</span>`);
  return `<div class="table-wrap"><table class="compare">
        <caption class="sr-only">Daybreak plans compared</caption>
        <thead><tr><th scope="col">Plan</th>${cols.map((p) => `<th scope="col">${esc(p.name)}</th>`).join("")}</tr></thead>
        <tbody>
          ${group("Price")}
          ${row("Monthly", (p) => (p.salesLed ? `From ${$(p.monthlyCents)}` : $(p.monthlyCents)))}
          ${row("Setup, one time", (p) => (p.salesLed ? "Quoted" : $(p.setupCents)))}
          ${row("Free period", (p) => `${p.freeDays} days`)}
          ${group("Usage")}
          ${row("Stores included", stores)}
          ${row("More stores", extra)}
          ${row("Texts", texts)}
          ${row("Emails", emails)}
          ${group("Product")}
          ${row("Reports, insights, customers, workflows", () => yes)}
          ${row("Ask Daybreak (chat with your data)", () => yes)}
          ${row("Your own brand (white label)", wl)}
          ${group("Help")}
          ${row("Setup", (p) => ({ partner: "Self-serve with guides", growth: "Done with you", premier: "Done for you, including data migration", enterprise: "Done for you" })[p.id])}
          ${row("Support", (p) => esc(p.support))}
        </tbody>
      </table></div>`;
}

function addOns() {
  return `<div class="addons">\n        ${data.addOns
    .map(
      (a) => `<div class="addon"><div><h4>${esc(a.name)}</h4><p>${esc(a.blurb)}</p></div><div class="cost">${$(a.monthlyCents)} / mo${a.setupCents ? `<small>plus ${$(a.setupCents)} setup</small>` : ""}</div></div>`,
    )
    .join("\n        ")}\n      </div>`;
}
function packs() {
  return `<div class="packs">\n        ${data.creditPacks
    .map((p) => `<div class="pack"><b>${n(p.credits)} texts</b><p>${$(p.cents)} one time, ${((p.cents / p.credits)).toFixed(1)}¢ a text. Never expire.</p></div>`)
    .join("\n        ")}\n      </div>`;
}

// ---------- structured data ----------
function softwareLd() {
  const offers = ORDER.map((id) => {
    const p = plan[id];
    const spec = { "@type": "UnitPriceSpecification", price: (p.monthlyCents / 100).toFixed(2), priceCurrency: "USD", billingDuration: "P1M", unitText: "MONTH", ...(p.salesLed ? { minPrice: (p.monthlyCents / 100).toFixed(2) } : {}) };
    return {
      "@type": "Offer",
      name: `Daybreak ${p.name}`,
      description: `${p.tagline}. ${p.salesLed ? "Priced on a call." : `${$(p.setupCents)} one-time setup, then ${p.freeDays} days free, then ${$(p.monthlyCents)} a month.`}`,
      price: (p.monthlyCents / 100).toFixed(2),
      priceCurrency: "USD",
      priceSpecification: spec,
      url: p.salesLed ? `${SITE}/index.html#demo` : p.id === "partner" ? `${SITE}/partners.html` : `${SITE}/pricing.html`,
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE}/#org` },
    };
  });
  return {
    "@type": "SoftwareApplication",
    "@id": `${SITE}/#daybreak`,
    name: "Daybreak",
    alternateName: "Daybreak by Data Does Not Lie",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "CRM",
    operatingSystem: "Web",
    url: `${SITE}/`,
    image: `${SITE}/assets/app-dashboard.webp`,
    description: "Daybreak is the AI CRM for retail stores. Connect Square or upload a CSV and it builds your reports, tells you each morning which customers need attention, and runs email and text follow-up for you.",
    publisher: { "@id": `${SITE}/#org` },
    offers,
  };
}
const ORG = {
  "@type": "Organization",
  "@id": `${SITE}/#org`,
  name: "Data Does Not Lie",
  url: `${SITE}/`,
  logo: { "@type": "ImageObject", url: `${SITE}/assets/daybreak-logo.png`, width: 512, height: 512 },
  slogan: "Your data already knows. Now it tells you.",
  founder: { "@id": `${SITE}/#founder` },
};
const FOUNDER = {
  "@type": "Person",
  "@id": `${SITE}/#founder`,
  name: "Cameron Patalano",
  jobTitle: "Founder",
  worksFor: { "@id": `${SITE}/#org` },
  image: `${SITE}/assets/cameron-patalano.jpg`,
  url: `${SITE}/#about`,
  sameAs: ["https://www.linkedin.com/in/cameronpatalano", "https://a.co/d/0gF1U46s"],
};
function faqLd(html) {
  const qs = [...html.matchAll(/<details[^>]*>\s*<summary>([\s\S]*?)<span class="pm"[\s\S]*?<\/summary>\s*<div class="answer">([\s\S]*?)<\/div>\s*<\/details>/g)].map((m) => ({
    "@type": "Question",
    name: m[1].replace(/<[^>]+>/g, "").trim(),
    acceptedAnswer: { "@type": "Answer", text: m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() },
  }));
  return qs.length ? { "@type": "FAQPage", mainEntity: qs } : null;
}
const crumbs = (items) => ({ "@type": "BreadcrumbList", itemListElement: items.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: url })) });

// ---------- header / footer ----------
const ICON = {
  how: `<svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="m16.85 6.85 1.44 1.44-4.88 4.88-3.29-3.29a.996.996 0 0 0-1.41 0l-6 6.01c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0L9.41 12l3.29 3.29c.39.39 1.02.39 1.41 0l5.59-5.58 1.44 1.44c.31.31.85.09.85-.35V6.5c.01-.28-.21-.5-.49-.5h-4.29c-.45 0-.67.54-.36.85"/></svg>`,
  ask: `<svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2"/></svg>`,
  phone: `<svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1m-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m4.5-4H7V4h9z"/></svg>`,
  stores: `<svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="m21.9 7.89-1.05-3.37c-.22-.9-1-1.52-1.91-1.52H5.05c-.9 0-1.69.63-1.9 1.52L2.1 7.89c-.46 1.97.85 3.11.9 3.17V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7.94c1.12-1.12 1.09-2.41.9-3.17M13 5h1.96l.54 3.52c.09.71-.39 1.48-1.28 1.48-.67 0-1.22-.59-1.22-1.31zM6.44 8.86c-.08.65-.6 1.14-1.21 1.14-.93 0-1.35-.97-1.19-1.64L5.05 5h1.97zM11 8.69c0 .72-.55 1.31-1.29 1.31-.75 0-1.3-.7-1.22-1.48L9.04 5H11zM18.77 10c-.61 0-1.14-.49-1.21-1.14L16.98 5l1.93-.01 1.05 3.37c.16.67-.25 1.64-1.19 1.64"/></svg>`,
  plug: `<svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M8.4 18.2c.38.5.6 1.12.6 1.8 0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3c.44 0 .85.09 1.23.26l1.41-1.77c-.92-1.03-1.29-2.39-1.09-3.69l-2.03-.68c-.54.83-1.46 1.38-2.52 1.38-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3c0 .07 0 .14-.01.21l2.03.68c.64-1.21 1.82-2.09 3.22-2.32V5.91C9.96 5.57 9 4.4 9 3c0-1.66 1.34-3 3-3s3 1.34 3 3c0 1.4-.96 2.57-2.25 2.91v2.16c1.4.23 2.58 1.11 3.22 2.32L18 9.71V9.5c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3c-1.06 0-1.98-.55-2.52-1.37l-2.03.68c.2 1.29-.16 2.65-1.09 3.69l1.41 1.77Q17.34 17 18 17c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3c0-.68.22-1.3.6-1.8l-1.41-1.77c-1.35.75-3.01.76-4.37 0z"/></svg>`,
  build: `<svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M8.7 15.9 4.8 12l3.9-3.9c.39-.39.39-1.01 0-1.4a.984.984 0 0 0-1.4 0l-4.59 4.59c-.39.39-.39 1.02 0 1.41l4.59 4.6c.39.39 1.01.39 1.4 0s.39-1.01 0-1.4m6.6 0 3.9-3.9-3.9-3.9a.984.984 0 0 1 0-1.4c.39-.39 1.01-.39 1.4 0l4.59 4.59c.39.39.39 1.02 0 1.41l-4.59 4.6c-.39.39-1.01.39-1.4 0a.984.984 0 0 1 0-1.4"/></svg>`,
  web: `<svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2m6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56M12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96M4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56m2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8M12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96M14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2m.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56M16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2z"/></svg>`,
  book: `<svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 4.5c-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5-1.45 0-2.99.22-4.28.79C1.49 5.62 1 6.33 1 7.14v11.28c0 1.3 1.22 2.26 2.48 1.94.98-.25 2.02-.36 3.02-.36 1.56 0 3.22.26 4.56.92.6.3 1.28.3 1.87 0 1.34-.67 3-.92 4.56-.92 1 0 2.04.11 3.02.36 1.26.33 2.48-.63 2.48-1.94V7.14c0-.81-.49-1.52-1.22-1.85-1.28-.57-2.82-.79-4.27-.79M21 17.23c0 .63-.58 1.09-1.2.98-.75-.14-1.53-.2-2.3-.2-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5.92 0 1.83.09 2.7.28.46.1.8.51.8.98z"/><path d="M13.98 11.01c-.32 0-.61-.2-.71-.52-.13-.39.09-.82.48-.94 1.54-.5 3.53-.66 5.36-.45.41.05.71.42.66.83s-.42.71-.83.66c-1.62-.19-3.39-.04-4.73.39-.08.01-.16.03-.23.03m0 2.66c-.32 0-.61-.2-.71-.52-.13-.39.09-.82.48-.94 1.53-.5 3.53-.66 5.36-.45.41.05.71.42.66.83s-.42.71-.83.66c-1.62-.19-3.39-.04-4.73.39-.08.02-.16.03-.23.03m0 2.66c-.32 0-.61-.2-.71-.52-.13-.39.09-.82.48-.94 1.53-.5 3.53-.66 5.36-.45.41.05.71.42.66.83s-.42.7-.83.66c-1.62-.19-3.39-.04-4.73.39-.08.02-.16.03-.23.03"/></svg>`,
  person: `<svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1c0-2.66-5.33-4-8-4"/></svg>`,
  mail: `<svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m-.4 4.25-6.54 4.09c-.65.41-1.47.41-2.12 0L4.4 8.25c-.25-.16-.4-.43-.4-.72 0-.67.73-1.07 1.3-.72L12 11l6.7-4.19c.57-.35 1.3.05 1.3.72 0 .29-.15.56-.4.72"/></svg>`,
};
const CHEV = `<svg class="chev" width="10" height="10" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M15.88 9.29 12 13.17 8.12 9.29a.996.996 0 0 0-1.41 0c-.39.39-.39 1.02 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41-.39-.38-1.03-.39-1.42 0"/></svg>`;
const PRODUCT = [
  ["index.html#how", "How it works", "From your sales to a customer walking back in", ICON.how],
  ["index.html#ask", "Ask Daybreak", "Chat with your own numbers", ICON.ask],
  ["index.html#mobile", "On your phone", "Your morning brief, wherever you are", ICON.phone],
  ["index.html#features", "Many stores", "Every location, side by side", ICON.stores],
  ["index.html#integrations", "Connections", "Square, CSV, your POS and your AI", ICON.plug],
];
const COMPANY = [
  ["index.html#about", "About", "Who builds Daybreak", ICON.person],
  ["blog.html", "Use cases", "Real work, written up", ICON.book],
  ["index.html#services", "Custom development", "Software built on your own data", ICON.build],
  ["index.html#services", "Website development", "Fast sites with AEO built in", ICON.web],
  ["index.html#demo", "Contact", "Book a call with us", ICON.mail],
];
const links = (items) => items.map(([href, b, s, i]) => `<a href="${href}"><span class="mi">${i}</span><span><b>${b}</b><span>${s}</span></span></a>`).join("");
function header(active) {
  const cur = (key) => (key === active ? ' aria-current="page"' : "");
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap bar">
    <a class="brand" href="index.html" aria-label="Daybreak by Data Does Not Lie, home">
      <img src="assets/daybreak-mark-96.png" alt="" width="30" height="30">
      <span class="words"><span class="name">Daybreak</span><span class="by">by Data Does Not Lie</span></span>
    </a>
    <nav class="nav" aria-label="Main">
      <div class="nav-item" data-menu>
        <button type="button" aria-expanded="false" aria-controls="menu-product"${active === "home" ? ' data-current' : ""}>Product ${CHEV}</button>
        <div class="menu" id="menu-product">
          <div class="menu-grid">
            <div class="menu-links">${links(PRODUCT)}</div>
            <a class="menu-feature" href="index.html#how"><img src="assets/app-dashboard.webp" alt="" width="320" height="200" loading="lazy"><b>See it work</b><span>One morning with Daybreak, start to finish</span></a>
          </div>
        </div>
      </div>
      <a href="pricing.html"${cur("pricing")}>Pricing</a>
      <a href="partners.html"${cur("partners")}>Partners</a>
      <div class="nav-item" data-menu>
        <button type="button" aria-expanded="false" aria-controls="menu-company">Company ${CHEV}</button>
        <div class="menu menu-wide" id="menu-company"><div class="menu-grid one"><div class="menu-links">${links(COMPANY)}</div></div></div>
      </div>
    </nav>
    <div class="header-cta">
      <a class="signin" href="sign-in.html">Sign in</a>
      <a class="btn btn-ghost hdr-demo" href="index.html#demo">Book a demo</a>
      <a class="btn btn-primary" href="pricing.html">Start free month</a>
    </div>
    <button class="menu-btn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="mobile-nav"><span></span></button>
  </div>
  <div class="mobile-nav" id="mobile-nav">
    <div class="group"><span>Daybreak</span>${PRODUCT.map(([h, b]) => `<a href="${h}">${b}</a>`).join("")}<a href="pricing.html">Pricing</a><a href="partners.html">Partner program</a></div>
    <div class="group"><span>Data Does Not Lie</span><a href="index.html#about">About</a><a href="blog.html">Use cases</a><a href="index.html#services">Services</a><a href="sign-in.html">Sign in</a></div>
    <div class="cta-row"><a class="btn btn-ghost" href="index.html#demo">Book a demo</a><a class="btn btn-primary" href="pricing.html">Start free month</a></div>
  </div>
</header>`;
}
function footer() {
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="brand" href="index.html" aria-label="Daybreak by Data Does Not Lie, home">
          <img src="assets/daybreak-mark-96.png" alt="" width="30" height="30">
          <span class="words"><span class="name">Daybreak</span><span class="by">by Data Does Not Lie</span></span>
        </a>
        <p class="tag">Your data already knows. Now it tells you.</p>
        <div style="margin-top:22px;display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary btn-sm" href="pricing.html">Start free month</a><a class="btn btn-ghost btn-sm" href="index.html#demo">Book a demo</a></div>
      </div>
      <div><h4>Daybreak</h4><ul><li><a href="index.html#how">How it works</a></li><li><a href="index.html#ask">Ask Daybreak</a></li><li><a href="index.html#integrations">Connections</a></li><li><a href="pricing.html">Pricing</a></li><li><a href="sign-in.html">Sign in</a></li></ul></div>
      <div><h4>Company</h4><ul><li><a href="index.html#about">About</a></li><li><a href="partners.html">Partner program</a></li><li><a href="index.html#services">Services</a></li><li><a href="blog.html">Use cases</a></li></ul></div>
      <div><h4>Get in touch</h4><ul><li><a href="index.html#demo">Book a demo</a></li><li><a href="partners.html#apply">Apply to partner</a></li><li><a href="privacy.html">Privacy</a></li><li><a href="terms.html">Terms</a></li></ul></div>
    </div>
    <div class="foot-mark" aria-hidden="true"></div>
    <div class="foot-base"><span>&copy; 2026 Data Does Not Lie</span><span>Product screens show illustrative demo data.</span></div>
  </div>
</footer>
<div class="m-cta" data-mcta><a class="btn btn-ghost" href="index.html#demo">Book a demo</a><a class="btn btn-primary" href="pricing.html">Start free month</a></div>`;
}

// ---------- llms.txt and sitemap ----------
function llms() {
  const p = (id) => plan[id];
  const line = (x) =>
    x.salesLed
      ? `- ${x.name}: from ${$(x.monthlyCents)} a month, priced on a call. ${x.tagline}. ${x.highlights.join("; ")}.`
      : `- ${x.name}: ${$(x.monthlyCents)} a month plus a ${$(x.setupCents)} one-time setup fee, with the first ${x.freeDays} days free. ${x.tagline}. ${x.highlights.join("; ")}.`;
  return `# Data Does Not Lie

> Data Does Not Lie makes Daybreak, the AI CRM for retail stores. Connect Square or upload a CSV, and Daybreak builds your sales reports, tells you each morning which customers need attention and why, and runs email and text follow-up that stops when a customer comes back. Tagline: "Your data already knows. Now it tells you."

## Product: Daybreak

- Connections: Square (live, direct integration). Shopify (coming soon, being built now). CSV upload from any system, with columns matched automatically. A connection to almost any database or point of sale by API, for an added setup fee.
- Dashboard and reports: revenue, orders, new and returning customers, stores, services and promotions, compared with the same period last year. Every number opens the customers or orders behind it.
- Insights: every morning Daybreak checks what changed and writes up to three things worth your attention, in plain language, with the dollars at stake and the customers to reach.
- Customers: every customer with their lifetime spend, visits, usual gap between visits and whether they can be reached by email or text. Saved views and tags shared with the team.
- Workflows: email and text sequences with waits, if/else branches and A/B splits. Customers who come back drop out on their own. Text opt-outs and email unsubscribes are honored on every send.
- Ask Daybreak: chat with your own data to get answers, lists and draft campaigns. Also connects to Claude and other AI tools over MCP.
- Works for stores, dry cleaners, restaurants and service shops with one location or many.

## Pricing (USD)

Every plan starts with ${p("growth").freeDays} days free. Self-serve plans charge the setup fee at signup, then the monthly price after the free period. Month to month, cancel any time.

${ORDER.map((id) => line(p(id))).join("\n")}

More stores: Growth ${$(p("growth").extraStoreCents)} per store a month beyond ${p("growth").storesIncluded}; Premier ${$(p("premier").extraStoreCents)} per store a month beyond ${p("premier").storesIncluded}.

Text credit packs (one time, never expire): ${data.creditPacks.map((c) => `${n(c.credits)} texts for ${$(c.cents)}`).join("; ")}. Auto-recharge is optional.

Add-ons: ${data.addOns.map((a) => `${a.name} ${$(a.monthlyCents)} a month${a.setupCents ? ` plus ${$(a.setupCents)} setup` : ""} (${a.blurb})`).join("; ")}.

How to buy: Growth and Premier start online at ${SITE}/pricing.html (Stripe checkout). Enterprise is priced on a call: ${SITE}/index.html#demo. Partners apply at ${SITE}/partners.html#apply.

## Partner program

- For agencies, consultants and marketers who want to sell an AI CRM to local businesses under their own brand.
- Partner plan: ${$(p("partner").monthlyCents)} a month plus ${$(p("partner").setupCents)} setup, ${p("partner").freeDays} days free. Includes ${p("partner").clientsIncluded} client businesses; each extra client is ${$(p("partner").extraClientCents)} a month (${$(p("partner").extraClientCentsFrom11)} from the 11th).
- Your logo, colors and web address. You set your own prices and bill your clients.
- Text credits at ${data.partnerTextCents} cents a text to resell at your own price.
- 20% commission on add-ons your clients buy directly.
- Applications are open now: ${SITE}/partners.html#apply

## Services

- Daybreak AI CRM (key offering): everything above.
- Custom Development: bespoke apps, dashboards, integrations and AI assistants built on a company's own data.
- Website Development: fast, hand-built marketing sites with SEO and AEO (answer engine optimization) built in: structured data, FAQ schema, sitemaps, llms.txt and lead capture.

## About

Data Does Not Lie was founded by Cameron Patalano, author of Radical Transparency, a CRM specialist with years of hands-on HubSpot and GoHighLevel experience and an AI & Automation advisor at Stature Advisors, where he develops custom software and helps businesses implement AI systems at scale.

## Pages

- [Home](${SITE}/): what Daybreak does, connections, how it works, services, founder, FAQ and demo form.
- [Pricing](${SITE}/pricing.html): all plans, setup fees, the free month, add-ons, text packs and pricing FAQ.
- [Partner program](${SITE}/partners.html): reselling Daybreak under your own brand, and the application form.
- [Use cases](${SITE}/blog.html): case studies.
- [Replacing a Spreadsheet That Ran a Construction Company](${SITE}/blog-construction-case-study.html): Custom Development case study.
- [Sign in](${SITE}/sign-in.html): sign in to Daybreak.

## Contact

Book a demo at ${SITE}/index.html#demo
`;
}
function sitemap() {
  const pages = [
    ["", "1.0", "weekly"],
    ["pricing.html", "0.9", "weekly"],
    ["partners.html", "0.8", "monthly"],
    ["blog.html", "0.6", "monthly"],
    ["blog-construction-case-study.html", "0.6", "yearly"],
    ["sign-in.html", "0.3", "yearly"],
    ["privacy.html", "0.2", "yearly"],
    ["terms.html", "0.2", "yearly"],
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(([p, pr, cf]) => `  <url><loc>${SITE}/${p}</loc><lastmod>${TODAY}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join("\n")}\n</urlset>\n`;
}

// ---------- apply ----------
function fill(html, name, content) {
  const re = new RegExp(`(<!-- @${name}(?: [^>]*)? -->)[\\s\\S]*?(<!-- /@${name} -->)`, "g");
  if (!re.test(html)) return html;
  return html.replace(re, (_, a, b) => `${a}\n${content}\n${b}`);
}
const PAGES = {
  "index.html": { active: "home", ld: (h) => [ORG, FOUNDER, { "@type": "WebSite", "@id": `${SITE}/#website`, name: "Data Does Not Lie", url: `${SITE}/`, publisher: { "@id": `${SITE}/#org` } }, softwareLd(), faqLd(h)] },
  "pricing.html": { active: "pricing", ld: (h) => [ORG, softwareLd(), faqLd(h), crumbs([["Home", `${SITE}/`], ["Pricing", `${SITE}/pricing.html`]])] },
  "partners.html": { active: "partners", ld: (h) => [ORG, faqLd(h), crumbs([["Home", `${SITE}/`], ["Partner program", `${SITE}/partners.html`]])] },
  "blog.html": { active: "blog" },
  "blog-construction-case-study.html": { active: "blog" },
  "privacy.html": { active: "" },
  "terms.html": { active: "" },
  "sign-in.html": { active: "" },
};
for (const [file, cfg] of Object.entries(PAGES)) {
  const path = new URL(`./${file}`, import.meta.url);
  if (!fs.existsSync(path)) continue;
  let html = fs.readFileSync(path, "utf8");
  html = fill(html, "header", header(cfg.active));
  html = fill(html, "footer", footer());
  html = fill(html, "plans-full", plansFull());
  html = fill(html, "plans-compact", plansCompact());
  html = fill(html, "compare", compareTable());
  html = fill(html, "addons", addOns());
  html = fill(html, "packs", packs());
  html = fill(html, "partner-price", `${$(plan.partner.monthlyCents)}`);
  html = fill(html, "partner-setup", `${$(plan.partner.setupCents)}`);
  html = fill(html, "partner-clients", `${plan.partner.clientsIncluded}`);
  html = fill(html, "partner-extra", `${$(plan.partner.extraClientCents)}`);
  html = fill(html, "partner-extra11", `${$(plan.partner.extraClientCentsFrom11)}`);
  html = fill(html, "partner-text", `${data.partnerTextCents}¢`);
  if (cfg.ld) {
    const graph = cfg.ld(html).filter(Boolean);
    html = fill(html, "jsonld", `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>`);
  }
  if (/[—·]/.test(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ""))) console.warn(`! ${file} has an em dash or middle dot`);
  fs.writeFileSync(path, html);
}
fs.writeFileSync(new URL("./llms.txt", import.meta.url), llms());
fs.writeFileSync(new URL("./sitemap.xml", import.meta.url), sitemap());
console.log("built", Object.keys(PAGES).length, "pages, llms.txt, sitemap.xml");
