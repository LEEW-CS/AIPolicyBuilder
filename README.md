# Cloudstaff AI Policy Builder

A free top-of-funnel marketing tool that walks a prospect through ~22 branching questions and emits a tailored AI Use Policy as PDF + editable Word. Captures leads into HubSpot; offers an optional 30-min Calendly booking with the AI Policy Team or AI Development Team.

Planned production URL: **https://policybuilder.cloudstaff.ai** (TBD).
Current live preview: **https://leew-cs.github.io/AIPolicyBuilder/** (the prototype).

---

## Repository contents

| Path | What it is |
|---|---|
| **[`nextjs/`](./nextjs/)** | **Production codebase — Next.js 15 + TypeScript + Tailwind.** This is what your developers should pick up. See [`nextjs/README.md`](./nextjs/README.md) for setup, architecture, and how to extend. |
| [`index.html`](./index.html) | **Prototype** — single-file vanilla HTML/CSS/JS validation build. Preserved unchanged so the existing GitHub Pages preview stays live during the handoff. Don't add features here — extend the Next.js version. |
| [`POLICY_BUILDER.md`](./POLICY_BUILDER.md) | Product-level project doc — design intent, question rationale, change log. |
| [`skills/DESIGN.md`](./skills/DESIGN.md) | Architecture notes from the prototype phase. |
| [`scripts/`](./scripts/) | Pre-push validators for the prototype's single-file HTML. Not used by the Next.js codebase. |

## For developers

```bash
cd nextjs
npm install
cp .env.example .env.local      # fill in HubSpot IDs + Calendly URLs when ready
npm run dev                     # → http://localhost:3000
```

See **[`nextjs/README.md`](./nextjs/README.md)** for the full setup, architecture overview, file-by-file map, and instructions for:
- Adding or changing a question
- Adding a clause to the generated policy
- Wiring HubSpot (no backend needed — Forms API is public-by-design)
- Wiring Calendly (env-driven URLs)
- Brand customisation (Tailwind tokens)
- Deployment targets (Vercel / Cloudflare Pages / static export)

## Why both Next.js and a single-file HTML?

The single `index.html` was the validation prototype — fast iteration, full end-to-end flow in one file, easy to share via GitHub Pages. Once the question schema, policy template, and UX were validated with the product team, the same logic was ported into a properly-structured Next.js codebase (`nextjs/`) for handoff to your engineering team.

The prototype is retained as a reference and to keep the existing preview URL alive. The Next.js version is the canonical going-forward implementation.

## License

Internal Cloudstaff project. Not licensed for external use.
