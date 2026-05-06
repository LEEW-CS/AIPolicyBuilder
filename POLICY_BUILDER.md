# Cloudstaff AI Policy Builder
### Project Documentation & Technical Reference

**Version:** v1 r1
**Build Date:** 2026-05-06
**Status:** Initial scaffold — preview build, no backend
**Owner:** Lee W — Cloudstaff
**Live URL (planned):** https://policybuilder.cloudstaff.ai
**Repository:** https://github.com/LEEW-CS/AIPolicyBuilder

---

## Pick-up Notes (2026-05-06, end of session)

- **r1** Initial scaffold. Full point-and-click wizard end-to-end: welcome → 3-field intake → 5 sections of branching questions (~22 in total) → optional free-text specifics → email confirm + phone + consult-team picker → on-screen policy preview + PDF + Word download + Calendly stub.
- The `index.html` is canonical; same single-file convention as the Client Research Tool. Run `scripts/validate.ps1` (or `validate.sh`) before pushing — it does `node --check` on the inline `<script>` block + a div-nesting-balance check.
- HubSpot lead capture and Calendly routing are stubbed in this build:
  - `submitToHubSpot()` logs the answers payload to the browser console.
  - The Calendly button on the Done screen opens `calendly.com/cloudstaff-ai-policy/30min` or `…-dev/30min` placeholder URLs in a new tab.
- Brand colours in the `:root` CSS variable block are approximate. WebFetch on cloudstaff.com returned guesses, not exact hex values. Replace once confirmed.

**Open candidates for next session (ordered by suggested priority):**

1. **Backend — Cloudflare Worker.** `policybuilder.cloudstaff.ai/api/lead` accepts the JSON payload, attaches the HubSpot API key (held in Worker secrets), and POSTs to the HubSpot Forms API. Replace `submitToHubSpot()` body with `fetch('/api/lead', …)`.
2. **Real Calendly routes.** Swap the two placeholder URLs in `renderDone()` for the actual Cloudstaff Calendly slugs — one for the AI Policy Team, one for the AI Development Team. Consider switching the buttons to inline embed (`assets.calendly.com/assets/external/widget.js`) instead of a new-tab popup.
3. **Brand hex confirmation.** Pull the exact Cloudstaff palette from a brand kit or live CSS inspection. Update `--cs-primary`, `--cs-primary-dark`, `--cs-accent`, `--cs-ink`. Logo URL is already correct.
4. **Widget bundle build.** Today the file works embedded only via `<iframe>`. To support `<div id="cs-policy-builder"></div><script src="widget.js"></script>` cleanly, write a small build that wraps the `<style>` + `<script>` + the markup into an IIFE that injects itself into the host element.
5. **Section-number renumbering.** Section headings are hardcoded ("8. Customer-Facing AI", "9. High-Risk and Decisional AI", …). When conditional sections are skipped the numbering jumps. Acceptable for v1; revisit if customers notice.
6. **Persistence.** The wizard loses state on refresh. Add `localStorage` keyed by an anonymous session id.

---

## Overview

The AI Policy Builder is a single-file browser application (`index.html`) that walks a prospect through a structured set of mostly point-and-click questions about their business and AI usage, then assembles a tailored AI Use Policy as a PDF and an editable Word document.

It's positioned as a free top-of-funnel tool on the Cloudstaff marketing site. The lead is captured into HubSpot (planned), and the user is offered a 30-minute follow-up with either the AI Policy Team or the AI Development Team via Calendly (planned).

---

## Architecture

```
Browser (index.html)
    │
    ├── Question schema (STEPS)
    │       └── Declarative — each step has a type + options + an
    │           optional condition predicate for branching.
    │
    ├── Policy template (buildPolicySections)
    │       └── Pure function — answers → array of {heading, body}.
    │           Same array drives the on-screen preview, PDF, and DOCX.
    │
    ├── jsPDF 2.5.1 (CDN)             — PDF generation
    ├── docx 8.5.0  (CDN, UMD)        — Word document generation
    └── Inter font  (Google Fonts)    — typography
```

Stubs (replaced by backend in production):

- **HubSpot Forms API.** A small Cloudflare Worker at `policybuilder.cloudstaff.ai/api/lead` will hold the HubSpot Forms API key as a Worker secret and forward the answers payload. Today: `submitToHubSpot()` writes to `console.log`.
- **Calendly routing.** Production will swap the two placeholder Calendly URLs for real org links and consider switching to an inline embed.

**No build step required.** The file runs from disk in any modern browser. All dependencies load from CDN.

---

## File Structure

```
index.html                          — Complete application (single file, ~1700 lines)
POLICY_BUILDER.md                   — This documentation file
scripts/
  validate.sh                       — Pre-push validator (bash)
  validate.ps1                      — Pre-push validator (PowerShell)
skills/
  DESIGN.md                         — Architecture notes & design decisions
.claude/
  settings.local.json               — Claude Code permissions allowlist
```

---

## Features

### Welcome screen
Branded landing card with eyebrow, hero copy, three meta items ("22 questions", "PDF + Word download", "Optional 30-min review"), and a "Get started" CTA. Hidden when the wizard advances past step 0.

### Intake (one screen, three fields)
Name, Company, Work email — required text inputs. The only mandatory typing in the entire flow until the closing phone field.

