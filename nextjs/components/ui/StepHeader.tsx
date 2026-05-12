interface StepHeaderProps {
  section: string;
  title: string;
  help?: string;
}

export function StepHeader({ section, title, help }: StepHeaderProps) {
  return (
    <>
      <span className="mb-3 inline-block text-[11px] font-bold uppercase tracking-widest text-cs-primary">
        {section}
      </span>
      <h2 className="m-0 mb-2 text-2xl font-bold leading-tight text-cs-ink">{title}</h2>
      {help && <p className="m-0 mb-7 text-[15px] leading-relaxed text-cs-muted">{help}</p>}
    </>
  );
}
