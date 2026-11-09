# Website redesign roadmap

The working record for the datadoesnotlie.com redesign. Read this first when picking the project back up.

- Brief: `docs/REDESIGN_BRIEF.txt` (Cam, Nov 9 2026)
- Spec of the Nov 5 build: `docs/Daybreak_Website_Spec_v1_Handoff.pdf`
- Reference screenshots: `docs/references/`
- Branch: `redesign`. Checkpoint before any change: git tag `pre-redesign-2026-11-09` (local tag; the proxy refused pushing tags, so the commit `bc5cafd` on `main` is the remote checkpoint).
- Production deploys from `main` on Netlify (site `endearing-lebkuchen-8762b8`). **Do not merge to main without Cam's explicit approval.**

## Standing priorities (from the brief)

- [x] Recover the original website's best animations
- [x] Reuse or improve the original Daybreak background
- [x] Combine the strongest elements of the older and newer websites
- [x] Preserve and enhance the dashboard presentation
- [x] Replace the awkward mobile screen with a convincing motion demonstration
- [x] Develop stronger animated product storytelling
- [~] Improve the overall premium SaaS aesthetic (first full pass done; keep polishing)
- [~] Refine conversion flows and marketing copy (CTAs unified: Start free month, Book a demo, Apply to partner)
- [x] Make the entire website visually consistent
- [~] Continue polishing mobile responsiveness and performance (see backlog 1)

(Ticked as each lands; see "Completed" below for detail.)

## Site history, recovered

| Version | Where it lives now | What it had |
| --- | --- | --- |
| July 2026 original, "The BI Operating System" | Netlify deploy `6a67a74052e2898254b64891` (permalink `https://6a67a74052e2898254b64891--endearing-lebkuchen-8762b8.netlify.app`), copy in `docs/archive/2026-07-original-bi-os.html` | Ink navy `#081C30` hero with three drifting aurora lights (mint, sky, emerald; `drift` 14 to 22s), a 44px grid masked to fade, film grain overlay, dotted textures on sections, monospace ticker marquee, Bricolage Grotesque headlines, gradient "truth" text, wordmark shine sweep, chat demo with typing, gradient dark H2s |
| Nov 5 2026, "Daybreak dark" | git `f5ae1ff..3bc5dbb`, copy in `docs/archive/2026-11-05-daybreak-dark.html` (base64 stripped), spec PDF in `docs/` | DAYBREAK typed wordmark with the donut-sunrise logo, 45s product tour video (`assets/daybreak-hero.mp4`), 4-up hairline feature strip, five-step "how it works" with choreographed mocks (import, sales overview, tagging, advise card, workflow), interactive Advise card that sketches a workflow flowchart, scripted 3-turn chat demo, founder section, FAQ, Google Forms lead capture |
| Nov 9 2026 morning, "white app-styled" | git `bc5cafd` (current `main`) | Best messaging so far, public pricing generated from `data/plans.json`, partners page, real app screenshots (`assets/app-*.webp`) and recorded app loops (`assets/motion-*.mp4`), Inter, white theme. Felt static and generic. The mobile screen (`app-mobile.webp`) looked unfinished |
| 2025 Netlify sites | `phenomenal-meerkat-478d76` (datadoesnotlie.org), `resonant-llama-897868` | Unrelated (a trading dashboard, and an empty site). Nothing to recover |

"The original Daybreak background" = the July hero sky: ink navy, drifting mint and sky light, fading grid, grain. The Daybreak app itself still uses a quieter version (navy, two top glows, 32px grid) in `daybreak/src/app/globals.css`.

## Verified product facts (checked in the daybreak repo, Nov 9)

