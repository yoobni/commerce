interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  note?: string;
  accent?: boolean;
}

export function KpiCard({ title, value, sub, note, accent = false }: KpiCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-[var(--color-border)] p-5 ${
        accent ? 'border-l-4 border-l-[var(--color-brand-accent)]' : ''
      }`}
    >
      <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 uppercase tracking-wide">
        {title}
      </p>
      <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">{value}</p>
      {sub && (
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1.5">{sub}</p>
      )}
      {note && (
        <p className="text-xs text-[var(--color-text-secondary)] mt-2 pt-2 border-t border-[var(--color-border-subtle)]">
          {note}
        </p>
      )}
    </div>
  );
}
