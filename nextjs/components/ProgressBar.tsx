interface ProgressBarProps {
  section: string;
  stepIndex: number;
  totalSteps: number;
}

export function ProgressBar({ section, stepIndex, totalSteps }: ProgressBarProps) {
  const pct = Math.round((stepIndex / Math.max(totalSteps - 1, 1)) * 100);
  return (
    <div className="mb-4 rounded-cs border border-cs-border bg-white px-6 py-4 shadow-cs">
      <div className="mb-2.5 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-cs-muted">
          {section}
        </span>
        <span className="text-[13px] font-medium text-cs-text">
          Step {stepIndex + 1} of {totalSteps}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-cs-border">
        <div
          className="h-full bg-gradient-to-r from-cs-primary to-cs-accent transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
