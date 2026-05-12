import type { Answers, PolicySection } from '../types';
import {
  any,
  arrAnswer,
  countriesPhrase,
  has,
  ownerName,
  sensitiveList,
  strAnswer,
} from './helpers';

/**
 * Pure function: answers → array of {heading, body}.
 *
 * The same returned array drives the on-screen preview (DoneStep), the
 * PDF generator (lib/exporters/pdf.ts), and the DOCX generator
 * (lib/exporters/docx.ts) — change a clause here and all three update.
 */
export function buildPolicySections(a: Answers): PolicySection[] {
  const company = strAnswer(a, 'company') || '[Company]';
  const today = new Date().toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const sections: PolicySection[] = [];

  // Header info
  sections.push({
    heading: `AI Use Policy — ${company}`,
    body: `Effective date: ${today}\nOwner: ${ownerName(strAnswer(a, 'owner'))}\nClassification: Internal`,
  });

  // 1. Purpose & Scope
  sections.push({
    heading: '1. Purpose and Scope',
    body: `This policy establishes guidelines for the responsible use of artificial intelligence (AI) tools and systems at ${company}.

It applies to all employees, contractors, and third parties who use AI tools — including generative AI, AI assistants, AI agents, and AI-augmented services — in connection with company business${
      countriesPhrase(arrAnswer(a, 'countries'))
        ? ' across ' + countriesPhrase(arrAnswer(a, 'countries'))
        : ''
    }.

The policy covers both company-provided AI tools and any AI capability accessed through third-party services, including AI features embedded in productivity, communication, and development platforms.`,
  });

  // 2. Definitions
  sections.push({
    heading: '2. Definitions',
    body: `AI Tool — any software application or service that uses machine learning, natural language processing, computer vision, or generative models to produce outputs, recommendations, or actions.

Generative AI — AI systems that create new content (text, code, images, audio, video) based on patterns learned from training data.

High-Risk AI Use — any deployment of AI in decisions that materially affect a person's rights, opportunities, employment, finances, health, or legal status.

Sensitive Data — any data classified as personal, confidential, regulated, or proprietary, including ${sensitiveList(arrAnswer(a, 'sensitiveData'))}.

Approved AI Tool — an AI tool that has been reviewed and authorised for use under the process set out in Section 5.`,
  });

  // 3. Roles & Responsibilities
  sections.push({ heading: '3. Roles and Responsibilities', body: rolesBody(a) });

  // 4. Acceptable Use
  sections.push({ heading: '4. Acceptable Use', body: acceptableUseBody(a) });

  // 5. Approved Tools & Approval Process
  sections.push({ heading: '5. Approved Tools and the Approval Process', body: approvalBody(a) });

  // 6. Personal AI accounts
  sections.push({ heading: '6. Personal AI Accounts', body: personalAccountBody(a) });

  // 7. Data Handling
  sections.push({ heading: '7. Data Handling and Confidentiality', body: dataHandlingBody(a) });

  // 8. Customer-Facing AI (conditional)
  if (strAnswer(a, 'customerFacing') === 'yes' || strAnswer(a, 'customerFacing') === 'planning') {
    sections.push({
      heading: '8. Customer-Facing AI',
      body: `AI systems that interact directly with customers — including chatbots, voice agents, and automated communications — must:

• Clearly disclose that the customer is interacting with an AI system before any substantive exchange.
• Provide a path to a human agent on request.
• Be tested against representative inputs before launch and monitored for hallucinations, bias, and unsafe outputs.
• Log interactions for at least 12 months, subject to applicable privacy law.
• Avoid making definitive statements on legal, medical, or financial matters unless the system has been specifically certified for that domain.

Marketing, product, and support owners are jointly accountable for the behaviour of customer-facing AI in their area.`,
    });
  }

  // 9. High-stakes decisions (conditional)
  if (strAnswer(a, 'highStakes') === 'yes' || strAnswer(a, 'highStakes') === 'unsure') {
    sections.push({
      heading: '9. High-Risk and Decisional AI',
      body: `AI systems used in decisions that materially affect individuals — including hiring, promotion, performance management, lending, insurance, eligibility, or pricing — are treated as high-risk under this policy and aligned with the EU AI Act's high-risk system requirements${
        has(arrAnswer(a, 'frameworks'), 'eu-ai-act') ? '' : ' as a precautionary baseline'
      }.

For any high-risk AI use, ${company} will:

• Maintain documentation of the system's purpose, training data sources (where available), and known limitations.
• Require human review and sign-off on AI-generated decisions before they take effect.
• Test for and monitor disparate impact across protected characteristics.
• Provide affected individuals with notice that AI was used and a route to contest the decision.
• Conduct an impact assessment before deployment and on every material change.

AI must never be the sole decision-maker on hiring, dismissal, performance ratings, or denial of a customer-facing service.`,
    });
  }

  // 10. Industry & Geographic compliance
  const compliance = complianceBody(a);
  if (compliance) {
    sections.push({ heading: '10. Industry and Regulatory Compliance', body: compliance });
  }

  // 11. Training & Awareness
  sections.push({ heading: '11. Training and Awareness', body: trainingBody(a) });

  // 12. Incident Response
  sections.push({
    heading: '12. AI Incident Response',
    body: `Any of the following must be reported to ${ownerName(strAnswer(a, 'owner'))} within 24 hours of discovery:

• Sensitive data inadvertently shared with an AI system.
• An AI output that caused, or could plausibly cause, harm to a customer, employee, or third party.
• A suspected jailbreak, prompt injection, or misuse of a company AI tool.
• Significant hallucinations or factual errors in AI output that have been published or acted upon externally.

Reports can be made via ${
      strAnswer(a, 'owner') === 'undefined'
        ? '[reporting channel — to be defined]'
        : 'the standard security incident channel'
    }. Staff who report in good faith will not be penalised, even if they were partially at fault.

A post-incident review will be conducted for any incident that affects customers or external parties.`,
  });

  // 13. Monitoring & Audit
  sections.push({ heading: '13. Monitoring and Audit', body: monitoringBody(a) });

  // 14. Framework Alignment (conditional)
  const framework = frameworkBody(a);
  if (framework) sections.push({ heading: '14. Framework Alignment', body: framework });

  // 15. Specific Provisions (conditional)
  const prohibitions = strAnswer(a, 'prohibitions').trim();
  const enabledItems = strAnswer(a, 'enabledItems').trim();
  if (prohibitions || enabledItems) {
    let body = '';
    if (prohibitions) {
      body += `Prohibited uses called out by ${company}:\n\n${prohibitions}\n\n`;
    }
    if (enabledItems) {
      body += `Specifically permitted uses:\n\n${enabledItems}`;
    }
    sections.push({ heading: '15. Specific Provisions', body: body.trim() });
  }

  // 16. Policy Review
  const reviewNo = prohibitions || enabledItems ? 16 : 15;
  sections.push({
    heading: `${reviewNo}. Policy Review and Amendment`,
    body: `This policy will be reviewed at least annually and updated whenever:

• A new class of AI tool is introduced into ${company} operations.
• A material regulatory change occurs in any jurisdiction where ${company} operates.
• An AI incident reveals a gap in the policy.

The policy owner (${ownerName(strAnswer(a, 'owner'))}) is responsible for initiating review. All staff are encouraged to suggest improvements at any time.

Policy version: 1.0 — generated ${today}.`,
  });

  return sections;
}

