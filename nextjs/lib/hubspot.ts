import type { Answers } from './types';

/**
 * HubSpot Forms API submission.
 *
 * No private API key is needed — Portal ID + Form GUID are public by
 * design (same info HubSpot's official "embed this form" snippet
 * exposes). Spam protection is configured on the HubSpot form itself
 * (allowed domains, reCAPTCHA, etc.).
 *
 * Setup:
 *   1. In HubSpot → Marketing → Forms, create a "Non-HubSpot Form" with
 *      the field names listed in `mapAnswersToHubspot` below. Match the
 *      `name` attribute of each field exactly.
 *   2. Open the form's "Share" tab → copy the Portal ID + Form GUID.
 *   3. Set NEXT_PUBLIC_HUBSPOT_PORTAL_ID and NEXT_PUBLIC_HUBSPOT_FORM_GUID
 *      in `.env.local`.
 *   4. Deploy. Submissions land in HubSpot as new contact records.
 *
 * Until the env vars are populated, this function logs the payload to
 * the browser console as a no-op, so the wizard's "Done" step still
 * works during development.
 */
export interface HubspotSubmitResult {
  ok: boolean;
  status: number;
  body?: unknown;
  skippedReason?: string;
}

export async function submitToHubspot(answers: Answers): Promise<HubspotSubmitResult> {
  const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;
  const formGuid = process.env.NEXT_PUBLIC_HUBSPOT_FORM_GUID;

  if (!portalId || !formGuid) {
    // eslint-disable-next-line no-console
    console.info(
      '[HubSpot stub] No NEXT_PUBLIC_HUBSPOT_PORTAL_ID / _FORM_GUID set. Payload would be:',
      mapAnswersToHubspot(answers)
    );
    return { ok: false, status: 0, skippedReason: 'env-vars-missing' };
  }

  const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;
  const payload = {
    fields: Object.entries(mapAnswersToHubspot(answers))
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([name, value]) => ({
        objectTypeId: '0-1', // 0-1 = contact
        name,
        value: Array.isArray(value) ? value.join(';') : String(value),
      })),
    context: {
      pageUri: typeof window !== 'undefined' ? window.location.href : '',
      pageName: 'AI Policy Builder',
    },
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      skippedReason: err instanceof Error ? err.message : 'fetch-failed',
    };
  }
}

/**
 * Maps the wizard's `Answers` shape to the HubSpot form's expected
 * field names. Adjust the right-hand sides to match the field
 * `name` attributes you configure in HubSpot.
 */
function mapAnswersToHubspot(answers: Answers): Record<string, string | string[] | undefined> {
  return {
    // Core contact fields — HubSpot recognises these natively.
    firstname: firstName(answers.name as string | undefined),
    lastname: lastName(answers.name as string | undefined),
    email: answers.email as string | undefined,
    company: answers.company as string | undefined,
    phone: answers.phone as string | undefined,

    // Custom properties — create matching properties in HubSpot.
    ai_policy_industry: answers.industry as string | undefined,
    ai_policy_headcount: answers.headcount as string | undefined,
    ai_policy_countries: answers.countries as string[] | undefined,
    ai_policy_customer_type: answers.customerType as string | undefined,
    ai_policy_sensitive_data: answers.sensitiveData as string[] | undefined,
    ai_policy_existing_policy: answers.existingPolicy as string | undefined,
    ai_policy_current_tools: answers.currentTools as string[] | undefined,
    ai_policy_who_uses_ai: answers.whoUsesAI as string[] | undefined,
    ai_policy_shadow_it: answers.shadowIT as string | undefined,
    ai_policy_use_cases: answers.useCases as string[] | undefined,
    ai_policy_customer_facing: answers.customerFacing as string | undefined,
    ai_policy_high_stakes: answers.highStakes as string | undefined,
    ai_policy_sensitive_data_input: answers.sensitiveDataInput as string | undefined,
    ai_policy_stance: answers.stance as string | undefined,
    ai_policy_approval_process: answers.approvalProcess as string | undefined,
    ai_policy_personal_accounts: answers.personalAccounts as string | undefined,
    ai_policy_owner: answers.owner as string | undefined,
    ai_policy_training: answers.training as string | undefined,
    ai_policy_frameworks: answers.frameworks as string[] | undefined,
    ai_policy_consult_team: answers.consultType as string | undefined,

    // Free-text from the optional Specifics step.
    ai_policy_prohibitions: answers.prohibitions as string | undefined,
    ai_policy_enabled_items: answers.enabledItems as string | undefined,
  };
}

function firstName(full: string | undefined): string | undefined {
  if (!full) return undefined;
  return full.trim().split(/\s+/)[0];
}
function lastName(full: string | undefined): string | undefined {
  if (!full) return undefined;
  const parts = full.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(' ') : '';
}
