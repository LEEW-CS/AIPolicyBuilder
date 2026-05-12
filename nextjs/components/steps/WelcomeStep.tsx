interface WelcomeStepProps {
  onStart: () => void;
}

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <div className="px-5 py-10 text-center">
      <div className="text-[12px] font-bold uppercase tracking-widest text-cs-primary">
        Free tool · 5 minutes
      </div>
      <h1 className="my-4 text-[36px] font-extrabold leading-tight text-cs-ink">
        Build your AI policy in minutes.
      </h1>
      <p className="mx-auto mb-7 max-w-[540px] text-base leading-relaxed text-cs-muted">
        Answer a series of questions and download a PDF + editable Word document tailored to your
        business — covering acceptable use, data handling, governance, and compliance.
      </p>

      <div className="my-7 flex flex-wrap justify-center gap-7">
        <Meta n={1}>22 questions, mostly point-and-click</Meta>
        <Meta n={2}>PDF + Word download</Meta>
        <Meta n={3}>Optional: 30-min review with our team</Meta>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="rounded-cs-sm bg-cs-primary px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-cs-primary-dark"
      >
        Get started →
      </button>
    </div>
  );
}

function Meta({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm text-cs-muted">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#EBF2FF] text-[14px] font-bold text-cs-primary">
        {n}
      </span>
      <span>{children}</span>
    </div>
  );
}