// ─────────────────────────────────────────────────────────────────────
// Section helpers — each takes the full answers and returns the body
// string for one section. Adding regulatory language is a single-helper
// edit, which keeps the regulatory-update friction low.
// ─────────────────────────────────────────────────────────────────────

function rolesBody(a: Answers): string {
  const owner = ownerName(strAnswer(a, 'owner'));
  const company = strAnswer(a, 'company') || '[Company]';
  let body = `${owner} is accountable for the AI governance program at ${company}, including policy maintenance, tool approval, and incident response.\n\n`;
  body += `All staff and contractors are responsible for:\n\n`;
  body += `• Using only approved AI tools for company work.\n`;
  body += `• Following the data-handling rules in Section 7.\n`;
  body += `• Reporting AI-related incidents promptly.\n`;
  body += `• Completing required training (Section 11).`;
  if (strAnswer(a, 'approvalProcess') === 'central') {
    body += `\n\nA central review committee, chaired by ${owner}, evaluates new AI tools before they are approved for use. The committee includes representatives from Security, Legal, and IT.`;
  } else if (strAnswer(a, 'approvalProcess') === 'manager') {
    body += `\n\nDirect managers are responsible for reviewing and approving AI tool requests from their team members, in consultation with ${owner} for any tool that handles sensitive data.`;
  }
  return body;
}

