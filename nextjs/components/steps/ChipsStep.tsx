import type { Answers, ChipsStepDef } from '@/lib/types';
import { NavFooter } from '../ui/NavFooter';
import { StepHeader } from '../ui/StepHeader';

interface ChipsStepProps {
  step: ChipsStepDef;
  answers: Answers;
  setAnswer: (id: string, value: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export function ChipsStep({ step, answers, setAnswer, onBack, onNext }: ChipsStepProps) {
  const selected = (answers[step.id] as string[] | undefined) ?? [];

  function toggle(value: string) {
    let next: string[];
    if (value === 'none') {
      // "none" is exclusive: clicking it toggles its presence and clears everything else.
      next = selected.includes('none') ? [] : ['none'];
    } else {
      const without = selected.filter((v) => v !== 'none');
      next = without.includes(value) ? without.filter((v) => v !== value) : [...without, value];
    }
    setAnswer(step.id, next);
  }

  return (
    <>
      <StepHeader
        section={step.section}
        title={step.title ?? ''}
        help={step.help}
      />

      <div className="flex flex-wrap gap-2">
        {step.options.map((opt) => {
          const isActive = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`rounded-full border-[1.5px] px-4 py-2 text-sm transition ${
                isActive
                  ? 'border-cs-primary bg-cs-primary text-white'
                  : 'border-cs-border bg-white text-cs-text hover:border-cs-primary'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <p className="mt-3.5 text-[13px] text-cs-muted">
        {selected.length ? `${selected.length} selected` : 'Click to select'}
      </p>

      <NavFooter onBack={onBack} onNext={onNext} />
    </>
  );
}