- Data in: Square (live, direct), CSV upload with column matching (Import Studio), Push API and file drops, read-only database connections (Postgres, MySQL, SQL Server) for a setup fee. Shopify connector is built but the public app is still in Shopify review, so the site says "coming soon".
- App areas: Dashboard, Insights ("What to do next", ranked by what's at stake, each with "See the chart" and "See them"), Customers (saved views, tags), Sales, Reports (sales, customers, monthly, promotions), Workflows (email and SMS, waits, branches, goals, drop-out on order), Ask Daybreak (chat), Settings.
- Ask Daybreak can compare periods, list customers, count groups, and propose workflows or one-off emails that the owner confirms. It does not forecast. The Nov 5 chat demo's "Q4 profit projections" is replaced.
- Workflow results tracked: enrolled, converted (ordered again), orders and revenue after enrollment.
- MCP server for Claude and other assistants.
- Texting: built and priced, but Twilio for Cam's account waits on the EIN. Site keeps texting claims (they are product features) but nothing implies a live number today.
- Partner program: built (white label, custom domains, client payments on the partner's own Stripe). Public CTA stays "Apply".
- Pricing comes only from `data/plans.json` via `build.mjs`. Never hand-edit prices.

## Creative direction: "First light"

Daybreak is named for the moment the sky turns. The site is built around that idea instead of generic gradients.

- **Background system.** The July aurora sky, rebuilt: ink navy, a horizon of light low in the hero that the product rises out of, two slow drifting lights (mint, sky), a fading measurement grid, fine grain. As the visitor scrolls the story, the sky warms from night to dawn, so the background tells time. Light paper sections arrive at pricing ("full daylight").
- **The story is one morning.** The five steps (Connect, Understand, Discover, Act, Measure) are told as one owner's morning, with a clock in the sticky chapter rail: overnight sync, 6:00 daily run, 7:12 insight, 7:15 workflow live, two weeks later results. One customer (Maria Chen, illustrative) is carried through every chapter so the steps read as one connected thread.
- **Type (Cam, Nov 9: same font and Material UI elements as the product).** Inter variable everywhere, exactly like the app (`fonts/inter-latin-wght-normal.woff2`, copied from the app's @fontsource-variable/inter). Tabular numbers for data. Two-tone headlines (bright phrase, then a dimmer continuation). Section labels look like the app's section headers: small uppercase sky blue.
- **No gradient text, ever** (Cam, Nov 9). The dark Daybreak sky gradient behind content is wanted; colored text gradients are not.
- **Color = the app's palette** (`daybreak/src/theme/theme.tsx`): navy 950 `#03070d`, 900 `#060c16` (page), 850 `#0a1322` (tiles), 800 `#0f1b2e`, 700 `#1a2a42` (hairlines), 600 `#253a57`; ink `#e9eff6`, muted `#8797ab`, faint `#56667b`; mint `#2be39b`, sky `#4fb2ff`, amber `#ffbe55`, coral `#ff6b88`, violet `#9f8cff`. Hero sky base `#071120`. Paper `#F4F7F9` for daylight sections.
- **Components = the app's MUI theme**, reproduced in CSS: contained mint button with a soft glow, outlined navy-600 button that turns mint on hover, text tabs with a 2px mint indicator, outlined inputs on navy 900 with mint focus, navy 850 menus (radius 12), pill chips, tiles with the lit top edge, ExpandMore accordions, Material rounded icons (paths copied from @mui/icons-material).
- **Product presentation.** Real screenshots in a precise browser frame with layered live HTML elements on top (insight card, toast, cursor) that animate between real product states (Dashboard, Insights, Customers, Workflows tabs). HTML mocks reuse the app's real vocabulary and data ("See them", saved views, tags, workflow steps) in a refined presentation.
- **Do not use `assets/app-insights.webp`** (Cam, Nov 9: he doesn't like the UI on that screen). Don't imitate its card grid in mocks either; show insights with the Advise-card treatment instead.
- **Motion principles.** Every motion explains something the product does. Eases `cubic-bezier(.2,.8,.25,1)` for moves and `cubic-bezier(.34,1.56,.64,1)` for pops. Fire once on scroll; loops only where the loop is the demo (phone, chat). All of it off under `prefers-reduced-motion`, with final states shown. Vanilla JS and CSS, no animation library.
- **Conversion.** Primary CTA everywhere: "Start free month" (to pricing, then Stripe checkout). Secondary: "Book a demo" (Google Form). Partners: "Apply to partner".

References studied (screens in `docs/references/`): Attio (sticky chapter rail, composed product panels, quiet hierarchy, two-tone headlines), Clay (each chapter its own world, playful objects, colored phrase highlights), Linear (dark polish, product UI fading into the page, figure labels), GoHighLevel (outcome-first value props, "what it replaces" framing, pricing hierarchy, repeated CTAs).

## Architecture decisions

- Stays a static site: hand-written HTML, one shared stylesheet and script, `build.mjs` for generated regions (header, footer, prices, JSON-LD, sitemap). No framework, no runtime dependencies. Netlify publishes the repo root.
- `docs/` is reference material and is not linked; `_redirects` returns 404 for it.
- Google Search Console file `google7bffc4ca45ad5fa4.html` must stay at the root.
- Lead forms post to the existing Google Form (ids in `assets/site.js`).

## Completed (Nov 9, branch `redesign`, draft PR #1)

Preview: https://deploy-preview-1--endearing-lebkuchen-8762b8.netlify.app (Netlify deploy preview; production untouched).

- Design system rebuilt in `assets/site.css` on the app's theme (see above). Header with Product and Company dropdowns, Data Does Not Lie vs Daybreak made explicit, mobile menu grouped by product and company, footer with the DAYBREAK wordmark, sticky phone CTA bar.
- Recovered background: the July sky (drifting mint and sky light, fading grid, grain) in the hero and closing, with a horizon line the product rises out of; pricing transitions from the dark sky to a light "daylight" section across a horizon.
- Homepage: hero with real app screens in a browser frame (Dashboard, Reports, Customers, Workflows tabs that auto-advance with a progress indicator), layered live elements per screen, tilt that flattens on scroll; source rail with honest statuses; ticker of a sample morning (recovered from July); pains that strike through into answers; the five-step story as "one morning with Daybreak" with a sticky clock and chapter rail, one customer (Maria Chen) carried through every chapter, the sky warming toward dawn; Ask Daybreak chat demo rewritten to real capabilities (find, compare, propose a workflow you approve); phone demo, a 5-scene loop in HTML/CSS with synced captions and clickable steps; tabbed extras (many stores, promotions, texting, MCP); audiences; pricing preview; partner band with a live brand-swap demo of white label; company section (founder plus services); FAQ; closing; demo form.
- Pricing and partners rebuilt (partners now covers custom web addresses and client payments on the partner's own Stripe). Use cases, case study, privacy, terms and sign-in restyled on the shared system; old 30 KB inline style blocks removed.
- Removed: the Insights screenshot (`assets/app-insights.webp`) and the insights video loop are no longer used. Bricolage, Instrument Sans and JetBrains Mono removed in favor of Inter.
- Quality: no JS errors; reduced motion shows every demo's final state; Lighthouse accessibility 100 locally; desktop performance 94 on the preview; CLS 0.

### Independent review (Nov 9) and what was fixed
Fixed: unreadable add-on cards on pricing; video modal focus and Tab trap; phone steps keyboard support; mobile menu returns focus; hero tabs roving tabindex; pause button and pause on hover/focus for the screen tour and phone demo; chat starts with an answer showing and stops after one pass; white-label swap stops after two rounds; removed aria-live on the auto-rotating panel; chat region role; heading order in mocks; AEO badge moved out of its heading; contrast on muted headline text, alt text, light-section labels and captions; visible focus ring on inputs; MCP copy corrected to read-only (src/mcp/server.ts exposes read-only tools); "every core feature" instead of "every feature"; coupon comparison attributed to Insights (src/insights/recommend.ts), not the promotions report; illustrative labels on the hero, phone and partner mocks; "Seen in 6 months" vs "Active" no longer conflict; demo business named Seaside Cleaners to match the real screenshots; mechanical comma separators rewritten; figure rules replaced with slashes; en dash in the case study; two-tone headings kept only in the hero; pains no longer struck through; hero layers moved off the headers they covered; pricing card prices aligned; phones show a readable crop of the screens; blog features the real case study and drops the placeholder.

Open from the review: consolidate the layered overrides in `assets/site.css` (backlog 1); merge the closing call to action and the demo form into one ending (kept separate for now so the form isn't cut by the horizon); the AI Marketing Assistant add-on copy (from the app's plans data) says it "launches campaigns and answers customer texts", which Cam should confirm matches how it works.

## Published (Nov 9)

The redesign is live on datadoesnotlie.com (merged to `main`). Production Lighthouse, mobile: performance 96, accessibility 100, best practices 100, SEO 100.

Done after publishing review:
- Mobile performance: grain is a tiny pre-rendered tile (no SVG filter or blend mode), no drifting lights on phones, below-fold sections render lazily with jump links that re-aim once heights settle, `build.mjs` writes `assets/site.min.css` (edit `site.css`, pages load the min file).
- Product tour re-recorded from the real app (local Daybreak, Seaside Cleaners demo data): Dashboard, Customers (VIPs view), Workflows, VIP win-back, Sales Overview. `assets/daybreak-tour.mp4` (about 49s, under 1 MB) and poster. Recorded with a puppeteer screencast and an injected cursor; admin links and a test workflow hidden; sped up 1.5x; H.264 veryfast CRF 26.
- Share images: `assets/og-home.jpg`, `og-pricing.jpg`, `og-partners.jpg`.
- Pricing changes from Cam: AI marketing assistant included in every plan (no longer a $197 add-on); Partner plan $1,297 a month, no setup fee, self-serve signup through checkout (`/api/billing/checkout?plan=partner`).
- `_redirects` force-404s `docs/` and this roadmap on the live site.

## Remaining work and ideas backlog

Priority order.

1. (Done) Mobile performance. Worth doing later: fold the layered overrides in `site.css` into the base rules.
2. (Done) Tour video. Re-record when the app UI changes noticeably.
3. Replace HTML mocks with exact app renders where Cam prefers them (the app could export its own components to static images or an embeddable demo route).
4. A real interactive "try it on sample data" demo. Needs Cam's call: a public, sign-in-free, read-only demo business in the app (a new route and an auth exception to build carefully), and whether Ask Daybreak is switched on there (each question costs AI tokens from anonymous visitors).
5. Customer proof: add real testimonials and logos once customers agree. Nothing invented until then.
6. Use cases: write the Daybreak retail case study (the placeholder card is still there).
7. Partner sign-in on custom domains depends on Clerk satellite domains (purchase pending) and VERCEL_TOKEN; until then the partner page promises branded sign-in that works on storeportal.app subdomains only after DNS is live.
8. (Done) Share images.
9. Consider porting the site to Next.js with the app's actual MUI components if Cam wants literal component reuse (today it is a faithful CSS reproduction).
10. Analytics: no analytics were present before; add privacy-friendly analytics (e.g. Plausible or Netlify Analytics) if wanted, plus conversion events on Start free month and the demo form.

## Update, November 9 2026
- Public live demo is on: https://daybreak.datadoesnotlie.com/demo (sample business Seaside Cleaners, read-only, Ask Daybreak answers with per-visitor and daily caps). Reseeded weekly by the app's "Refresh public demo" workflow. Linked from the hero, Ask section, closing CTA, menu card, mobile bar, mobile nav and footer.
- "Illustrative demo data" label now appears only under the hero showcase.
- GA4: build.mjs has `GA_ID` (empty, so no tag ships). site.js sends begin_checkout, start_free_month_click, open_demo, watch_tour and generate_lead when the tag is present. When Cam sends the G- ID: set GA_ID, add a Google Analytics paragraph to privacy.html, rebuild, publish.
- New: blog-online-store-playbook.html, a walkthrough with a placeholder online shop. Written as "how it would work", with no invented results, quotes or metrics.
- Testimonials: not added. Invented quotes presented as real customers are off the table; real quotes go in when customers give them.
