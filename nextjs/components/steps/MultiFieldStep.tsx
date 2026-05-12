import type { Answers, MultiStepDef } from '@/lib/types';
import { NavFooter } from '../ui/NavFooter';
import { StepHeader } from '../ui/StepHeader';

interface MultiFieldStepProps {
  step: MultiStepDef;
  answers: Answers;
  setAnswer: (id: string, value: string) => void;
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
}

export function MultiFieldStep({
  step,
  answers,
  setAnswer,
  onBack,
  onNext,
  canGoBack,
}: MultiFieldStepProps) {
  return (
    <>
      <StepHeader
        section={step.section}
        title={step.title ?? ''}
        help={step.help}
      />

      {step.fields.map((f) => {
        const value = (answers[f.id] as string | undefined) ?? '';
        return (
          <div key={f.id} className="mb-[18px]">
            <label
              htmlFor={f.id}
              className="mb-1.5 block text-[13px] font-semibold text-cs-ink"
            >
              {f.label}
              {!f.required && (
                <span className="ml-1 font-normal text-cs-muted">(optional)</span>
              )}
            </label>
            {f.type === 'textarea' ? (
              <textarea
                id={f.id}
                placeholder={f.placeholder}
                value={value}
                onChange={(e) => setAnswer(f.id, e.target.value)}
                className="block min-h-[90px] w-full resize-y rounded-cs-sm border-[1.5px] border-cs-border bg-white px-3.5 py-3 text-[15px] text-cs-text outline-none transition focus:border-cs-primary focus:shadow-[0_0_0_3px_rgba(11,95,255,0.12)]"
              />
            ) : (
              <input
                id={f.id}
                type={f.type}
                placeholder={f.placeholder}
                value={value}
                onChange={(e) => setAnswer(f.id, e.target.value)}
                className="block w-full rounded-cs-sm border-[1.5px] border-cs-border bg-white px-3.5 py-3 text-[15px] text-cs-text outline-none transition focus:border-cs-primary focus:shadow-[0_0_0_3px_rgba(11,95,255,0.12)]"
              />
            )}
          </div>
        );
      })}

      <NavFooter onBack={onBack} onNext={onNext} canGoBack={canGoBack} />
    </>
  );
}
