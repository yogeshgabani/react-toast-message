import { create } from "zustand";
import type { ToastData, ToastOptions, ToastType } from "./types";

let counter = 0;
const genId = () => `t-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/** Minimum spacing between successive auto-dismissals.
 *  Even when many toasts are created in the same tick (e.g. Promise.all,
 *  a spam button, a stress test), each one will auto-close at least this
 *  many ms after the previous one — producing a clean FIFO wave instead
 *  of every toast vanishing simultaneously. */
const STAGGER_MS = 600;

interface ToastStoreState {
  toasts: ToastData[];
  maxVisible: number;
  defaultDuration: number;
  /** Pointer is over a toast list (set only when the Toaster's
   *  `pauseOnHover` is on). */
  paused: boolean;
  /** Browser window/tab lost focus. Tracked unconditionally — each toast
   *  decides via its own `pauseOnWindowBlur` whether this pauses it. */
  windowBlurred: boolean;
  expanded: boolean;
  setMaxVisible: (n: number) => void;
  setDefaultDuration: (n: number) => void;
  setPaused: (p: boolean) => void;
  setWindowBlurred: (b: boolean) => void;
  setExpanded: (e: boolean) => void;
  add: (toast: ToastData) => string | number;
  update: (id: string | number, patch: Partial<ToastData>) => void;
  upsert: (toast: ToastData) => string | number;
  dismiss: (id?: string | number) => void;
  remove: (id?: string | number) => void;
}

/** A toast reporting determinate progress stays up until the work is done,
 *  regardless of any `duration` — see `ToastOptions.progress`. */
export const hasProgress = (t: Pick<ToastData, "progress">) =>
  typeof t.progress === "number";

function computeExpiresAt(
  toast: ToastData,
  others: ToastData[],
  defaultDuration: number,
  now = Date.now(),
): number | undefined {
  if (hasProgress(toast)) return undefined;
  const rawDuration =
    toast.duration ?? (toast.type === "loading" ? Infinity : defaultDuration);

  if (!isFinite(rawDuration) || rawDuration <= 0) return undefined;

  // Walk every other toast that still has a finite expiry and find the
  // latest one — the new toast must close *after* that, plus a stagger.
  let latest = 0;
  for (const t of others) {
    if (t.id === toast.id) continue;
    const e = t.expiresAt;
    if (typeof e === "number" && isFinite(e) && e > latest) latest = e;
  }

  const ownExpires = now + rawDuration;
  return latest > 0 ? Math.max(ownExpires, latest + STAGGER_MS) : ownExpires;
}

export const useToastStore = create<ToastStoreState>((set, get) => ({
  toasts: [],
  maxVisible: Infinity,
  defaultDuration: 4000,
  paused: false,
  windowBlurred: false,
  expanded: false,

  setMaxVisible: (n) =>
    set({ maxVisible: n === Infinity ? Infinity : Math.max(1, n) }),
  setDefaultDuration: (n) => set({ defaultDuration: Math.max(0, n) }),
  setPaused: (p) => set({ paused: p }),
  setWindowBlurred: (b) => set({ windowBlurred: b }),
  setExpanded: (e) => set({ expanded: e }),

  add: (toast) => {
    const state = get();
    const withExpiry: ToastData = {
      ...toast,
      expiresAt: computeExpiresAt(toast, state.toasts, state.defaultDuration),
    };
    // Sonner-style: every new toast enters the active list immediately.
    // When there are more toasts than `maxVisible`, the renderer hides the
    // oldest ones — the newest toast is always the one on screen.
    set({ toasts: [withExpiry, ...state.toasts] });
    return withExpiry.id;
  },

  update: (id, patch) => {
    const state = get();
    const all = state.toasts;

    const patchToast = (t: ToastData): ToastData => {
      if (t.id !== id) return t;
      const merged = { ...t, ...patch };
      // A type change (e.g. loading -> success once an upload finishes)
      // ends the progress phase, unless the patch sets progress itself.
      if (
        patch.type !== undefined &&
        patch.type !== t.type &&
        !("progress" in patch)
      ) {
        merged.progress = undefined;
      }
      // Likewise, leaving "loading" drops the Infinity duration that
      // `toast.loading()` sets — otherwise the common
      // `toast.success("Done", { id })` follow-up never auto-closed.
      if (
        t.type === "loading" &&
        patch.type !== undefined &&
        patch.type !== "loading" &&
        t.duration === Infinity &&
        !("duration" in patch)
      ) {
        merged.duration = undefined;
      }
      // When duration changes via update (e.g. loading -> success on a
      // promise toast), or the toast starts/stops reporting progress,
      // recompute expiry from "now" with stagger so the FIFO order
      // continues to hold.
      if (
        patch.duration !== undefined ||
        patch.type !== undefined ||
        hasProgress(merged) !== hasProgress(t)
      ) {
        const recomputed: ToastData = { ...merged, expiresAt: undefined };
        recomputed.expiresAt = computeExpiresAt(
          recomputed,
          all.filter((x) => x.id !== id),
          state.defaultDuration,
        );
        return recomputed;
      }
      return merged;
    };

    set((s) => ({
      toasts: s.toasts.map(patchToast),
    }));
  },

  upsert: (toast) => {
    const state = get();
    const exists = state.toasts.some((t) => t.id === toast.id);
    if (exists) {
      get().update(toast.id, toast);
      return toast.id;
    }
    return get().add(toast);
  },

  dismiss: (id) => {
    if (id === undefined) {
      set({ toasts: [] });
      return;
    }
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    }));
  },

  remove: (id) => get().dismiss(id),
}));

export function createToastData(
  type: ToastType,
  title: ToastData["title"],
  options: ToastOptions = {},
): ToastData {
  const id = options.id ?? genId();
  return {
    ...options,
    id,
    type,
    title,
    createdAt: Date.now(),
  };
}

export { genId };
