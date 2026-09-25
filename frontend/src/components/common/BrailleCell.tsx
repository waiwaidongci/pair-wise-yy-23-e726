import { BRAILLE_DOT_LAYOUT } from "../../hooks/useBraillePattern";

interface BrailleCellProps {
  /** 凸起的点位编号 1-6 */
  pattern?: number[];
  /** 可点选模式（看字点符题） */
  interactive?: boolean;
  selected?: number[];
  onToggleDot?: (dot: number) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

/**
 * 6 点制盲文点符：
 *  1 4
 *  2 5
 *  3 6
 */
export function BrailleCell({
  pattern = [],
  interactive = false,
  selected = [],
  onToggleDot,
  size = "md",
  disabled = false
}: BrailleCellProps) {
  const activeDots = interactive ? selected : pattern;
  return (
    <div className={`braille-cell braille-cell-${size}`} role="img" aria-label={`盲文点位 ${pattern.join("·") || "空方"}`}>
      {BRAILLE_DOT_LAYOUT.map((dot) => {
        const raised = activeDots.includes(dot);
        return (
          <button
            type="button"
            key={dot}
            className={raised ? "dot raised" : "dot"}
            disabled={!interactive || disabled}
            aria-pressed={raised}
            aria-label={`${dot} 点`}
            onClick={() => onToggleDot?.(dot)}
          >
            <span className="dot-number">{dot}</span>
          </button>
        );
      })}
    </div>
  );
}
