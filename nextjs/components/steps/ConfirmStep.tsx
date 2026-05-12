import type { Answers } from '@/lib/types';
import { NavFooter } from '../ui/NavFooter';
import { StepHeader } from '../ui/StepHeader';

interface ConfirmStepProps {
  answers: Answers;
  setAnswer: (id: string, value: string) => void;
  onBack: () => void;
  onNext: () => void;
  onEditEmail: () => void;
}

const CONSULT_OPTIONS = [
  {
    value: 'policy',
    title: 'AI Policy Team',
    desc: 'Walk through the generated policy, refine it, plan rollout',
  },
  {
    value: 'dev',
    title: 'AI Development Team',
    desc: 'Discuss building AI agents or integrating AI into your products',
  },
  { value: 'skip', title: 'No thanks', desc: 'Just send me the policy' },
];

export function ConfirmStep({
  answers,
  setAnswer,
  onBack,
  onNext,
  onEditEmail,
}: ConfirmStepProps) {
  const email = (answers.email as string | undefined) ?? '';
  const phone = (answers.phone as string | undefined) ?? '';
  const consultType = answers.consultType as string | undefined;

  return (
    <>
      <StepHeader
        section="Almost done"
        title="Confirm and book your follow-up"
        help="Quick check before we generate your policy and email it to you."
      />

      <div className="mb-[18px] flex items-center justify-between gap-3 rounded-cs-sm border border-[#C7DAFF] bg-[#EBF2FF] px-4 py-3.5 text-sm">
        <div>
          We’ll email your policy to{' '}
          <span className="break-all font-semibold text-cs-ink">{email}</span>
        </div>
        <button
          type="button"
          onClick={onEditEmail}
          className="border-0 bg-transparent text-sm font-semibold text-cs-primary"
        >
          Edit
        </button>
      </div>

      <div className="mb-[18px]">
        <label htmlFor="phone" className="mb-1.5 block text-[13px] font-semibold text-cs-ink">
          Direct phone number
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          placeholder="+61 4XX XXX XXX"
          onChange={(e) => setAnswer('phone', e.target.value)}
          className="block w-full rounded-cs-sm border-[1.5px] border-cs-border bg-white px-3.5 py-3 text-[15px] text-cs-text outline-none transition focus:border-cs-primary focus:shadow-[0_0_0_3px_rgba(11,95,255,0.12)]"
        />
      </div>

      <div className="mb-[18px]">
        <label className="mb-1.5 block text-[13px] font-semibold text-cs-ink">
          Would you like a 30-minute review with one of our teams?
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {CONSULT_OPTIONS.map((opt) => {
            const isActive = consultType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAnswer('consultType', opt.value)}
                className={`rounded-cs-sm border-[1.5px] px-4 py-4 text-left transition ${
                  isActive
                    ? 'border-cs-primary bg-[#EBF2FF] shadow-[0_0_0_3px_rgba(11,95,255,0.12)]'
                    : 'border-cs-border bg-white hover:border-cs-primary hover:bg-[#F5F9FF]'
                }`}
              >
                <div className="text-[15px] font-semibold text-cs-ink">{opt.title}</div>
                <div className="mt-1 text-[13px] leading-relaxed text-cs-muted">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <NavFooter onBack={onBack} onNext={onNext} nextLabel="Generate my policy" />
    </>
  );
}
