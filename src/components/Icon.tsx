import type { ReactNode } from "react";
import type { ToastType } from "../types";

interface IconProps {
  type: ToastType;
  custom?: ReactNode;
}

const baseProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function Icon({ type, custom }: IconProps) {
  if (custom !== undefined && custom !== null) {
    return <span className="rtoast-icon" aria-hidden="true">{custom}</span>;
  }

  switch (type) {
    case "success":
      return (
        <span className="rtoast-icon" aria-hidden="true">
          <svg {...baseProps}>
            <circle cx="12" cy="12" r="10" />
            <path d="m8 12 3 3 5-6" />
          </svg>
        </span>
      );
    case "error":
      return (
        <span className="rtoast-icon" aria-hidden="true">
          <svg {...baseProps}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </span>
      );
    case "warning":
      return (
        <span className="rtoast-icon" aria-hidden="true">
          <svg {...baseProps}>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </span>
      );
    case "info":
      return (
        <span className="rtoast-icon" aria-hidden="true">
          <svg {...baseProps}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </span>
      );
    case "loading":
      return (
        <span className="rtoast-icon rtoast-icon--spin" aria-hidden="true">
          <svg {...baseProps}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </span>
      );
    default:
      return null;
  }
}
