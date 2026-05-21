import type { CSSProperties, ReactNode } from "react";

export type ToastType =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "custom"
  | "action";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ToastTheme = "light" | "dark" | "system" | "glass" | "gradient";

export type AnimationPreset =
  | "slide"
  | "blur-fade"
  | "scale"
  | "spring"
  | "bounce"
  | AosAnimation;

export type AosAnimation =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "fade-up-right"
  | "fade-up-left"
  | "fade-down-right"
  | "fade-down-left"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "zoom-in"
  | "zoom-out"
  | "zoom-in-up"
  | "zoom-in-down"
  | "zoom-in-left"
  | "zoom-in-right"
  | "zoom-out-up"
  | "zoom-out-down"
  | "zoom-out-left"
  | "zoom-out-right"
  | "flip-up"
  | "flip-down"
  | "flip-left"
  | "flip-right";

export type SwipeDirection = "x" | "y" | "auto";

export type ToastVisualVariant = "default" | "glass" | "gradient";

export interface ToastAction {
  label: ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  closeOnClick?: boolean;
}

export interface ToastClassNames {
  toast?: string;
  title?: string;
  description?: string;
  icon?: string;
  closeButton?: string;
  actionButton?: string;
  cancelButton?: string;
  progress?: string;
}

export interface ToastStyles {
  toast?: CSSProperties;
  title?: CSSProperties;
  description?: CSSProperties;
  icon?: CSSProperties;
  closeButton?: CSSProperties;
  actionButton?: CSSProperties;
  progress?: CSSProperties;
}

export interface ToastOptions {
  id?: string | number;
  duration?: number;
  dismissible?: boolean;
  closeButton?: boolean;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ToastAction;
  cancel?: ToastAction;
  position?: ToastPosition;
  variant?: ToastVisualVariant;
  richColors?: boolean;
  progressBar?: boolean;
  pauseOnHover?: boolean;
  pauseOnWindowBlur?: boolean;
  draggable?: boolean;
  swipeDirection?: SwipeDirection;
  classNames?: ToastClassNames;
  styles?: ToastStyles;
  animation?: AnimationPreset;
  className?: string;
  style?: CSSProperties;
  onDismiss?: (toast: ToastData) => void;
  onAutoClose?: (toast: ToastData) => void;
}

export interface ToastData extends Omit<ToastOptions, "id"> {
  id: string | number;
  type: ToastType;
  title?: ReactNode;
  createdAt: number;
  custom?: (toast: ToastData) => ReactNode;
  promise?: Promise<unknown>;
}

export interface PromiseToastMessages<TData = unknown> {
  loading: ReactNode;
  success: ReactNode | ((data: TData) => ReactNode);
  error: ReactNode | ((err: unknown) => ReactNode);
  description?:
    | ReactNode
    | ((dataOrError: TData | unknown, state: "success" | "error") => ReactNode);
}

export interface ToasterProps {
  position?: ToastPosition;
  theme?: ToastTheme;
  richColors?: boolean;
  closeButton?: boolean;
  duration?: number;
  maxVisibleToasts?: number;
  gap?: number;
  offset?: number | string;
  expand?: boolean;
  expandOnHover?: boolean;
  pauseOnHover?: boolean;
  pauseOnWindowBlur?: boolean;
  animation?: AnimationPreset;
  dir?: "ltr" | "rtl" | "auto";
  hotkey?: string[];
  containerStyle?: CSSProperties;
  containerClassName?: string;
  toastOptions?: Partial<ToastOptions>;
  visibleToasts?: number;
}
