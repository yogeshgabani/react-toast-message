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

export type ToastTheme =
  | "light"
  | "dark"
  | "system"
  | "glass"
  | "gradient"
  | "accent";

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

export type ToastVisualVariant =
  | "default"
  | "glass"
  | "gradient"
  | "accent"
  | "solid"
  | "soft"
  | "outline"
  | "neon"
  | "left-border"
  | "right-border"
  | "x-border"
  | "top-border"
  | "bottom-border"
  | "y-border";

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
  /** URL of a sound to play when this toast appears (or transitions type,
   *  e.g. a `toast.promise` loading -> success). Overrides the Toaster's
   *  `sounds` map for this toast; `false` mutes it even if `sounds` has an
   *  entry for its type. */
  sound?: string | false;
  /** Vibration pattern (ms, or on/off/on/… array per the Vibration API) to
   *  fire on mobile when this toast appears. Overrides the Toaster's
   *  `vibrate` map for this toast; `false` mutes it even if `vibrate` has
   *  an entry for its type. No-op on devices/browsers without vibration
   *  support (e.g. desktop, iOS Safari). */
  vibrate?: number | number[] | false;
  onDismiss?: (toast: ToastData) => void;
  onAutoClose?: (toast: ToastData) => void;
}

export interface ToastData extends Omit<ToastOptions, "id"> {
  id: string | number;
  type: ToastType;
  title?: ReactNode;
  createdAt: number;
  /** Absolute timestamp (ms) at which the toast should auto-dismiss.
   *  Computed by the store with a FIFO stagger so toasts created near each
   *  other still close one-by-one in the order they appeared. */
  expiresAt?: number;
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
  /** Per-type sound URLs, e.g. `{ success: "/sounds/success.mp3" }`. No
   *  sound plays for a type that has no entry here (and none by default —
   *  the library ships no audio files). A toast's own `sound` option
   *  overrides its type's entry. */
  sounds?: Partial<Record<ToastType, string>>;
  /** Playback volume (0–1) for `sounds`. Defaults to 1. */
  soundVolume?: number;
  /** Per-type vibration patterns, e.g. `{ error: 200 }` or
   *  `{ success: [40, 30, 40] }`. No vibration for a type with no entry
   *  here. A toast's own `vibrate` option overrides its type's entry. */
  vibrate?: Partial<Record<ToastType, number | number[]>>;
  containerStyle?: CSSProperties;
  containerClassName?: string;
  toastOptions?: Partial<ToastOptions>;
  visibleToasts?: number;
  /** Where the toast portal mounts — an element, or a function returning
   *  one (called once on mount). Defaults to `document.body`. Useful for
   *  rendering inside a shadow root, a specific stacking-context container,
   *  or when multiple independent `<Toaster />`s must stay visually
   *  scoped. If the function returns `null`/`undefined`, falls back to
   *  `document.body`. */
  container?: Element | (() => Element | null | undefined);
}
