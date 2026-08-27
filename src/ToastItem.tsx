import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { ActionButton } from "./components/ActionButton";
import { CloseButton } from "./components/CloseButton";
import { Icon } from "./components/Icon";
import { ProgressBar } from "./components/ProgressBar";
import { playSound } from "./sound";
import { useToastStore } from "./store";
import { vibrateDevice } from "./vibrate";
import type {
  AnimationPreset,
  SwipeDirection,
  ToastData,
  ToastPosition,
  ToastType,
} from "./types";
import {
  getVariants,
  isAosAnimation,
  reducedMotionTransition,
  reducedMotionVariants,
} from "./animations/presets";

interface ToastItemProps {
  toast: ToastData;
  index: number;
  total: number;
  position: ToastPosition;
  defaultDuration: number;
  defaultAnimation: AnimationPreset;
  expand: boolean;
  closeButtonDefault: boolean;
  richColorsDefault: boolean;
  dir: "ltr" | "rtl";
  sounds?: Partial<Record<ToastType, string>>;
  soundVolume?: number;
  vibrate?: Partial<Record<ToastType, number | number[]>>;
}

function resolveSwipe(
  swipe: SwipeDirection | undefined,
  position: ToastPosition,
): "x" | "y" {
  if (swipe === "x" || swipe === "y") return swipe;
  if (position.endsWith("center")) return "y";
  return "x";
}