function acceptableUseBody(a: Answers): string {
  const stance = strAnswer(a, 'stance') || 'balanced';
  const company = strAnswer(a, 'company') || '[Company]';
  const intro: Record<string, string> = {
    conservative: `${company} takes a conservative posture: AI tools may only be used where they have been expressly approved for a specific purpose, and only by staff who have completed the relevant training. When in doubt, do not use an AI tool — ask first.`,
    balanced: `${company} encourages the productive use of AI within clear guardrails. Staff may use any AI tool from the approved list (Section 5) for company work that does not involve sensitive data, and may request the addition of new tools through the approval process.`,
    enabling: `${company} actively encourages staff to experiment with AI tools to improve productivity, quality, and creativity. The default posture is "yes, with guardrails" — staff should choose the right tool for the job, follow the rules in this policy, and ask if unsure.`,
  };
  const general = `\n\nIn all cases, staff must:\n\n• Not enter sensitive data (Section 7) into an AI tool unless that tool is explicitly approved for that data class.\n• Treat AI output as a draft, not a final answer — verify facts, citations, calculations, and code before relying on it.\n• Not present AI-generated work as solely human-authored where attribution matters (e.g. published articles, certifications, academic submissions).\n• Not use AI tools for any purpose that would be unethical, illegal, or contrary to ${company} values if a human did it.`;
  return (intro[stance] ?? intro.balanced) + general;
}

function approvalBody(a: Answers): string {
  const company = strAnswer(a, 'company') || '[Company]';
  const owner = ownerName(strAnswer(a, 'owner'));
  let body = '';
  const tools = arrAnswer(a, 'currentTools');
  const knownTools = tools.filter((t) => !['none', 'unknown'].includes(t));

  if (knownTools.length) {
    const labels: Record<string, string> = {
      chatgpt: 'ChatGPT (OpenAI)',
      claude: 'Claude (Anthropic)',
      gemini: 'Gemini (Google)',
      copilot: 'GitHub Copilot',
      m365: 'Microsoft 365 Copilot',
      perplexity: 'Perplexity',
      cursor: 'Cursor / Windsurf',
      midjourney: 'Midjourney / DALL·E',
      custom: 'In-house AI systems',
    };
    body += `The following tools are currently in use at ${company} and are approved subject to the data-handling rules in Section 7:\n\n`;
    body += knownTools.map((t) => `• ${labels[t] ?? t}`).join('\n');
    body += `\n\n`;
  }

  switch (strAnswer(a, 'approvalProcess')) {
    case 'central':
      body += `New AI tools must be requested through the central review committee. The request must include the intended use case, data classes involved, vendor security posture (SOC 2 / ISO 27001 / equivalent), data-handling terms (training opt-out, data residency, retention), and a named business owner. The committee responds within 10 business days.`;
      break;
    case 'manager':
      body += `New AI tools must be approved by the requestor's direct manager. Tools that will handle sensitive data require additional sign-off from ${owner}.`;
      break;
    case 'self-serve':
      body += `Staff may self-serve any tool on the approved list above. Adding new tools requires a request to ${owner}.`;
      break;
    default:
      body += `An approval process is being established. Until it is published, staff must check with ${owner} before adopting any new AI tool for company work.`;
  }

  if (strAnswer(a, 'shadowIT') === 'yes' || strAnswer(a, 'shadowIT') === 'suspect') {
    body += `\n\nAn amnesty period of 30 days from the effective date of this policy applies: any tool currently in use without approval may be disclosed without penalty so it can be reviewed and either approved or discontinued.`;
  }
  return body;
}

function personalAccountBody(a: Answers): string {
  const company = strAnswer(a, 'company') || '[Company]';
  const owner = ownerName(strAnswer(a, 'owner'));
  return (
    (
      {
        no: `Personal AI accounts (e.g. an employee's personal ChatGPT, Claude, or Gemini subscription) must not be used for any ${company} work. Only company-issued accounts on approved tools may be used.`,
        case: `Personal AI accounts may be used for ${company} work only with prior written approval from ${owner}, and only for non-sensitive tasks. The default expectation is that staff use company-issued accounts.`,
        yes: `Personal AI accounts may be used for ${company} work, provided that no sensitive data (Section 7) is entered and the tool's terms permit business use. Staff are responsible for ensuring the tool's privacy and data-handling settings are appropriate.`,
      } as Record<string, string>
    )[strAnswer(a, 'personalAccounts')] ??
    `Use of personal AI accounts for company work is governed by the rules in Sections 4 and 7.`
  );
}

