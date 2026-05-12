# Cloudstaff AI Policy Builder — Next.js

Next.js 15 + TypeScript + Tailwind. A free top-of-funnel marketing tool that walks a prospect through 20+ branching questions and emits a tailored AI Use Policy as PDF + editable DOCX. Designed to be embedded on `cloudstaff.com` (or stand alone at `policybuilder.cloudstaff.ai`).

This codebase is the developer-handoff version of the validation prototype in `../index.html` at the repo root. The prototype is preserved unchanged so the existing GitHub Pages preview at <https://leew-cs.github.io/AIPolicyBuilder/> keeps working while you take this over.

## Quickstart

```bash
cd nextjs
npm install
cp .env.example .env.local      # fill in HubSpot IDs + Calendly URLs when ready
npm run dev                     # → http://localhost:3000
```

Other scripts:
```bash
npm run build         # production build
npm run start         # serve the production build
npm run type-check    # tsc --noEmit
npm run lint          # next lint
npm run format        # prettier --write
```

Requires **Node 20+** (see `engines.node` in package.json).

## What works out of the box

| Feature | Status |
|---|---|
| 20+ point-and-click questions with branching logic | ✓ |
| Progress bar (recalculates against visible-step count) | ✓ |
| Client-side PDF generation (jspdf, A4, paginated) | ✓ |
| Client-side DOCX generation (`docx` package, headings + bullets) | ✓ |
| Email pre-fill with one-click "Edit" jump-back | ✓ |
| Policy-template conditional sections (EU AI Act, HIPAA, PCI-DSS, GDPR, AU/PH/NZ/SG privacy regimes) | ✓ |
| Calendly stub (opens chosen team's URL in new tab) | ✓ — replace with inline embed for prod |
| HubSpot lead capture | Stub — see "Wiring HubSpot" below |

## Architecture

```
nextjs/
├── app/
│   ├── layout.tsx               Root layout — Inter font, metadata
│   ├── page.tsx                 Page chrome (logo header) + <PolicyBuilder />
│   └── globals.css              Tailwind base + CSS variables
│
├── components/
│   ├── PolicyBuilder.tsx        Main wizard — state, branching, validation, dispatch
│   ├── ProgressBar.tsx          Top progress UI
│   ├── steps/                   One component per step type
│   │   ├── WelcomeStep.tsx
│   │   ├── MultiFieldStep.tsx   Multi-input form (intake, specifics)
│   │   ├── CardsStep.tsx        Single-select tile cards
│   │   ├── ChipsStep.tsx        Multi-select chips
│   │   ├── SegmentedStep.tsx    Three-option segmented control
│   │   ├── ConfirmStep.tsx      Email confirm + phone + consult picker
│   │   └── DoneStep.tsx         Preview + downloads + Calendly buttons
│   └── ui/
│       ├── StepHeader.tsx       Section / title / help triplet
│       └── NavFooter.tsx        Back + Continue buttons
│
└── lib/
    ├── types.ts                 Answers, StepDef, PolicySection
    ├── questions.ts             STEPS — full question schema (the source of truth)
    ├── hubspot.ts               submitToHubspot — HubSpot Forms API client (no backend)
    ├── policy/
    │   ├── builder.ts           buildPolicySections — pure answers → sections
    │   └── helpers.ts           ownerName, countriesPhrase, sensitiveList, etc.
    └── exporters/
        ├── pdf.ts               downloadPDF — jspdf, A4
        └── docx.ts              downloadDOCX — docx package
```

### Data flow

1. User loads `/` — `PolicyBuilder` mounts with empty `answers`.
2. `STEPS` from `lib/questions.ts` is filtered to `visibleSteps` based on each step's optional `condition(answers)` predicate. The progress bar uses `visibleSteps.length`, so branching is honest.
3. The current step is dispatched by `type` to its component. Step components read/write `answers` through `setAnswer(key, value)`.
4. `Continue` runs `validateStep(...)` against the current step; on success, advances. The Confirm → Done transition also calls `submitToHubspot(answers)`.
5. The Done step calls `buildPolicySections(answers)` synchronously to render the preview, and lazy-imports `lib/exporters/pdf` / `lib/exporters/docx` on demand for downloads.

### Why a single flat `Answers` map?

Adding a question is a one-place change in `lib/questions.ts`. The branching engine, the validator, the policy builder, and the HubSpot mapping all read from the same record. No per-step state shape to keep in sync.

## How to extend

### Add or change a question

Edit `lib/questions.ts`. Each entry in `STEPS` is one step:

```ts
{
  id: 'newQuestion',
  section: 'Risk posture',
  type: 'cards',                     // or 'chips' | 'segmented' | 'multi' | 'welcome' | 'confirm' | 'done'
  title: 'New question?',
  help: 'Optional helper text.',
  options: [
    { value: 'yes', title: 'Yes' },
    { value: 'no',  title: 'No' },
  ],
  condition: (a) => a.industry === 'finance',   // optional — branching
}
```

### Add a clause to the generated policy

Edit `lib/policy/builder.ts`. Either:
- Add a conditional `sections.push({ heading, body })` at the appropriate section number, **or**
- Extend one of the body helpers (`rolesBody`, `complianceBody`, etc.) — they're pure functions on `Answers`.

Numbering today is hardcoded in headings. If conditional sections are skipped, numbering can jump — acceptable for v1, revisit if customers notice.

### Wiring HubSpot

1. **Create the form** in HubSpot → Marketing → Forms (a "Non-HubSpot Form" works fine). Add fields for at least `firstname`, `lastname`, `email`, `company`, `phone`. Optionally add the `ai_policy_*` custom contact properties you want to capture.
2. **Match the field `name` attributes** in HubSpot to those in `lib/hubspot.ts → mapAnswersToHubspot`. Rename either side until they line up.
3. **Copy the Portal ID + Form GUID** from HubSpot's form-share view.
4. **Set the env vars** in `.env.local`:
   ```
   NEXT_PUBLIC_HUBSPOT_PORTAL_ID=12345678
   NEXT_PUBLIC_HUBSPOT_FORM_GUID=abc-def-...
   ```
5. **Deploy.** Submissions land directly in HubSpot. No backend, no API key (the Forms API is public by design — same security model as HubSpot's official embed snippet).

Until the env vars are set, `submitToHubspot` logs the payload to the browser console and returns `{ ok: false, skippedReason: 'env-vars-missing' }` so the wizard's Done step still works during development.

### Wiring Calendly

`NEXT_PUBLIC_CALENDLY_POLICY_URL` and `NEXT_PUBLIC_CALENDLY_DEV_URL` in `.env.local`. Today the Done step opens the URL in a new tab — for a nicer experience, swap for the official inline-embed widget (Calendly's documentation has the React snippet).

### Brand customisation

Design tokens live in two places:
- `tailwind.config.ts` — Tailwind colour palette under `theme.extend.colors.cs`
- `app/globals.css` — matching CSS variables (for any non-Tailwind overrides)

The current values were approximated from `cloudstaff.com`; swap them for the exact hex codes from the Cloudstaff brand kit when you have it.

## Deployment

The site is purely client-rendered (no API routes needed — HubSpot Forms API is called directly from the browser). Three viable targets:

### Vercel (recommended — zero config)
1. Push to your Git provider.
2. Import in Vercel → it auto-detects Next.js.
3. Add the `NEXT_PUBLIC_*` env vars.
4. Done. Auto-redeploys on every push.

### Cloudflare Pages
Connect the repo in Cloudflare Pages → framework preset "Next.js". Add env vars under **Settings → Environment variables**. Custom domain via the project's "Custom domains" tab.

### Static export (GitHub Pages, S3, any static host)
Uncomment the `output: 'export'` line in `next.config.mjs` and run:
```bash
npm run build
```
The static site lands in `./out`. Drop it onto any static host. **Note**: `next/image` with `unoptimized: true` is required for static export, which is already configured for the Cloudstaff logo in `app/page.tsx`.

## Known gaps / next steps

- **No localStorage state persistence.** Refresh during the wizard = lose answers. Add `useEffect` saving to `localStorage` keyed by an anonymous session id if conversion measurement shows drop-offs.
- **Section numbering is hardcoded** in `lib/policy/builder.ts`. When conditional sections are skipped (e.g. customer-facing AI), the visible heading numbers can jump. Acceptable for v1.
- **Validation uses `alert()`** in `PolicyBuilder.tsx → validateStep`. Replace with inline error rendering when the design calls for it.
- **No analytics.** Add a `useEffect` in `PolicyBuilder.tsx` that fires `gtag('event', 'step_view', { step: current.id })` (or your preferred analytics SDK) on every step change.
- **Embed-as-widget bundle.** Marketing wants to drop `<div id="cs-policy-builder"></div><script src="...">` onto any cloudstaff.com page. For this you'd want a separate small React bundle that mounts into a host element — easiest path is to keep the Next.js site as-is and offer marketing the iframe option, or create a parallel Vite-built widget that reuses the `lib/` and `components/` code.

## Repo context

This `nextjs/` directory is a sibling of:
- `../index.html` — the original single-file prototype (still served by GitHub Pages)
- `../POLICY_BUILDER.md` — product-level project doc
- `../skills/DESIGN.md` — architecture notes from the prototype

The Next.js version is the canonical going-forward codebase. The prototype is retained for historical reference and to keep the live preview URL valid during the developer handoff.
