import { StatusBadge } from "./StatusBadge";
import { formatPercent } from "../../utils/formatters";

interface LessonProgressProps {
  title: string;
  /** 0-1 */
  value: number;
  passed?: boolean;
  detail?: string;
}

/** 课程完成进度条：学习页与进度页共用 */
export function LessonProgress({ title, value, passed = false, detail }: LessonProgressProps) {
  const percent = Math.round(value * 100);
  return (
    <div className="lesson-progress">
      <div className="lesson-progress-head">
        <strong>{title}</strong>
        <StatusBadge tone={passed ? "success" : "warning"}>{passed ? "已达标" : "未达标"}</StatusBadge>
      </div>
      <div className="progress-track">
        <div className={passed ? "progress-fill passed" : "progress-fill"} style={{ width: `${percent}%` }} />
      </div>
      <span className="lesson-progress-meta">{detail ?? formatPercent(percent)}</span>
    </div>
  );
}