function dataHandlingBody(a: Answers): string {
  const company = strAnswer(a, 'company') || '[Company]';
  const sd = arrAnswer(a, 'sensitiveData');
  let body = `Sensitive data must be protected when using AI tools. The following data classes are explicitly in scope at ${company}: ${sensitiveList(sd)}.\n\nGeneral rules:\n\n• Sensitive data may only be entered into an AI tool when (a) the tool is on the approved list, (b) the tool's terms guarantee that customer data is not used for model training, and (c) the tool's data residency satisfies any applicable regulation.\n• Public AI tools (free or consumer-tier ChatGPT, Claude, Gemini, etc.) must not receive sensitive data under any circumstance.\n• When a sensitive-data exposure occurs, follow the incident response process in Section 12 immediately.`;

  switch (strAnswer(a, 'sensitiveDataInput')) {
    case 'yes-no-controls':
      body += `\n\nA priority action under this policy is to put technical controls in place — including data-loss prevention (DLP), enterprise-tier AI subscriptions with no-training agreements, and access logging — within 90 days of the policy's effective date.`;
      break;
    case 'yes-controls':
      body += `\n\nExisting controls (enterprise-tier subscriptions with no-training agreements, DLP, and access logging) must remain in place. Any new tool intended to receive sensitive data must demonstrate equivalent controls before approval.`;
      break;
    case 'no':
      body += `\n\nSensitive data is prohibited from all AI tools. Use of AI for tasks involving sensitive data must use redacted or synthetic inputs only.`;
      break;
  }

  if (has(sd, 'phi')) {
    body += `\n\nProtected Health Information (PHI): only AI tools covered by a HIPAA Business Associate Agreement (BAA) may receive PHI.`;
  }
  if (has(sd, 'payment')) {
    body += `\n\nPayment-card data: PCI-DSS scope applies. Staff must not enter cardholder data into any AI tool. AI use within the cardholder data environment requires explicit approval and security review.`;
  }
  if (has(sd, 'classified')) {
    body += `\n\nClassified or government-controlled information: must only be processed in approved sovereign-cloud or air-gapped environments. Public AI services are prohibited for this data class.`;
  }
  return body;
}

function complianceBody(a: Answers): string {
  const parts: string[] = [];
  const sd = arrAnswer(a, 'sensitiveData');
  const ct = arrAnswer(a, 'countries');
  const industry = strAnswer(a, 'industry');
  const company = strAnswer(a, 'company') || '[Company]';

  if (industry === 'healthcare' || has(sd, 'phi')) {
    parts.push(
      `Healthcare / HIPAA: AI tools used in connection with protected health information must be covered by a Business Associate Agreement. Staff must not paste patient identifiers or clinical notes into any AI tool not explicitly approved for PHI.`
    );
  }
  if (industry === 'finance' || any(sd, ['payment', 'financial'])) {
    parts.push(
      `Financial services: AI use in lending, underwriting, or financial advice is treated as high-risk (Section 9) and is subject to additional supervisory review. Cardholder data is governed by PCI-DSS and may not be entered into AI tools outside the approved cardholder data environment.`
    );
  }
  if (industry === 'legal') {
    parts.push(
      `Legal services: AI-generated legal analysis must be reviewed by a qualified practitioner before being relied upon or shared with clients. Privileged client information must only be entered into AI tools that are covered by appropriate confidentiality terms.`
    );
  }
  if (industry === 'government') {
    parts.push(
      `Public sector: AI use is subject to the agency's procurement and information-handling rules. Tools used to process records about members of the public must satisfy the relevant freedom-of-information and records-retention requirements.`
    );
  }
  if (industry === 'education') {
    parts.push(
      `Education: student data is protected under FERPA (US) and equivalent regimes elsewhere. AI tools may not receive identifiable student information unless covered by an approved data-sharing agreement.`
    );
  }

  if (any(ct, ['eu', 'uk'])) {
    parts.push(
      `GDPR (EU) / UK GDPR: AI processing of personal data must have a lawful basis, respect data-subject rights (access, erasure, portability), and complete a Data Protection Impact Assessment (DPIA) where high-risk processing is involved. Cross-border transfers must use approved transfer mechanisms.`
    );
  }
  if (any(ct, ['ca-state', 'us'])) {
    parts.push(
      `United States — CCPA/CPRA (California): AI processing of California residents' personal information must support deletion, opt-out of sale/sharing, and the right to know. Sector-specific rules (e.g. CPRA, NY SHIELD) may apply additionally.`
    );
  }
  if (has(ct, 'au')) {
    parts.push(
      `Australia: AI use must comply with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs), including notification of personal-information handling and reasonable security safeguards. The voluntary AI Ethics Framework is treated as guidance.`
    );
  }
  if (has(ct, 'ph')) {
    parts.push(
      `Philippines: AI use involving personal information must comply with the Data Privacy Act 2012 (RA 10173) and NPC issuances, including registration of personal information processing systems and breach-notification obligations.`
    );
  }
  if (has(ct, 'sg')) {
    parts.push(
      `Singapore: AI use must comply with the PDPA. Reference is made to the IMDA Model AI Governance Framework as best-practice guidance.`
    );
  }

  if (has(arrAnswer(a, 'frameworks'), 'eu-ai-act') || has(ct, 'eu')) {
    parts.push(
      `EU AI Act: ${company} commits to the AI Act's risk-tiering approach. Prohibited practices (social scoring, untargeted scraping for facial recognition, etc.) are forbidden. High-risk systems (Section 9) follow the documentation, human oversight, and post-market monitoring requirements set out in the Act.`
    );
  }

  return parts.join('\n\n');
}

