import type { CSSProperties } from "react";

interface ProgressBarProps {
  duration: number;
  paused: boolean;
  className?: string;
  style?: CSSProperties;
}

export function ProgressBar({
  duration,
  paused,
  className,
  style,
}: ProgressBarProps) {
  if (!isFinite(duration) || duration <= 0) return null;

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
