export interface ChartItem {
  label: string;
  percent: number;
  detail?: string;
}

export function ChartPanel({ title, items }: { title: string; items: ChartItem[] }) {
  return (
    <div className="panel chart-panel">
      <h2>{title}</h2>
      {items.map((item) => (
        <div className="chart-row" key={item.label}>
          <span className="chart-label">{item.label}</span>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, item.percent))}%` }} />
          </div>
          <span className="chart-value">{item.detail ?? `${Math.round(item.percent)}%`}</span>
        </div>
      ))}
    </div>
  );
}
