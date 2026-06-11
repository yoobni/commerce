// Shared layout primitives used inside individual legal pages.
// Keeps the visual rhythm consistent: title block, last-updated stamp,
// section headings, body paragraphs.

interface LegalHeaderProps {
  title: string;
  lastUpdated: string;
  summary?: string;
}

export function LegalHeader({ title, lastUpdated, summary }: LegalHeaderProps) {
  return (
    <header className="mb-10 pb-6 border-b border-[var(--mz-line)]">
      <h1 className="font-serif text-[28px] md:text-[34px] font-[500] leading-[1.15] tracking-[-0.02em] text-[var(--mz-ink)] mb-3">
        {title}
      </h1>
      <p className="text-[12px] text-[var(--mz-ink-mute)]">최종 수정일: {lastUpdated}</p>
      {summary && (
        <p className="mt-4 text-[14px] leading-[1.7] text-[var(--mz-ink-soft)]">{summary}</p>
      )}
    </header>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-[16px] font-[600] text-[var(--mz-ink)] mb-3">{title}</h2>
      <div className="space-y-3 text-[14px] leading-[1.75] text-[var(--mz-ink-soft)]">
        {children}
      </div>
    </section>
  );
}

export function DefinitionList({
  items,
}: {
  items: Array<{ term: string; value: string }>;
}) {
  return (
    <dl className="grid grid-cols-[140px_1fr] gap-y-3 text-[14px] leading-[1.7]">
      {items.map((it) => (
        <div key={it.term} className="contents">
          <dt className="text-[var(--mz-ink-mute)]">{it.term}</dt>
          <dd className="text-[var(--mz-ink)]">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
