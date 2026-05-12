interface NavFooterProps {
  onBack: () => void;
  onNext: () => void;
  canGoBack?: boolean;
  nextLabel?: string;
}

/**
 * Footer used at the bottom of every interior step. Renders a "Back"
 * ghost button on the left (hidden if `canGoBack` is false) and the
 * primary "Continue" button on the right.
 */
export function NavFooter({ onBack, onNext, canGoBack = true, nextLabel }: NavFooterProps) {
  return (
    <div className="mt-7 flex items-center justify-between border-t border-cs-border pt-6">
      <button
        type="button"
        onClick={onBack}
        style={{ visibility: canGoBack ? 'visible' : 'hidden' }}
        className="rounded-cs-sm border-[1.5px] border-cs-border bg-transparent px-5 py-3 text-[15px] font-semibold text-cs-muted transition hover:border-cs-border-strong hover:text-cs-text"
      >
        ← Back
      </button>
      <button
        type="button"
        onClick={onNext}
        className="rounded-cs-sm bg-cs-primary px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-cs-primary-dark"
      >
        {nextLabel ?? 'Continue →'}
      </button>
    </div>
  );
}
