import type { Answers, CardsStepDef } from '@/lib/types';
import { NavFooter } from '../ui/NavFooter';
import { StepHeader } from '../ui/StepHeader';

interface CardsStepProps {
  step: CardsStepDef;
  answers: Answers;
  setAnswer: (id: string, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function CardsStep({ step, answers, setAnswer, onBack, onNext }: CardsStepProps) {
  const selected = answers[step.id] as string | undefined;
  const twoCol = step.layout === 'two-col';

  return (
    <>
      <StepHeader
        section={step.section}
        title={step.title ?? ''}
        help={step.help}
      />

      <div className={`grid gap-2.5 ${twoCol ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {step.options.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAnswer(step.id, opt.value)}
              className={`group rounded-cs-sm border-[1.5px] px-4 py-4 text-left transition ${
                isActive
                  ? 'border-cs-primary bg-[#EBF2FF] shadow-[0_0_0_3px_rgba(11,95,255,0.12)]'
                  : 'border-cs-border bg-white hover:-translate-y-px hover:border-cs-primary hover:bg-[#F5F9FF]'
              }`}
            >
              <div className="text-[15px] font-semibold text-cs-ink">{opt.title}</div>
              {opt.desc && (
                <div className="mt-1 text-[13px] leading-relaxed text-cs-muted">{opt.desc}</div>
              )}
            </button>
          );
        })}
      </div>

      <NavFooter onBack={onBack} onNext={onNext} />
    </>
  );
}
