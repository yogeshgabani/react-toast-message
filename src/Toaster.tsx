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

function resolveDocumentDir(): "ltr" | "rtl" {
  const attr = document.documentElement.getAttribute("dir");
  if (attr === "rtl" || attr === "ltr") return attr;
  return getComputedStyle(document.documentElement).direction === "rtl"
    ? "rtl"
    : "ltr";
}

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
    sounds,
    soundVolume,
    vibrate,
    container,
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

  // Resolved lazily in an effect (not eagerly at module scope) so the
  // portal never renders during SSR — `document` doesn't exist there, and
  // `container` may itself read from `document`.
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  // "auto" is resolved from the host document's actual direction so the
  // RTL CSS (accent bar side, icon/text order) engages even though nothing
  // was passed explicitly — previously "auto" was written straight to
  // `data-dir` and never matched the `[data-dir="rtl"]` selectors.
  const [resolvedDir, setResolvedDir] = useState<"ltr" | "rtl">(
    dir === "auto" ? "ltr" : dir,
  );
  // Which position group the cursor is currently over — hovering a
  // collapsed stack expands the whole stack (sonner behaviour).
  const [hoverPos, setHoverPos] = useState<ToastPosition | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = typeof container === "function" ? container() : container;
    setPortalTarget(target ?? document.body);
  }, [container]);

  useEffect(() => {
    if (dir !== "auto") {
      setResolvedDir(dir);
      return;
    }
    setResolvedDir(resolveDocumentDir());
    const observer = new MutationObserver(() => setResolvedDir(resolveDocumentDir()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });
    return () => observer.disconnect();
  }, [dir]);

  // Escape dismisses whichever toast currently has focus (reached via Tab
  // or the `hotkey`) — mirrors the close-button/swipe dismiss path so
  // onDismiss fires and `dismissible: false` toasts are left alone.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const active = document.activeElement as HTMLElement | null;
      const toastEl = active?.closest<HTMLElement>("[data-toast-id]");
      const idAttr = toastEl?.dataset.toastId;
      if (idAttr === undefined) return;
      const store = useToastStore.getState();
      const t = store.toasts.find((x) => String(x.id) === idAttr);
      if (!t || t.dismissible === false) return;
      e.preventDefault();
      t.onDismiss?.(t);
      store.dismiss(t.id);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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

  // Hotkey focuses the frontmost toast — across every position, not just
  // the Toaster's default one, so a per-toast `position` override is still
  // reachable. From there Tab moves through its action/cancel/close
  // buttons, and Escape (below) dismisses it.
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
        const first = portalRef.current?.querySelector<HTMLElement>(
          "[data-toast-id]",
        );
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey]);

  // Arrow-key navigation between toasts once one already has focus (via the
  // hotkey or Tab) — does nothing when focus is elsewhere on the page, so
  // it never steals arrow keys from the rest of the app.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const active = document.activeElement as HTMLElement | null;
      const currentEl = active?.closest<HTMLElement>("[data-toast-id]");
      if (!currentEl) return;
      const all = Array.from(
        portalRef.current?.querySelectorAll<HTMLElement>("[data-toast-id]") ?? [],
      );
      const idx = all.indexOf(currentEl);
      if (idx === -1 || all.length < 2) return;
      e.preventDefault();
      const nextIdx =
        e.key === "ArrowDown" ? (idx + 1) % all.length : (idx - 1 + all.length) % all.length;
      all[nextIdx]?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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

  if (!portalTarget) return null;

  return createPortal(
    <div
      ref={portalRef}
      className={`rtoast-portal rtoast-theme-${theme} ${containerClassName ?? ""}`.trim()}
      style={containerStyle}
      data-rich-colors={richColors ? "true" : undefined}
      data-dir={resolvedDir}
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
                  dir={resolvedDir}
                  sounds={sounds}
                  soundVolume={soundVolume}
                  vibrate={vibrate}
                />
              ))}
            </AnimatePresence>
            {isFinite(max) && list.length > max && (
              <li
                className="rtoast-overflow"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                +{list.length - max} more
              </li>
            )}
          </ol>
        );
      })}
    </div>,
    portalTarget,
  );
}
