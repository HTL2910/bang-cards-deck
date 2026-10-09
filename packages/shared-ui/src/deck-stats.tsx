export type DeckStat = {
  label: string;
  value: number;
};

export function DeckStats({ stats }: { stats: readonly DeckStat[] }) {
  return (
    <dl className="bang-deck-stats">
      {stats.map(({ label, value }) => (
        <div key={label} aria-label={`${label}: ${value}`}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
