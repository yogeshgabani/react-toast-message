import type { CSSProperties } from "react";

interface CloseButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: CSSProperties;
  label?: string;
}

export function CloseButton({
  onClick,
  className,
  style,
  label = "Close notification",
}: CloseButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`rtoast-close ${className ?? ""}`.trim()}
      style={style}
      onClick={onClick}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}