### Section 1 — About your business
- **Industry** (single-select cards): healthcare, finance, legal, government, education, professional services, technology, retail, manufacturing, other. Drives industry-specific clauses (HIPAA, PCI, etc.).
- **Headcount** (cards, two-col): 1–10, 11–50, 51–250, 251–1k, 1k–5k, 5k+.
- **Countries** (multi-select chips): AU, NZ, PH, US, California specifically, UK, EU, CA, SG, IN, Other. Drives GDPR / CCPA / Australian Privacy Act / Philippine DPA clauses.
- **Customer type** (cards, two-col): B2B / B2C / Government / Mixed.
- **Sensitive data** (chips): PII, PHI, payment, financial, IP, classified, none.

### Section 2 — AI today
- Existing policy state (none / informal / draft / formal-being-updated).
- Tools currently in use (chips, multi-select).
- Who uses AI (chips: engineering, marketing, sales, support, HR, finance, leadership, all, unsure).
- Shadow IT honesty check (yes / suspect / no / unknown). Triggers a 30-day amnesty clause in the policy if yes/suspect.

### Section 3 — Use cases & risk surface
- What you want AI to enable (chips).
- Customer-facing AI (yes / planning / no / unsure). Adds a customer-facing AI section to the policy.
- Decisions affecting individuals (yes / no / unsure). Triggers EU AI Act high-risk language. **Default-on for "unsure"** as a safeguard.
- Sensitive data input by staff (yes-with-controls / yes-no-controls / no / unsure). Drives data-handling clauses; "no controls" triggers a 90-day implementation commitment.

### Section 4 — Risk posture
- **Stance** (segmented control): conservative / balanced / enabling. Sets the tone of the whole policy.
- **Approval process** for new tools (central committee / manager / self-serve / none).
- **Personal AI accounts** for work (no / case-by-case / yes).

### Section 5 — Governance
- Who owns AI governance (CTO/CIO, CISO, Legal, AI committee, undefined).
- Training (mandatory / encouraged / none).
- Frameworks to align with (chips, optional): ISO/IEC 42001, NIST AI RMF, EU AI Act, SOC 2, ISO 27001, none specific.

### Section 6 — Specifics (optional)
Two free-text textareas for prohibitions ("things you specifically want PROHIBITED") and enabled items ("specifically permitted"). Both skippable.

### Confirm & book
- Pre-filled email banner with an Edit link (no re-typing required if the original entry was correct).
- Phone number field (required).
- Consult-team picker (single-select cards): AI Policy Team, AI Development Team, or "No thanks".

### Done screen
- Success check + personalised greeting.
- PDF download (jsPDF, A4, paginated).
- Word download (docx UMD, headings + bullets preserved).
- On-screen scrollable preview of the generated policy text.
- Calendly banner if a consult team was chosen — opens the relevant Calendly URL in a new tab (stub).
- HubSpot stub note pointing developers at the browser console.

---

## Branching engine

Every step in `STEPS` may carry an optional `condition: (answers) => boolean`. `visibleSteps()` filters the array on every render, and the progress bar recalculates against the filtered length so it stays honest.

A non-regulated B2B prospect with no AI today will answer ~12 steps. A regulated enterprise running shadow AI in five tools answers all ~22.

---

## Policy template

`buildPolicySections(answers)` is a pure function that returns an array of `{ heading, body }` objects. The same array drives:

- The scrollable on-screen preview on the Done screen.
- The jsPDF PDF generator (`downloadPDF`).
- The docx Word generator (`downloadDOCX`).

Sections currently emitted (1–16, with conditional skips):

1. Purpose and Scope
2. Definitions
3. Roles and Responsibilities
4. Acceptable Use
5. Approved Tools and the Approval Process
6. Personal AI Accounts
7. Data Handling and Confidentiality
8. Customer-Facing AI _(conditional)_
9. High-Risk and Decisional AI _(conditional)_
10. Industry and Regulatory Compliance _(conditional)_
11. Training and Awareness
12. AI Incident Response
13. Monitoring and Audit
14. Framework Alignment _(conditional)_
15. Specific Provisions _(conditional — only if free-text specifics provided)_
16. Policy Review and Amendment

The section helpers (`rolesBody`, `acceptableUseBody`, `approvalBody`, `personalAccountBody`, `dataHandlingBody`, `complianceBody`, `trainingBody`, `monitoringBody`, `frameworkBody`) each take the answers object and return a body string. Adding a new clause when regulations change is a single-helper edit.

---

## Validation

Run before every `git push` to main:

```bash
# Bash
./scripts/validate.sh

# PowerShell
.\scripts\validate.ps1
```

Both extract the inline `<script>` block, run it through `node --check` (skipped with a warning if Node isn't installed), and check that `<div>` opens balance against `</div>` closes. Exit codes: 0 ok, 1 syntax error, 2 div nesting unbalanced.

This catches the same class of bugs that bit the Client Research Tool (stray `}` after a refactor, stray `</div>` in a pane block).

---

## Versioning

Convention mirrors the Client Research Tool: bump the version number stamped at the top of `index.html` (banner comment) on every meaningful edit. Format: `v{major} r{revision}`. Major bumps for substantial UX or content overhauls; revisions for everything else.

The version comment is the single source of truth — search for `Cloudstaff AI Policy Builder — v` to find it.

---

## Known limitations (v1 r1)

- **No backend yet.** HubSpot capture and Calendly routing are stubs.
- **Brand colours approximate.** Replace `:root` tokens with exact Cloudstaff palette.
- **No state persistence.** Refresh = lose answers.
- **Section numbering doesn't auto-renumber** when conditional sections are skipped — small visual jumps in the final policy.
- **Embed-as-div not yet built.** Drop-in widget bundle is a future task; today the file works as a full standalone page or as an `<iframe>` source.
- **No translations.** English only. Cloudstaff serves PH/AU/NZ/US — English is fine for v1, revisit if needed.
