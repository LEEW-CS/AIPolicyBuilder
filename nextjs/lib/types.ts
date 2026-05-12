/**
 * Shared types for the wizard.
 *
 * `Answers` is intentionally a flat record keyed by question id — the
 * branching engine and the policy builder both read from this single
 * object, so adding a question is a one-place change in `lib/questions.ts`.
 */

export type AnswerValue = string | string[] | undefined;
export type Answers = Record<string, AnswerValue>;

// ──────────────────────────────────────────────────────────────
// Question schema types
// ──────────────────────────────────────────────────────────────

export type StepType =
  | 'welcome'
  | 'multi'
  | 'cards'
  | 'chips'
  | 'segmented'
  | 'confirm'
  | 'done';

export interface FieldDef {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  required?: boolean;
  placeholder?: string;
}

export interface OptionCard {
  value: string;
  title: string;
  desc?: string;
}

export interface OptionChip {
  value: string;
  label: string;
}

export interface OptionSegment {
  value: string;
  title: string;
  desc?: string;
}

interface BaseStep {
  id: string;
  section: string;
  type: StepType;
  title?: string;
  help?: string;
  optional?: boolean;
  /**
   * Branching predicate. When supplied and returning false against the
   * current answers, the step is skipped.
   */
  condition?: (answers: Answers) => boolean;
}

export interface WelcomeStepDef extends BaseStep {
  type: 'welcome';
}

export interface MultiStepDef extends BaseStep {
  type: 'multi';
  fields: FieldDef[];
}

export interface CardsStepDef extends BaseStep {
  type: 'cards';
  options: OptionCard[];
  layout?: 'two-col';
}

export interface ChipsStepDef extends BaseStep {
  type: 'chips';
  options: OptionChip[];
}

export interface SegmentedStepDef extends BaseStep {
  type: 'segmented';
  options: OptionSegment[];
}

export interface ConfirmStepDef extends BaseStep {
  type: 'confirm';
}

export interface DoneStepDef extends BaseStep {
  type: 'done';
}

export type StepDef =
  | WelcomeStepDef
  | MultiStepDef
  | CardsStepDef
  | ChipsStepDef
  | SegmentedStepDef
  | ConfirmStepDef
  | DoneStepDef;

// ──────────────────────────────────────────────────────────────
// Policy output
// ──────────────────────────────────────────────────────────────

export interface PolicySection {
  heading: string;
  body: string;
}
