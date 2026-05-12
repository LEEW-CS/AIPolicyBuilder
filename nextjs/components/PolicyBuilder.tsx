'use client';

import { useMemo, useState } from 'react';
import { STEPS } from '@/lib/questions';
import type { Answers, StepDef } from '@/lib/types';
import { ProgressBar } from './ProgressBar';
import { WelcomeStep } from './steps/WelcomeStep';
import { MultiFieldStep } from './steps/MultiFieldStep';
import { CardsStep } from './steps/CardsStep';
import { ChipsStep } from './steps/ChipsStep';
import { SegmentedStep } from './steps/SegmentedStep';
import { ConfirmStep } from './steps/ConfirmStep';
import { DoneStep } from './steps/DoneStep';
import { submitToHubspot } from '@/lib/hubspot';

/**
 * Main wizard container.
 *
 * State shape kept deliberately flat: `step` is an index into the
 * derived `visibleSteps` array, `answers` is a single `Record<string,
 * string | string[]>`. The branching engine is just an `Array.filter`
 * over `STEPS` checking each step's optional `condition` predicate.
 *
 * Validation lives in `validateStep` — each step type has its own
 * required-field rules.
 */
export function PolicyBuilder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const visibleSteps = useMemo<StepDef[]>(
    () => STEPS.filter((s) => !s.condition || s.condition(answers)),
    [answers]
  );

  const current = visibleSteps[step] ?? visibleSteps[visibleSteps.length - 1];

  function setAnswer(key: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function goNext() {
    const error = validateStep(current, answers);
    if (error) {
      // Surface validation errors via a simple alert for now — replace
      // with inline error UI when the design calls for it.
      alert(error);
      return;
    }
    // Fire HubSpot lead capture when moving past the Confirm step.
    if (visibleSteps[step + 1]?.type === 'done') {
      // Fire-and-forget; we don't block the user on it.
      void submitToHubspot(answers);
    }
    if (step < visibleSteps.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function goBack() {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function jumpToStepById(id: string) {
    const idx = visibleSteps.findIndex((s) => s.id === id);
    if (idx >= 0) setStep(idx);
  }

  const showProgress = current.type !== 'welcome' && current.type !== 'done';

  return (
    <div className="mx-auto mb-16 mt-8 max-w-[880px] px-4">
      {showProgress && (
        <ProgressBar
          section={current.section}
          stepIndex={step}
          totalSteps={visibleSteps.length}
        />
      )}

      <div className="rounded-cs border border-cs-border bg-white px-10 py-9 shadow-cs sm:px-5 sm:py-6">
        {current.type === 'welcome' && <WelcomeStep onStart={goNext} />}
        {current.type === 'multi' && (
          <MultiFieldStep
            step={current}
            answers={answers}
            setAnswer={setAnswer}
            onBack={goBack}
            onNext={goNext}
            canGoBack={step > 0}
          />
        )}
        {current.type === 'cards' && (
          <CardsStep
            step={current}
            answers={answers}
            setAnswer={setAnswer}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {current.type === 'chips' && (
          <ChipsStep
            step={current}
            answers={answers}
            setAnswer={setAnswer}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {current.type === 'segmented' && (
          <SegmentedStep
            step={current}
            answers={answers}
            setAnswer={setAnswer}
            onBack={goBack}
            onNext={goNext}
          />
        )}
        {current.type === 'confirm' && (
          <ConfirmStep
            answers={answers}
            setAnswer={setAnswer}
            onBack={goBack}
            onNext={goNext}
            onEditEmail={() => jumpToStepById('_intake')}
          />
        )}
        {current.type === 'done' && <DoneStep answers={answers} />}
      </div>
    </div>
  );
}

/**
 * Returns an error string if the step is invalid, otherwise null.
 */
function validateStep(step: StepDef, answers: Answers): string | null {
  if (step.type === 'multi') {
    for (const f of step.fields) {
      const v = answers[f.id];
      if (f.required && (!v || (typeof v === 'string' && !v.trim()))) {
        return `Please fill in: ${f.label}`;
      }
      if (f.type === 'email' && typeof v === 'string' && v && !/.+@.+\..+/.test(v)) {
        return 'Please enter a valid email address.';
      }
    }
    return null;
  }
  if (step.type === 'cards' || step.type === 'segmented') {
    if (step.optional) return null;
    if (!answers[step.id]) return 'Please pick an option.';
    return null;
  }
  if (step.type === 'chips') {
    if (step.optional) return null;
    const v = answers[step.id];
    if (!Array.isArray(v) || !v.length) return 'Please pick at least one option.';
    return null;
  }
  if (step.type === 'confirm') {
    if (!answers.phone) return 'Please enter your phone number.';
    if (!answers.consultType) {
      return 'Please pick a follow-up option (or "No thanks").';
    }
    return null;
  }
  return null;
}
