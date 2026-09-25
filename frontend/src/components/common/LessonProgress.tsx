export function LessonProgress({ title, percent, detail }: { title: string; percent: number; detail?: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="lesson-progress">
      <div className="lesson-progress-head">
        <strong>{title}</strong>
        <span>{clamped}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${clamped}%` }} />
      </div>
      {detail ? <p className="lesson-progress-detail">{detail}</p> : null}
    </div>
  );
}
