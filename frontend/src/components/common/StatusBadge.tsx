import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "success" | "danger" | "warning" | "info";

interface StatusBadgeProps {
  value?: string;
  tone?: BadgeTone;
  children?: ReactNode;
}

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: "badge",
  success: "badge badge-success",
  danger: "badge badge-danger",
  warning: "badge badge-warning",
  info: "badge badge-info"
};

export function StatusBadge({ value, tone = "neutral", children }: StatusBadgeProps) {
  return <span className={TONE_CLASS[tone]}>{children ?? value ?? ""}</span>;
}
