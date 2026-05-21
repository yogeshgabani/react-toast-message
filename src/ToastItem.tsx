import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ActionButton } from "./components/ActionButton";
import { CloseButton } from "./components/CloseButton";
import { Icon } from "./components/Icon";
import { ProgressBar } from "./components/ProgressBar";
import { useToastStore } from "./store";
import type {
  AnimationPreset,
  SwipeDirection,
  ToastData,
  ToastPosition,
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
}

function resolveSwipe(
  swipe: SwipeDirection | undefined,
  position: ToastPosition,
): "x" | "y" {
  if (swipe === "x" || swipe === "y") return swipe;
  if (position.endsWith("center")) return "y";
  return "x";
}

export function ToastItem({
  toast,
  index,
  total,
  position,
  defaultDuration,
  defaultAnimation,
  expand,
  closeButtonDefault,
  richColorsDefault,
}: ToastItemProps) {
  const dismiss = useToastStore((s) => s.dismiss);
  const globalPaused = useToastStore((s) => s.paused);
  const prefersReducedMotion = useReducedMotion();

  const duration =
    toast.duration ??
    (toast.type === "loading" ? Infinity : defaultDuration);

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

  const startedAtRef = useRef<number>(Date.now());
  const remainingRef = useRef<number>(duration);
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

  useEffect(() => {
    remainingRef.current = duration;
  }, [duration]);

  useEffect(() => {
    if (!isFinite(remainingRef.current) || remainingRef.current <= 0) return;
    if (paused) return;

    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(
      () => closeRef.current("auto"),
      remainingRef.current,
    );

    return () => {
      if (timerRef.current) {
        const elapsed = Date.now() - startedAtRef.current;
        remainingRef.current = Math.max(0, remainingRef.current - elapsed);
        clearTimer();
      }
    };
  }, [paused, duration]);

  const { variants, transition } = useMemo(
    () =>
      prefersReducedMotion
        ? { variants: reducedMotionVariants, transition: reducedMotionTransition }
        : getVariants(animation, position),
    [animation, position, prefersReducedMotion],
  );

  const swipe = resolveSwipe(toast.swipeDirection, position);
  const draggable = toast.draggable !== false;

  const dragProps = draggable
    ? {
        drag: swipe as "x" | "y",
        dragElastic: { left: 1, right: 1, top: 0.3, bottom: 0.3 },
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

  const colorClass = richColors
    ? `rtoast--rich rtoast--rich-${toast.type}`
    : "";
  const variantClass =
    variant === "glass"
      ? "rtoast--glass"
      : variant === "gradient"
      ? `rtoast--gradient rtoast--gradient-${toast.type}`
      : "";

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
        {(toast.progressBar ?? false) && isFinite(duration) && duration > 0 && (
          <ProgressBar
            duration={duration}
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
      layout
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      data-toast-id={toast.id}
      data-type={toast.type}
      data-position={position}
      className={baseClass}
      style={{
        ...toast.style,
        ...toast.styles?.toast,
      }}
      variants={variants}
      initial="initial"
      animate="animate"
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
