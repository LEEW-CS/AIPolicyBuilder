# AI Policy Builder — Architecture Notes

**Status:** v1 r1 — initial scaffold. Single-file widget; no backend yet.
**Companion:** see `POLICY_BUILDER.md` for product overview and change log.

---

## Why this doc exists

The Client Research Tool's monolithic `doResearch()` got expensive to maintain at ~5500 lines and one giant prompt. We kept that lesson in mind here: the policy builder uses a **declarative question schema** + **conditional template assembly** so the wizard flow and the policy content are both data-driven, not procedural.

If we have to extend this thing every quarter as new regulations land (EU AI Act phases, US state-level AI laws, sector rules), that has to be a low-friction edit — add a question to `STEPS`, add a conditional clause to `buildPolicySections()`, ship.

---

## Architecture

```
Browser (index.html)
   │
   ├── Question schema (STEPS array)
   │       └── Each step has: type, options/fields, optional `condition`
   │           predicate that controls visibility based on prior answers.
   │
   ├── State (STATE.answers)
   │       └── Plain object keyed by question id. No persistence yet —
   │           refresh = lose state. Add localStorage if needed.
   │
   ├── Renderer (render → renderCards/Chips/Segmented/Multi/etc.)
   │       └── Re-renders the entire card on every state change.
   │           Cheap enough at this scale; avoids virtual-DOM machinery.
   │
   ├── Branching engine (visibleSteps)
   │       └── Filters STEPS by `condition(answers)`. Progress bar
   │           recalculates every render so it stays honest.
   │
   ├── Policy template (buildPolicySections)
   │       └── Pure function: answers → array of {heading, body}.
   │           Each section helper (rolesBody, dataHandlingBody, …)
   │           consumes the answers and emits Markdown-ish text.
   │
   ├── PDF generator (downloadPDF — jsPDF UMD)
   │       └── A4, manual pagination, sans-serif body.
   │
   ├── DOCX generator (downloadDOCX — docx UMD)
   │       └── Headings + bullets recognised from "•" or "-" prefix.
   │
   ├── HubSpot stub (submitToHubSpot)
   │       └── Logs payload to console. Production: POSTs JSON to
   │           Cloudflare Worker which holds the HubSpot API key.
   │
   └── Calendly stub
           └── Opens calendly.com URLs in a new tab. Production:
               inline embed widget routed by consultType answer.
```

**No build step.** Single `index.html`, three CDN dependencies (Inter font, jsPDF, docx). Drops into any Cloudflare Pages / Vercel / static host.

---

## Embed contract

Marketing's intended use:

```html
<div id="cs-policy-builder"></div>
<script src="https://policybuilder.cloudstaff.ai/widget.js"></script>
```

To keep that path open later:

- All CSS is scoped to `#cs-policy-builder` (and an outer `.page-header` that the widget build will strip).
- All JS interaction is bound inside the widget root — no global event listeners on `document` or `body`.
- No global CSS resets that would leak into the host page.

For now the file ships as a full standalone HTML page with the page chrome included. The widget-bundle build is a future task: extract the `<style>` block + the `<script>` block + the widget root markup, wrap in an IIFE that injects them into a target element.

---

## Question schema reference

Each entry in `STEPS` is one wizard step. Types:

| Type        | Purpose                                                   |
|-------------|-----------------------------------------------------------|
| `welcome`   | Hero screen, no answers collected                         |
| `multi`     | Multi-field form on one screen (intake, specifics)        |
| `cards`     | Single-select tile cards (industry, headcount, etc.)      |
| `chips`     | Multi-select pills (countries, tools, frameworks)         |
| `segmented` | Single-select horizontal bar (risk stance)                |
| `confirm`   | Email confirmation + phone + consult-team picker          |
| `done`      | Policy preview + PDF/DOCX downloads + Calendly stub       |

Optional fields on a step:

- `condition: (answers) => boolean` — branching predicate. Step is hidden when false.
- `optional: true` — skips required-field validation.
- `layout: 'two-col'` — for `cards`, switches to a 2-column grid on wide screens.

To add a new question: drop a new entry into `STEPS`. Renderer dispatches by `type`. No other code changes required for the wizard side.

---

## Policy template

`buildPolicySections(answers)` is the single place where wording lives. It returns an array of `{ heading, body }` consumed identically by the on-screen preview, the PDF generator, and the DOCX generator.

Conditional sections look like:

```js
if (a.customerFacing === 'yes' || a.customerFacing === 'planning') {
  sections.push({ heading: '…', body: '…' });
}
```

Section helpers (`rolesBody`, `acceptableUseBody`, `approvalBody`, `personalAccountBody`, `dataHandlingBody`, `complianceBody`, `trainingBody`, `monitoringBody`, `frameworkBody`) each take the answers object and return a body string. Keeping them as small pure functions makes regulatory updates easy: the only place to touch when EU AI Act rules change is `complianceBody` and `frameworkBody`.

**Numbering caveat:** section numbers are hardcoded in headings today. If conditional sections are skipped, numbering can jump. Acceptable for v1; revisit if it's noticed in the field.

---

## Open work (post-v1 r1)

1. **Cloudflare Worker backend** — `policybuilder.cloudstaff.ai/api/lead` to relay to HubSpot Forms API. Replaces the `submitToHubSpot()` console-log stub.
2. **Real Calendly routing** — replace the two placeholder `calendly.com/cloudstaff-ai-*` URLs with the real org Calendly slugs for the AI Policy Team and AI Development Team.
3. **Brand hex confirmation** — the `:root` CSS variables are approximate. Replace with exact Cloudstaff palette.
4. **Widget bundle** — produce a `widget.js` bundle so marketing can drop `<div id="cs-policy-builder"></div><script src="…"></script>` onto any page. Today's HTML works as `iframe` source if needed before that ships.
5. **localStorage state** — survive page refresh / browser navigation.
6. **A/B-able preview** — a switch to render the policy preview inline vs. behind the email-confirm step (for conversion testing).
7. **Section-number renumbering** — auto-renumber headings after conditional skips so the final policy reads cleanly regardless of which sections drop out.
