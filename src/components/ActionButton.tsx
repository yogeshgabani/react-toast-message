import type { CSSProperties } from "react";
import type { ToastAction } from "../types";

interface ActionButtonProps {
  action: ToastAction;
  variant?: "primary" | "cancel";
  onClose: () => void;
  className?: string;
  style?: CSSProperties;
}

export function ActionButton({
  action,
  variant = "primary",
  onClose,
  className,
  style,
}: ActionButtonProps) {
  const cls =
    variant === "primary" ? "rtoast-action" : "rtoast-action rtoast-action--cancel";
  return (
    <button
      type="button"
      className={`${cls} ${className ?? ""}`.trim()}
      style={style}
      onClick={async (e) => {
        await action.onClick(e);
        if (action.closeOnClick !== false) onClose();
      }}
    >
      {action.label}
    </button>
  );
}