function trainingBody(a: Answers): string {
  const owner = ownerName(strAnswer(a, 'owner'));
  return (
    (
      {
        mandatory: `All staff who use AI tools at work must complete:\n\n• An AI fundamentals and acceptable-use module within 30 days of joining.\n• An annual refresher covering policy updates, new approved tools, and lessons from any incidents.\n• Role-specific deep-dives for engineering, marketing, customer support, and HR where applicable.\n\nCompletion is tracked and reported to ${owner}.`,
        encouraged: `Training resources are made available to all staff and managers are expected to encourage participation. Topics include acceptable use, prompt hygiene, sensitive-data handling, and recognising AI hallucinations. While not mandatory, staff working with sensitive data are strongly advised to complete the data-handling module.`,
        none: `No formal training program exists at the time of this policy's publication. Staff are expected to read this policy and ask ${owner} when in doubt. Establishing a training program is identified as a near-term priority.`,
      } as Record<string, string>
    )[strAnswer(a, 'training')] ??
    `Staff are expected to read this policy and ask when unsure.`
  );
}

function monitoringBody(a: Answers): string {
  const company = strAnswer(a, 'company') || '[Company]';
  let body = `${company} reserves the right to monitor the use of company-issued AI tools and accounts. Monitoring is proportionate, transparent, and conducted in line with applicable employment and privacy law.\n\nThe following are reviewed on at least a quarterly cadence:\n\n• Usage patterns of approved AI tools.\n• Reports of AI incidents and near-misses.\n• External regulatory developments and industry guidance.\n• The list of approved tools — additions, removals, and version changes.`;
  if (strAnswer(a, 'stance') === 'conservative') {
    body += `\n\nGiven the conservative stance ${company} has adopted, additional controls apply: prompts and outputs in tools handling sensitive data are logged, and access reviews are performed monthly.`;
  }
  return body;
}

function frameworkBody(a: Answers): string {
  const f = arrAnswer(a, 'frameworks');
  if (!f.length || (f.length === 1 && f[0] === 'none')) return '';
  const owner = ownerName(strAnswer(a, 'owner'));
  const company = strAnswer(a, 'company') || '[Company]';
  const parts: string[] = [];
  if (f.includes('iso42001')) {
    parts.push(
      `ISO/IEC 42001 (AI Management System): the controls in this policy are mapped to ISO/IEC 42001 requirements. Annual internal audits are scheduled to support certification.`
    );
  }
  if (f.includes('nist-airmf')) {
    parts.push(
      `NIST AI Risk Management Framework: the four core functions (Govern, Map, Measure, Manage) shape the operating cadence — governance is owned by ${owner}; mapping and measurement happen at tool-approval and quarterly review; managing happens through the incident-response process.`
    );
  }
  if (f.includes('eu-ai-act')) {
    parts.push(
      `EU AI Act: see Sections 9 and 10. ${company} maintains the documentation, human-oversight, and post-market monitoring required for high-risk systems.`
    );
  }
  if (f.includes('soc2')) {
    parts.push(
      `SOC 2: AI tool approvals, access reviews, and incident response are integrated with the existing SOC 2 control program.`
    );
  }
  if (f.includes('iso27001')) {
    parts.push(
      `ISO 27001: AI tools are treated as third-party processors and assessed under the existing supplier risk-management program.`
    );
  }
  return parts.join('\n\n');
}
