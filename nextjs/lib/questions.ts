import type { StepDef } from './types';

/**
 * The wizard's full step schema. Each step is rendered by a component
 * dispatched on its `type`. Add a step here and the renderer + branching
 * engine pick it up automatically.
 *
 * Branching is expressed as a `condition: (answers) => boolean` predicate
 * on the relevant step. The progress bar recalculates against the visible
 * step count on every render, so the count the user sees is always honest.
 */
export const STEPS: StepDef[] = [
  // ────────────── Welcome ──────────────
  { id: '_welcome', section: 'Start', type: 'welcome' },

  // ────────────── Intake ───────────────
  {
    id: '_intake',
    section: 'About you',
    type: 'multi',
    title: 'Let’s start with the basics.',
    help: 'We’ll use this to tailor your policy and email you the final document.',
    fields: [
      { id: 'name', label: 'Your name', type: 'text', required: true, placeholder: 'Jane Doe' },
      {
        id: 'company',
        label: 'Company name',
        type: 'text',
        required: true,
        placeholder: 'Acme Pty Ltd',
      },
      {
        id: 'email',
        label: 'Work email',
        type: 'email',
        required: true,
        placeholder: 'jane@acme.com',
      },
    ],
  },

  // ────────────── 1. About your business ───────────────
  {
    id: 'industry',
    section: 'Your business',
    type: 'cards',
    title: 'Which industry best describes you?',
    help: 'This drives industry-specific clauses (HIPAA, PCI-DSS, etc.).',
    options: [
      { value: 'healthcare', title: 'Healthcare', desc: 'Hospitals, clinics, telehealth, health-tech' },
      { value: 'finance', title: 'Financial services', desc: 'Banking, lending, insurance, fintech' },
      { value: 'legal', title: 'Legal', desc: 'Law firms, in-house counsel' },
      { value: 'government', title: 'Government / public sector', desc: 'Federal, state, local agencies' },
      { value: 'education', title: 'Education', desc: 'Schools, universities, edtech' },
      { value: 'professional', title: 'Professional services', desc: 'Consulting, accounting, marketing' },
      { value: 'technology', title: 'Technology / SaaS', desc: 'Software, platforms, IT services' },
      { value: 'retail', title: 'Retail / e-commerce', desc: 'B2C product sales' },
      { value: 'manufacturing', title: 'Manufacturing / logistics', desc: 'Production, supply chain' },
      { value: 'other', title: 'Something else', desc: 'We’ll keep the policy industry-neutral' },
    ],
  },
  {
    id: 'headcount',
    section: 'Your business',
    type: 'cards',
    layout: 'two-col',
    title: 'How many staff?',
    options: [
      { value: '1-10', title: '1 – 10' },
      { value: '11-50', title: '11 – 50' },
      { value: '51-250', title: '51 – 250' },
      { value: '251-1000', title: '251 – 1,000' },
      { value: '1001-5000', title: '1,001 – 5,000' },
      { value: '5000+', title: '5,000+' },
    ],
  },
  {
    id: 'countries',
    section: 'Your business',
    type: 'chips',
    title: 'Where do you operate?',
    help: 'Select all that apply. Drives GDPR / CCPA / Australian Privacy Act / Philippine Data Privacy Act clauses.',
    options: [
      { value: 'au', label: 'Australia' },
      { value: 'nz', label: 'New Zealand' },
      { value: 'ph', label: 'Philippines' },
      { value: 'us', label: 'United States' },
      { value: 'ca-state', label: 'California specifically' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'eu', label: 'European Union' },
      { value: 'ca', label: 'Canada' },
      { value: 'sg', label: 'Singapore' },
      { value: 'in', label: 'India' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'customerType',
    section: 'Your business',
    type: 'cards',
    layout: 'two-col',
    title: 'Who do you serve?',
    options: [
      { value: 'b2b', title: 'Other businesses (B2B)' },
      { value: 'b2c', title: 'Consumers (B2C)' },
      { value: 'gov', title: 'Government' },
      { value: 'mixed', title: 'A mix' },
    ],
  },
  {
    id: 'sensitiveData',
    section: 'Your business',
    type: 'chips',
    title: 'What sensitive data do you handle?',
    help: 'Select all that apply. Drives data-handling clauses.',
    options: [
      { value: 'pii', label: 'Personal information (PII)' },
      { value: 'phi', label: 'Health records (PHI)' },
      { value: 'payment', label: 'Payment / credit-card data' },
      { value: 'financial', label: 'Financial records' },
      { value: 'ip', label: 'Source code / IP' },
      { value: 'classified', label: 'Government / classified' },
      { value: 'none', label: 'None of these' },
    ],
  },

  // ────────────── 2. AI today ───────────────
  {
    id: 'existingPolicy',
    section: 'AI today',
    type: 'cards',
    title: 'Do you have an AI policy already?',
    options: [
      { value: 'none', title: 'No — starting from scratch' },
      { value: 'informal', title: 'Informal guidance', desc: 'Verbal rules, scattered docs' },
      { value: 'draft', title: 'A draft we’d like to replace' },
      { value: 'formal', title: 'A formal policy we’re updating' },
    ],
  },
  {
    id: 'currentTools',
    section: 'AI today',
    type: 'chips',
    title: 'Which AI tools are in use today?',
    help: 'Select all that apply. We’ll list these as approved tools (or flag gaps).',
    options: [
      { value: 'chatgpt', label: 'ChatGPT' },
      { value: 'claude', label: 'Claude' },
      { value: 'gemini', label: 'Gemini' },
      { value: 'copilot', label: 'GitHub Copilot' },
      { value: 'm365', label: 'Microsoft 365 Copilot' },
      { value: 'perplexity', label: 'Perplexity' },
      { value: 'cursor', label: 'Cursor / Windsurf' },
      { value: 'midjourney', label: 'Midjourney / DALL·E' },
      { value: 'custom', label: 'Custom in-house AI' },
      { value: 'unknown', label: 'We don’t actually know' },
      { value: 'none', label: 'None yet' },
    ],
  },
  {
    id: 'whoUsesAI',
    section: 'AI today',
    type: 'chips',
    title: 'Who is using AI today?',
    options: [
      { value: 'eng', label: 'Engineering' },
      { value: 'marketing', label: 'Marketing & Content' },
      { value: 'sales', label: 'Sales' },
      { value: 'support', label: 'Customer support' },
      { value: 'hr', label: 'HR / Recruiting' },
      { value: 'finance', label: 'Finance / Ops' },
      { value: 'leadership', label: 'Leadership' },
      { value: 'all', label: 'All staff' },
      { value: 'unsure', label: 'We’re not sure' },
    ],
  },
  {
    id: 'shadowIT',
    section: 'AI today',
    type: 'cards',
    title: 'Are staff using AI tools without official approval?',
    help: '"Shadow AI" is one of the biggest policy gaps — be honest, this stays between us.',
    options: [
      { value: 'yes', title: 'Yes — we know it’s happening' },
      { value: 'suspect', title: 'We suspect so' },
      { value: 'no', title: 'No — we have controls in place' },
      { value: 'unknown', title: 'We don’t know' },
    ],
  },

  // ────────────── 3. Use cases & risk surface ───────────────
  {
    id: 'useCases',
    section: 'Use cases',
    type: 'chips',
    title: 'What do you want AI to enable?',
    help: 'Select all that apply.',
    options: [
      { value: 'content', label: 'Content / marketing copy' },
      { value: 'code', label: 'Code generation' },
      { value: 'research', label: 'Research & summarisation' },
      { value: 'support', label: 'Customer support / chatbots' },
      { value: 'analytics', label: 'Data analysis' },
      { value: 'translation', label: 'Translation' },
      { value: 'meetings', label: 'Meeting transcription' },
      { value: 'hiring', label: 'Hiring / candidate screening' },
      { value: 'finance', label: 'Financial decisioning' },
      { value: 'agents', label: 'Autonomous agents' },
    ],
  },
  {
    id: 'customerFacing',
    section: 'Use cases',
    type: 'cards',
    layout: 'two-col',
    title: 'Will AI talk to your customers directly?',
    help: 'Public chatbots, voice agents, automated email responses.',
    options: [
      { value: 'yes', title: 'Yes, today' },
      { value: 'planning', title: 'Planning to' },
      { value: 'no', title: 'No' },
      { value: 'unsure', title: 'Not sure yet' },
    ],
  },
  {
    id: 'highStakes',
    section: 'Use cases',
    type: 'cards',
    title: 'Will AI be used in decisions that affect individuals?',
    help: 'Hiring, performance reviews, lending, insurance, eligibility — flagged "high-risk" under the EU AI Act.',
    options: [
      { value: 'yes', title: 'Yes', desc: 'We need EU AI Act high-risk language' },
      { value: 'no', title: 'No', desc: 'AI only assists with non-impactful tasks' },
      { value: 'unsure', title: 'We’re not sure', desc: 'Include the language as a safeguard' },
    ],
  },
  {
    id: 'sensitiveDataInput',
    section: 'Use cases',
    type: 'cards',
    title: 'Will staff put sensitive data into AI tools?',
    help: 'Customer records, contracts, source code, financial data, etc.',
    options: [
      { value: 'yes-controls', title: 'Yes — with controls', desc: 'Enterprise plans, DLP, no-training agreements' },
      { value: 'yes-no-controls', title: 'Yes — but no controls in place yet' },
      { value: 'no', title: 'No', desc: 'Sensitive data is prohibited from AI tools' },
      { value: 'unsure', title: 'Not sure' },
    ],
  },

  // ────────────── 4. Risk posture ───────────────
  {
    id: 'stance',
    section: 'Risk posture',
    type: 'segmented',
    title: 'What’s your overall stance?',
    help: 'This sets the tone of the whole policy.',
    options: [
      { value: 'conservative', title: 'Conservative', desc: 'Block by default · approved use only' },
      { value: 'balanced', title: 'Balanced', desc: 'Approved list · staff request access' },
      { value: 'enabling', title: 'Enabling', desc: 'Open with guardrails · ship fast' },
    ],
  },
  {
    id: 'approvalProcess',
    section: 'Risk posture',
    type: 'cards',
    title: 'How will new AI tools be approved?',
    options: [
      { value: 'central', title: 'Central review committee', desc: 'Security / Legal / IT sign-off' },
      { value: 'manager', title: 'Direct manager approval' },
      { value: 'self-serve', title: 'Self-serve from approved list' },
      { value: 'none', title: 'No process today', desc: 'We need help defining one' },
    ],
  },
  {
    id: 'personalAccounts',
    section: 'Risk posture',
    type: 'cards',
    layout: 'two-col',
    title: 'Are personal AI accounts allowed for work?',
    help: 'e.g. an employee’s personal ChatGPT Plus subscription.',
    options: [
      { value: 'no', title: 'No', desc: 'Company accounts only' },
      { value: 'case', title: 'Case-by-case', desc: 'With approval' },
      { value: 'yes', title: 'Yes', desc: 'For non-sensitive use' },
    ],
  },

  // ────────────── 5. Governance ───────────────
  {
    id: 'owner',
    section: 'Governance',
    type: 'cards',
    title: 'Who owns AI governance?',
    options: [
      { value: 'cto', title: 'CTO / CIO' },
      { value: 'ciso', title: 'CISO / Head of Security' },
      { value: 'legal', title: 'Legal / Compliance' },
      { value: 'committee', title: 'Dedicated AI committee' },
      { value: 'undefined', title: 'Not yet defined', desc: 'Recommend an owner' },
    ],
  },
  {
    id: 'training',
    section: 'Governance',
    type: 'cards',
    layout: 'two-col',
    title: 'How will staff be trained?',
    options: [
      { value: 'mandatory', title: 'Mandatory training', desc: 'Annual + onboarding' },
      { value: 'encouraged', title: 'Encouraged', desc: 'Resources provided, not enforced' },
      { value: 'none', title: 'None planned' },
    ],
  },
  {
    id: 'frameworks',
    section: 'Governance',
    type: 'chips',
    title: 'Any frameworks to align with?',
    help: 'Optional. Adds compliance-mapping language.',
    options: [
      { value: 'iso42001', label: 'ISO/IEC 42001' },
      { value: 'nist-airmf', label: 'NIST AI RMF' },
      { value: 'eu-ai-act', label: 'EU AI Act' },
      { value: 'soc2', label: 'SOC 2' },
      { value: 'iso27001', label: 'ISO 27001' },
      { value: 'none', label: 'None specific' },
    ],
  },

  // ────────────── 6. Specifics (optional) ───────────────
  {
    id: '_specifics',
    section: 'Specifics (optional)',
    type: 'multi',
    title: 'Anything specific to call out?',
    help: 'Optional. Skip either or both — we’ll auto-fill from your earlier answers.',
    optional: true,
    fields: [
      {
        id: 'prohibitions',
        type: 'textarea',
        label: 'Things you specifically want PROHIBITED',
        placeholder:
          'e.g. No AI use in performance reviews. No customer PII in any public AI tool.',
      },
      {
        id: 'enabledItems',
        type: 'textarea',
        label: 'Things you specifically want ENABLED',
        placeholder: 'e.g. GitHub Copilot for engineers. ChatGPT Enterprise for marketing.',
      },
    ],
  },

  // ────────────── Closing ───────────────
  { id: '_confirm', section: 'Confirm', type: 'confirm' },
  { id: '_done', section: 'Your policy', type: 'done' },
];
