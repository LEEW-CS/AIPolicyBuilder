'use client';

import { useMemo, useState } from 'react';
import type { Answers } from '@/lib/types';
import { buildPolicySections } from '@/lib/policy/builder';

interface DoneStepProps {
  answers: Answers;
}

/**
 * Final step. Generates the policy preview synchronously from the
 * answers, and lazy-loads the PDF / DOCX libraries on demand so the
 * initial bundle stays small.
 */
export function DoneStep({ answers }: DoneStepProps) {
  const [downloading, setDownloading] = useState<'pdf' | 'docx' | null>(null);
  const sections = useMemo(() => buildPolicySections(answers), [answers]);
  const firstName = ((answers.name as string | undefined) ?? '').split(' ')[0] || 'there';
  const email = (answers.email as string | undefined) ?? '';
  const consult = answers.consultType as string | undefined;

  async function handlePdf() {
    setDownloading('pdf');
    try {
      const { downloadPDF } = await import('@/lib/exporters/pdf');
      downloadPDF(answers);
    } finally {
      setDownloading(null);
    }
  }

  async function handleDocx() {
    setDownloading('docx');
    try {
      const { downloadDOCX } = await import('@/lib/exporters/docx');
      await downloadDOCX(answers);
    } finally {
      setDownloading(null);
    }
  }

  const calendlyUrl =
    consult === 'policy'
      ? process.env.NEXT_PUBLIC_CALENDLY_POLICY_URL ||
        'https://calendly.com/cloudstaff-ai-policy/30min'
      : consult === 'dev'
        ? process.env.NEXT_PUBLIC_CALENDLY_DEV_URL ||
          'https://calendly.com/cloudstaff-ai-dev/30min'
        : null;

  return (
    <>
      <div className="mb-7 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7] text-3xl font-bold text-cs-success">
          ✓
        </div>
        <h2 className="m-0 mb-2 text-[26px] font-bold text-cs-ink">
          Your AI policy is ready, {firstName}.
        </h2>
        <p className="m-0 text-cs-muted">We’ve also emailed a copy to {email}.</p>
      </div>

      <div className="my-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handlePdf}
          disabled={downloading === 'pdf'}
          className="rounded-cs-sm border-[1.5px] border-cs-primary bg-white py-4 text-[15px] font-semibold text-cs-primary transition hover:bg-cs-primary hover:text-white disabled:opacity-60"
        >
          {downloading === 'pdf' ? 'Building PDF…' : '↓ Download PDF'}
          <small className="mt-1 block text-xs font-medium opacity-80">For sharing & printing</small>
        </button>
        <button
          type="button"
          onClick={handleDocx}
          disabled={downloading === 'docx'}
          className="rounded-cs-sm border-[1.5px] border-cs-primary bg-white py-4 text-[15px] font-semibold text-cs-primary transition hover:bg-cs-primary hover:text-white disabled:opacity-60"
        >
          {downloading === 'docx' ? 'Building Word…' : '↓ Download Word (.docx)'}
          <small className="mt-1 block text-xs font-medium opacity-80">
            Editable in Microsoft Word
          </small>
        </button>
      </div>

      <div className="my-6 max-h-[400px] overflow-y-auto rounded-cs-sm border border-cs-border bg-[#FAFBFD] px-7 py-6 text-[13px] leading-relaxed text-cs-text">
        {sections.map((s, i) => (
          <div key={i}>
            <h3 className="mb-1.5 mt-4 text-sm font-bold text-cs-ink first:mt-0">{s.heading}</h3>
            {s.body.split('\n\n').map((p, j) => (
              <p key={j} className="mb-2.5">
                {p}
              </p>
            ))}
          </div>
        ))}
      </div>

      {calendlyUrl && (
        <div className="mt-5 rounded-cs-sm bg-gradient-to-br from-cs-primary to-cs-accent px-7 py-6 text-center text-white">
          <h3 className="m-0 mb-1.5 text-lg">
            Book your 30-min session with the{' '}
            {consult === 'policy' ? 'AI Policy Team' : 'AI Development Team'}
          </h3>
          <p className="m-0 mb-4 text-sm opacity-90">Pick a slot that works for you.</p>
          <button
            type="button"
            onClick={() => window.open(calendlyUrl, '_blank')}
            className="cursor-pointer rounded-cs-sm border-0 bg-white px-5 py-3 text-sm font-semibold text-cs-primary"
          >
            Open Calendly
          </button>
          {/* Developers: replace this with the official Calendly inline-embed
              widget (https://assets.calendly.com/assets/external/widget.js)
              for a nicer in-page booking flow. */}
        </div>
      )}
    </>
  );
}
