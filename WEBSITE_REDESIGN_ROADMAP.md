# Website redesign roadmap

The working record for the datadoesnotlie.com redesign. Read this first when picking the project back up.

- Brief: `docs/REDESIGN_BRIEF.txt` (Cam, Nov 9 2026)
- Spec of the Nov 5 build: `docs/Daybreak_Website_Spec_v1_Handoff.pdf`
- Reference screenshots: `docs/references/`
- Branch: `redesign`. Checkpoint before any change: git tag `pre-redesign-2026-11-09` (local tag; the proxy refused pushing tags, so the commit `bc5cafd` on `main` is the remote checkpoint).
- Production deploys from `main` on Netlify (site `endearing-lebkuchen-8762b8`). **Do not merge to main without Cam's explicit approval.**

## Standing priorities (from the brief)

- [ ] Recover the original website's best animations
- [ ] Reuse or improve the original Daybreak background
- [ ] Combine the strongest elements of the older and newer websites
- [ ] Preserve and enhance the dashboard presentation
- [ ] Replace the awkward mobile screen with a convincing motion demonstration
- [ ] Develop stronger animated product storytelling
- [ ] Improve the overall premium SaaS aesthetic
- [ ] Refine conversion flows and marketing copy
- [ ] Make the entire website visually consistent
- [ ] Continue polishing mobile responsiveness and performance

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
- **Type.** Bricolage Grotesque for display (the July personality, at weight 600 with tight tracking), Instrument Sans for text (Nov 5), JetBrains Mono for numbers and labels in mocks. Two-tone headlines (bright phrase, then a dimmer continuation) borrowed in spirit from Attio and Linear. Fonts self-hosted in `fonts/`.
- **Color.** Ink `#081C30`, deep `#06121F`, surface `#0B2540`, mint `#2BE39B` (the Daybreak accent), sky `#7CE0FF` and `#52B9E9`, amber `#F2A93B` for warnings, coral `#E85D75` sparingly, paper `#F5F8FA`.
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

## Completed

(updated as work lands)

## Remaining work and ideas backlog

(updated as work lands)
