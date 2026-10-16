import type { CSSProperties } from "react";

interface ProgressBarProps {
  /** Countdown mode: ms until auto-close; the bar drains over this time. */
  duration?: number;
  /** Determinate mode (0–1): the bar fills to this fraction. Wins over
   *  `duration` when set. */
  value?: number;
  paused: boolean;
  className?: string;
  style?: CSSProperties;
}

export function ProgressBar({
  duration,
  value,
  paused,
  className,
  style,
}: ProgressBarProps) {
  if (value !== undefined) {
    const clamped = Math.min(1, Math.max(0, value));
    return (
      <div
        className={`rtoast-progress rtoast-progress--determinate ${className ?? ""}`.trim()}
        style={style}
        role="progressbar"
        aria-label="Progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped * 100)}
      >
        <div
          className="rtoast-progress__bar"
          style={{ transform: `scaleX(${clamped})` }}
        />
      </div>
    );
  }

  if (duration === undefined || !isFinite(duration) || duration <= 0) {
    return null;
  }

  return (
    <div
      className={`rtoast-progress ${className ?? ""}`.trim()}
      style={style}
      aria-hidden="true"
    >
      <div
        className="rtoast-progress__bar"
        style={{
          animationDuration: `${duration}ms`,
          animationPlayState: paused ? "paused" : "running",
        }}
      />
    </div>
  );
}
