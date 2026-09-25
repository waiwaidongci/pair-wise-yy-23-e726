import type { ReactNode } from "react";

export interface ChartBar {
  label: string;
  /** 0-1 */
  value: number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
}

interface ChartPanelProps {
  title: string;
  bars: ChartBar[];
  footer?: ReactNode;
}

/** 轻量条形图面板：进度页正确率趋势 / 难度分布共用，避免引入重型图表依赖 */
export function ChartPanel({ title, bars, footer }: ChartPanelProps) {
  return (
    <div className="panel chart-panel">
      <h2>{title}</h2>
      {bars.length === 0 ? (
        <p className="muted">完成一次练习后这里会出现数据。</p>
      ) : (
        <ul className="chart-bars">
          {bars.map((bar, i) => (
            <li key={`${bar.label}-${i}`} className="chart-row">
              <span className="chart-label">{bar.label}</span>
              <span className="chart-track">
                <span
                  className={`chart-fill chart-${bar.tone ?? "default"}`}
                  style={{ width: `${Math.round(bar.value * 100)}%` }}
                />
              </span>
              <span className="chart-value">{bar.hint ?? `${Math.round(bar.value * 100)}%`}</span>
            </li>
          ))}
        </ul>
      )}
      {footer ? <div className="chart-footer">{footer}</div> : null}
    </div>
  );
}
