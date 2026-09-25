import { useBraillePattern } from "../../hooks/useBraillePattern";
import { DOT_RENDER_ORDER } from "../../utils/braille";

export function BrailleCell({ pattern, label, size = "md" }: { pattern: string; label?: string; size?: "sm" | "md" | "lg" }) {
  const { dots } = useBraillePattern(pattern);
  return (
    <div className={`braille-wrap ${size}`}>
      <div className="braille-cell" role="img" aria-label={label ? `点字 ${label}` : "点字"}>
        {DOT_RENDER_ORDER.map((dotIndex) => (
          <span key={dotIndex} className={dots[dotIndex] ? "dot on" : "dot"} />
        ))}
      </div>
      {label ? <span className="braille-label">{label}</span> : null}
    </div>
  );
}
