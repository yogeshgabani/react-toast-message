import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ToastItem } from "./ToastItem";
import { useToastStore } from "./store";
import type { ToastData, ToasterProps, ToastPosition } from "./types";

const POSITION_LIST: ToastPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

function getOffsetStyle(position: ToastPosition, offset: string) {
  const style: React.CSSProperties = { position: "fixed", zIndex: 999999 };
  if (position.startsWith("top")) style.top = offset;
  else style.bottom = offset;
  if (position.endsWith("left")) style.left = offset;
  else if (position.endsWith("right")) style.right = offset;
  else {
    style.left = "50%";
    style.transform = "translateX(-50%)";
  }
  return style;
}

export function Toaster(props: ToasterProps) {
  const {
    position = "bottom-right",
    theme = "light",
    richColors = false,
    closeButton = false,
    duration = 4000,
    maxVisibleToasts = Infinity,
    visibleToasts,
    gap = 14,
    offset = "1rem",
    expand = false,
    expandOnHover = true,
    pauseOnHover = true,
    pauseOnWindowBlur = true,
    animation = "slide",
    dir = "auto",
    hotkey = ["altKey", "KeyT"],
    containerStyle,
    containerClassName,
    toastOptions,
  } = props;

  const max = visibleToasts ?? maxVisibleToasts;

  const toasts = useToastStore((s) => s.toasts);
  const setMaxVisible = useToastStore((s) => s.setMaxVisible);
  const setDefaultDuration = useToastStore((s) => s.setDefaultDuration);
  const setPaused = useToastStore((s) => s.setPaused);
  const paused = useToastStore((s) => s.paused);
  const expanded = useToastStore((s) => s.expanded);

  const [mounted, setMounted] = useState(false);
  // Which position group the cursor is currently over — hovering a
  // collapsed stack expands the whole stack (sonner behaviour).
  const [hoverPos, setHoverPos] = useState<ToastPosition | null>(null);
  const containerRef = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMaxVisible(max);
  }, [max, setMaxVisible]);

  useEffect(() => {
    setDefaultDuration(duration);
  }, [duration, setDefaultDuration]);

  // Window blur pause
  useEffect(() => {
    if (!pauseOnWindowBlur) return;
    const onBlur = () => setPaused(true);
    const onFocus = () => setPaused(false);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [pauseOnWindowBlur, setPaused]);

  // Hotkey to focus latest toast
  useEffect(() => {
    if (!hotkey || hotkey.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      const matchMod = hotkey.every((k) => {
        if (k === "altKey") return e.altKey;
        if (k === "ctrlKey") return e.ctrlKey;
        if (k === "metaKey") return e.metaKey;
        if (k === "shiftKey") return e.shiftKey;
        return e.code === k;
      });
      if (matchMod) {
        e.preventDefault();
        const first = containerRef.current?.querySelector<HTMLElement>(
          "[data-toast-id]",
        );
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey]);

  // Group toasts by position (per-toast override allowed)
  const grouped = useMemo(() => {
    const map: Record<ToastPosition, ToastData[]> = {
      "top-left": [],
      "top-center": [],
      "top-right": [],
      "bottom-left": [],
      "bottom-center": [],
      "bottom-right": [],
    };
    for (const t of toasts) {
      const p = (t.position ?? position) as ToastPosition;
      map[p].push(t);
    }
    return map;
  }, [toasts, position]);

  // Toasts beyond the visible cap are kept in the store but not rendered,
  // so no per-item timer runs for them. Expire them straight from the
  // store — otherwise they'd pile up invisibly and never auto-dismiss.
  useEffect(() => {
    if (paused || !isFinite(max)) return;
    const overflow: ToastData[] = [];
    let earliest = Infinity;
    for (const pos of POSITION_LIST) {
      for (const t of grouped[pos].slice(max)) {
        overflow.push(t);
        if (
          typeof t.expiresAt === "number" &&
          isFinite(t.expiresAt) &&
          t.expiresAt < earliest
        ) {
          earliest = t.expiresAt;
        }
      }
    }
    if (!isFinite(earliest)) return;
    const timer = setTimeout(() => {
      const now = Date.now();
      const store = useToastStore.getState();
      for (const t of overflow) {
        if (typeof t.expiresAt === "number" && t.expiresAt <= now) {
          t.onAutoClose?.(t);
          t.onDismiss?.(t);
          store.dismiss(t.id);
        }
      }
    }, Math.max(0, earliest - Date.now()));
    return () => clearTimeout(timer);
  }, [grouped, max, paused]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`rtoast-portal rtoast-theme-${theme} ${containerClassName ?? ""}`.trim()}
      style={containerStyle}
      data-rich-colors={richColors ? "true" : undefined}
      data-dir={dir}
    >
      {POSITION_LIST.map((pos) => {
        const list = grouped[pos];
        if (!list || list.length === 0) return null;
        // Newest `max` toasts stay on screen; older ones are pushed out
        // (they keep expiring in the background via the effect above).
        const visibleList = isFinite(max) ? list.slice(0, max) : list;
        const isExpanded =
          expand || expanded || (expandOnHover && hoverPos === pos);
        return (
          <ol
            key={pos}
            ref={pos === position ? containerRef : undefined}
            className={`rtoast-list rtoast-list--${pos} ${
              isExpanded ? "rtoast-list--expanded" : "rtoast-list--collapsed"
            } ${expandOnHover ? "rtoast-list--hover-expand" : ""}`.trim()}
            style={{
              ...getOffsetStyle(pos, String(offset)),
              ["--rtoast-gap" as never]: `${gap}px`,
            }}
            data-position={pos}
            tabIndex={-1}
            aria-label="Notifications"
            onMouseEnter={() => {
              if (pauseOnHover) setPaused(true);
              setHoverPos(pos);
            }}
            onMouseLeave={() => {
              if (pauseOnHover) setPaused(false);
              setHoverPos(null);
            }}
          >
            <AnimatePresence initial mode="popLayout">
              {visibleList.map((toast, idx) => (
                <ToastItem
                  key={toast.id}
                  toast={{
                    ...toastOptions,
                    ...toast,
                  }}
                  index={idx}
                  total={visibleList.length}
                  position={pos}
                  defaultDuration={duration}
                  defaultAnimation={animation}
                  expand={isExpanded}
                  closeButtonDefault={closeButton}
                  richColorsDefault={richColors}
                />
              ))}
            </AnimatePresence>
          </ol>
        );
      })}
    </div>,
    document.body,
  );
}