function ToastItemInner(
  {
    toast,
    index,
    total,
    position,
    defaultDuration,
    defaultAnimation,
    expand,
    closeButtonDefault,
    richColorsDefault,
    dir,
    sounds,
    soundVolume,
    vibrate,
  }: ToastItemProps,
  ref: React.ForwardedRef<HTMLLIElement>,
) {
  const dismiss = useToastStore((s) => s.dismiss);
  const globalPaused = useToastStore((s) => s.paused);
  const prefersReducedMotion = useReducedMotion();

  const duration =
    toast.duration ??
    (toast.type === "loading" ? Infinity : defaultDuration);

  // If the store has assigned a staggered absolute expiry, the timer
  // runs against that instead of the raw `duration`. This keeps toasts
  // dismissing FIFO even when many are created in the same tick.
  const expiresAt = toast.expiresAt;

  const dismissible = toast.dismissible !== false;
  const closeButton = toast.closeButton ?? closeButtonDefault;
  const richColors = toast.richColors ?? richColorsDefault;
  const variant = toast.variant ?? "default";

  // Pick animation: explicit `animation` wins; otherwise sniff `className`
  // for an AOS class (e.g., "fade-left"); otherwise fall back to default.
  const aosFromClass = (toast.className ?? "")
    .split(/\s+/)
    .find((c) => isAosAnimation(c));
  const animation = toast.animation ?? (aosFromClass as typeof defaultAnimation | undefined) ?? defaultAnimation;

  const [hovered, setHovered] = useState(false);
  const [removing, setRemoving] = useState(false);

  const paused = globalPaused || hovered || removing;

  const hasExpiry = typeof expiresAt === "number" && isFinite(expiresAt);

  const initialRemaining = hasExpiry
    ? Math.max(0, (expiresAt as number) - Date.now())
    : duration;

  const startedAtRef = useRef<number>(Date.now());
  const remainingRef = useRef<number>(initialRemaining);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const close = useCallback(
    (kind: "auto" | "manual" = "manual") => {
      clearTimer();
      if (kind === "auto") toast.onAutoClose?.(toast);
      toast.onDismiss?.(toast);
      dismiss(toast.id);
    },
    [dismiss, toast],
  );

  const closeRef = useRef(close);
  closeRef.current = close;

  // Plays on mount and again whenever `type` changes (e.g. a promise toast
  // going loading -> success) — not on every re-render, since `sounds` and
  // `soundVolume` are intentionally left out of the deps: they're
  // Toaster-level config that isn't expected to change mid-session, and
  // including the `sounds` object (a fresh literal most renders) would
  // replay the sound on unrelated re-renders (hover, drag, …).
  useEffect(() => {
    if (toast.sound === false) return;
    const url = typeof toast.sound === "string" ? toast.sound : sounds?.[toast.type];
    if (!url) return;
    playSound(url, soundVolume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.type, toast.sound]);

  // Same mount/type-change trigger as the sound effect above.
  useEffect(() => {
    if (toast.vibrate === false) return;
    const pattern = toast.vibrate ?? vibrate?.[toast.type];
    if (!pattern) return;
    vibrateDevice(pattern);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.type, toast.vibrate]);

  useEffect(() => {
    // If the toast was given an absolute expiry by the store, prefer it
    // (it has the FIFO stagger baked in). Otherwise fall back to the raw
    // duration. Recomputed whenever either input changes — e.g. a promise
    // toast transitioning loading -> success.
    remainingRef.current =
      typeof expiresAt === "number" && isFinite(expiresAt)
        ? Math.max(0, expiresAt - Date.now())
        : duration;
  }, [duration, expiresAt]);

  useEffect(() => {
    // A toast with an absolute expiry always gets a timer — remaining can
    // legitimately be 0 if it expired while hidden behind the visible cap
    // (it should then close as soon as it re-appears). Without an expiry,
    // duration <= 0 / Infinity means "sticky", so no timer.
    if (
      !hasExpiry &&
      (!isFinite(remainingRef.current) || remainingRef.current <= 0)
    )
      return;
    if (paused) return;

    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(
      () => closeRef.current("auto"),
      Math.max(0, remainingRef.current),
    );

    return () => {
      if (timerRef.current) {
        const elapsed = Date.now() - startedAtRef.current;
        remainingRef.current = Math.max(0, remainingRef.current - elapsed);
        clearTimer();
      }
    };
  }, [paused, duration, expiresAt]);

  const { variants, transition } = useMemo(
    () =>
      prefersReducedMotion
        ? { variants: reducedMotionVariants, transition: reducedMotionTransition }
        : getVariants(animation, position),
    [animation, position, prefersReducedMotion],
  );

  // ----- collapsed stack (sonner-style) -----
  // When the list is not expanded, older toasts tuck behind the newest
  // one: each level peeks out by a small offset toward the screen edge
  // and scales down slightly. Beyond the 3rd level they fade out entirely.
  const STACK_PEEK = 14;
  const STACK_SCALE_STEP = 0.06;
  const STACK_MAX_VISIBLE = 3;

  const isTopPos = position.startsWith("top");
  const stacked = !expand;
  const level = Math.min(index, STACK_MAX_VISIBLE);
  const stackY = stacked ? (isTopPos ? 1 : -1) * level * STACK_PEEK : 0;
  const stackScale = stacked ? 1 - level * STACK_SCALE_STEP : 1;
  const stackHidden = stacked && index >= STACK_MAX_VISIBLE;

  // Only the front toast stays in normal flow (it gives the list its
  // height); the rest are pinned to the screen-edge and offset via the
  // animated transform above.
  const stackPositionStyle: React.CSSProperties =
    stacked && index > 0
      ? isTopPos
        ? { position: "absolute", top: 0, left: 0, right: 0 }
        : { position: "absolute", bottom: 0, left: 0, right: 0 }
      : {};

  const baseAnimate =
    typeof variants.animate === "object" && variants.animate !== null
      ? variants.animate
      : {};
  const animateTarget = {
    ...baseAnimate,
    y: stackY,
    scale: stackScale,
    ...(stackHidden ? { opacity: 0 } : {}),
  };

  const swipe = resolveSwipe(toast.swipeDirection, position);
  const draggable = toast.draggable !== false;

  // Edge-anchored toasts (left/right) already have a natural swipe-out
  // direction from their position. Center toasts have no such edge, so for
  // those `dir` picks which way feels natural to swipe away — mirrored in
  // RTL, matching reading direction (the other side stays draggable, just
  // with more resistance).
  const isCenterPos = position.endsWith("center");
  const dragElastic =
    swipe === "x" && isCenterPos
      ? dir === "rtl"
        ? { left: 1, right: 0.4, top: 0.3, bottom: 0.3 }
        : { left: 0.4, right: 1, top: 0.3, bottom: 0.3 }
      : { left: 1, right: 1, top: 0.3, bottom: 0.3 };

  const dragProps = draggable
    ? {
        drag: swipe as "x" | "y",
        dragElastic,
        dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
        onDragEnd: (
          _e: MouseEvent | TouchEvent | PointerEvent,
          info: PanInfo,
        ) => {
          const off = swipe === "x" ? info.offset.x : info.offset.y;
          const vel = swipe === "x" ? info.velocity.x : info.velocity.y;
          if (Math.abs(off) > 90 || Math.abs(vel) > 700) {
            setRemoving(true);
            close("manual");
          }
        },
      }
    : {};

  const role =
    toast.type === "error" || toast.type === "warning" ? "alert" : "status";
  const ariaLive =
    toast.type === "error" || toast.type === "warning" ? "assertive" : "polite";

  // Rich colors tint the default surface. Glass/gradient variants bring
  // their own background, and `.rtoast--rich`'s higher specificity would
  // paint over it — so an explicitly requested variant wins over the
  // global richColors flag.
  const colorClass =
    richColors && variant === "default"
      ? `rtoast--rich rtoast--rich-${toast.type}`
      : "";
  // glass/accent are type-agnostic; every other non-default variant gets a
  // per-type class (e.g. rtoast--solid rtoast--solid-success) so CSS can
  // color it semantically.
  const variantClass =
    variant === "default"
      ? ""
      : variant === "glass"
      ? "rtoast--glass"
      : variant === "accent"
      ? "rtoast--accent"
      : `rtoast--${variant} rtoast--${variant}-${toast.type}`;

  const baseClass = [
    "rtoast",
    `rtoast--${toast.type}`,
    variantClass,
    colorClass,
    toast.classNames?.toast,
    toast.className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderContent = (): ReactNode => {
    if (toast.custom) return toast.custom(toast);
    return (
      <>
        {(toast.icon !== null) && (
          <Icon type={toast.type} custom={toast.icon} />
        )}
        <div className="rtoast-body">
          {toast.title !== undefined && toast.title !== null && (
            <div
              className={`rtoast-title ${toast.classNames?.title ?? ""}`.trim()}
              style={toast.styles?.title}
            >
              {toast.title}
            </div>
          )}
          {toast.description !== undefined && toast.description !== null && (
            <div
              className={`rtoast-description ${toast.classNames?.description ?? ""}`.trim()}
              style={toast.styles?.description}
            >
              {toast.description}
            </div>
          )}
          {(toast.action || toast.cancel) && (
            <div className="rtoast-actions">
              {toast.cancel && (
                <ActionButton
                  action={toast.cancel}
                  variant="cancel"
                  onClose={() => close("manual")}
                  className={toast.classNames?.cancelButton}
                />
              )}
              {toast.action && (
                <ActionButton
                  action={toast.action}
                  variant="primary"
                  onClose={() => close("manual")}
                  className={toast.classNames?.actionButton}
                  style={toast.styles?.actionButton}
                />
              )}
            </div>
          )}
        </div>
        {dismissible && closeButton && (
          <CloseButton
            onClick={() => close("manual")}
            className={toast.classNames?.closeButton}
            style={toast.styles?.closeButton}
          />
        )}
        {(toast.progressBar ?? false) && isFinite(initialRemaining) && initialRemaining > 0 && (
          <ProgressBar
            duration={initialRemaining}
            paused={paused}
            className={toast.classNames?.progress}
            style={toast.styles?.progress}
          />
        )}
      </>
    );
  };

  return (
    <motion.li
      ref={ref}
      layout
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      data-toast-id={toast.id}
      data-type={toast.type}
      data-position={position}
      className={baseClass}
      style={{
        zIndex: total - index,
        ...stackPositionStyle,
        ...(stackHidden ? { pointerEvents: "none" as const } : {}),
        ...toast.style,
        ...toast.styles?.toast,
      }}
      variants={variants}
      initial="initial"
      animate={animateTarget}
      exit="exit"
      transition={transition}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      {...dragProps}
      whileTap={draggable ? { cursor: "grabbing" } : undefined}
    >
      <div className="rtoast-inner">{renderContent()}</div>
    </motion.li>
  );
}

// forwardRef so AnimatePresence's popLayout mode can measure the element
// when it exits (it attaches a ref to the direct child).
export const ToastItem = forwardRef(ToastItemInner);
