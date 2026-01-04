type ChartDatum = { label: string; value: number };

export function StatusChart({
  data,
  title = "Status Overview",
  heightClass = "h-52",
}: {
  data: ChartDatum[];
  title?: string;
  heightClass?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="rounded-xl border border-border bg-card/70 backdrop-blur p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">Bar chart</p>
      </div>
      <div className={`flex items-end gap-3 ${heightClass}`}>
        {data.map((d) => (
          <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
            <div
              className="w-full rounded-lg bg-primary/20 border border-primary/30 transition-all"
              style={{ height: `${(d.value / max) * 100}%` }}
              title={`${d.label}: ${d.value}`}
            />
            <span className="text-[11px] text-muted-foreground text-center">{d.label}</span>
            <span className="text-xs font-semibold text-foreground">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
