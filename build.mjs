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
const CHECK = `<svg class="check" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ARROW = `<svg class="arrow" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ---------- plans ----------
function cta(p) {
  if (p.id === "partner") return `<a class="btn btn-ghost btn-block" href="partners.html#apply">Apply to partner</a><p class="alt muted">Opens soon. Apply now to be first in.</p>`;
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
const NAV = [
  ["index.html#product", "Product", "home"],
  ["pricing.html", "Pricing", "pricing"],
  ["partners.html", "Partners", "partners"],
  ["index.html#services", "Services", ""],
  ["blog.html", "Use cases", "blog"],
  ["index.html#about", "About", ""],
];
function header(active) {
  const links = NAV.map(([href, label, key]) => `<a href="${href}"${key && key === active ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap bar">
    <a class="brand" href="index.html" aria-label="Daybreak by Data Does Not Lie, home">
      <img src="assets/daybreak-logo.png" alt="" width="32" height="32">
      <span class="words"><span class="name">Daybreak</span><span class="by">By Data Does Not Lie</span></span>
    </a>
    <nav class="nav" aria-label="Main">${links}</nav>
    <div class="header-cta">
      <a class="signin" href="sign-in.html">Sign in</a>
      <a class="btn btn-primary" href="pricing.html">Start free month</a>
    </div>
    <button class="menu-btn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="mobile-nav"><span></span></button>
  </div>
  <div class="wrap mobile-nav" id="mobile-nav">${NAV.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}<a href="sign-in.html">Sign in</a><a class="btn btn-primary" href="pricing.html">Start free month</a></div>
</header>`;
}
function footer() {
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="brand" href="index.html" aria-label="Daybreak by Data Does Not Lie, home">
          <img src="assets/daybreak-logo.png" alt="" width="32" height="32">
          <span class="words"><span class="name">Daybreak</span><span class="by">By Data Does Not Lie</span></span>
        </a>
        <p>Your data already knows. Now it tells you.</p>
      </div>
      <div><h5>Product</h5><ul><li><a href="index.html#product">How it works</a></li><li><a href="pricing.html">Pricing</a></li><li><a href="index.html#sources">Connections</a></li><li><a href="sign-in.html">Sign in</a></li></ul></div>
      <div><h5>Company</h5><ul><li><a href="partners.html">Partner program</a></li><li><a href="index.html#services">Services</a></li><li><a href="blog.html">Use cases</a></li><li><a href="index.html#about">About</a></li></ul></div>
      <div><h5>Get in touch</h5><ul><li><a href="index.html#demo">Book a demo</a></li><li><a href="partners.html#apply">Apply to partner</a></li><li><a href="privacy.html">Privacy</a></li><li><a href="terms.html">Terms</a></li></ul></div>
    </div>
    <div class="foot-base"><span>&copy; 2026 Data Does Not Lie</span><span>Product screens show illustrative demo data.</span></div>
  </div>
</footer>`;
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
