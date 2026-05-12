import type { Answers, SegmentedStepDef } from '@/lib/types';
import { NavFooter } from '../ui/NavFooter';
import { StepHeader } from '../ui/StepHeader';

interface SegmentedStepProps {
  step: SegmentedStepDef;
  answers: Answers;
  setAnswer: (id: string, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function SegmentedStep({ step, answers, setAnswer, onBack, onNext }: SegmentedStepProps) {
  const selected = answers[step.id] as string | undefined;
  return (
    <>
      <StepHeader
        section={step.section}
        title={step.title ?? ''}
        help={step.help}
      />

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {step.options.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAnswer(step.id, opt.value)}
              className={`rounded-cs-sm border-[1.5px] px-4 py-[18px] text-center transition ${
                isActive
                  ? 'border-cs-primary bg-[#EBF2FF] shadow-[0_0_0_3px_rgba(11,95,255,0.12)]'
                  : 'border-cs-border bg-white hover:border-cs-primary hover:bg-[#F5F9FF]'
              }`}
            >
              <div className="text-[15px] font-semibold text-cs-ink">{opt.title}</div>
              {opt.desc && <div className="mt-1 text-xs text-cs-muted">{opt.desc}</div>}
            </button>
          );
        })}
      </div>

      <NavFooter onBack={onBack} onNext={onNext} />
    </>
  );
}
