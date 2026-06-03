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
  queue: ToastData[];
  maxVisible: number;
  defaultDuration: number;
  paused: boolean;
  expanded: boolean;
  setMaxVisible: (n: number) => void;
  setDefaultDuration: (n: number) => void;
  setPaused: (p: boolean) => void;
  setExpanded: (e: boolean) => void;
  add: (toast: ToastData) => string | number;
  update: (id: string | number, patch: Partial<ToastData>) => void;
  upsert: (toast: ToastData) => string | number;
  dismiss: (id?: string | number) => void;
  remove: (id?: string | number) => void;
  promote: () => void;
}

function computeExpiresAt(
  toast: ToastData,
  others: ToastData[],
  defaultDuration: number,
  now = Date.now(),
): number | undefined {
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
  queue: [],
  maxVisible: Infinity,
  defaultDuration: 4000,
  paused: false,
  expanded: false,

  setMaxVisible: (n) =>
    set({ maxVisible: n === Infinity ? Infinity : Math.max(1, n) }),
  setDefaultDuration: (n) => set({ defaultDuration: Math.max(0, n) }),
  setPaused: (p) => set({ paused: p }),
  setExpanded: (e) => set({ expanded: e }),

  add: (toast) => {
    const state = get();
    const all = [...state.toasts, ...state.queue];
    const withExpiry: ToastData = {
      ...toast,
      expiresAt: computeExpiresAt(toast, all, state.defaultDuration),
    };
    if (state.toasts.length >= state.maxVisible) {
      set({ queue: [...state.queue, withExpiry] });
    } else {
      set({ toasts: [withExpiry, ...state.toasts] });
    }
    return withExpiry.id;
  },

  update: (id, patch) => {
    const state = get();
    const all = [...state.toasts, ...state.queue];

    const patchToast = (t: ToastData): ToastData => {
      if (t.id !== id) return t;
      const merged = { ...t, ...patch };
      // When duration changes via update (e.g. loading -> success on a
      // promise toast), recompute expiry from "now" with stagger so the
      // FIFO order continues to hold.
      if (patch.duration !== undefined || patch.type !== undefined) {
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
      queue: s.queue.map(patchToast),
    }));
  },

  upsert: (toast) => {
    const state = get();
    const existsActive = state.toasts.some((t) => t.id === toast.id);
    const existsQueued = state.queue.some((t) => t.id === toast.id);
    if (existsActive || existsQueued) {
      get().update(toast.id, toast);
      return toast.id;
    }
    return get().add(toast);
  },

  dismiss: (id) => {
    if (id === undefined) {
      set({ toasts: [], queue: [] });
      return;
    }
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
      queue: s.queue.filter((t) => t.id !== id),
    }));
    // promote next queued toast
    setTimeout(() => get().promote(), 0);
  },

  remove: (id) => get().dismiss(id),

  promote: () => {
    const { toasts, queue, maxVisible, defaultDuration } = get();
    if (queue.length === 0) return;
    if (toasts.length >= maxVisible) return;
    const [next, ...rest] = queue;
    if (!next) return;
    // Recompute expiry from "now" — the toast has been waiting in the
    // queue and its original expiresAt is stale.
    const promoted: ToastData = {
      ...next,
      expiresAt: computeExpiresAt(next, toasts, defaultDuration),
    };
    set({ toasts: [promoted, ...toasts], queue: rest });
  },
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
