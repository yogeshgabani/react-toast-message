import { create } from "zustand";
import type { ToastData, ToastOptions, ToastType } from "./types";

let counter = 0;
const genId = () => `t-${Date.now().toString(36)}-${(counter++).toString(36)}`;

interface ToastStoreState {
  toasts: ToastData[];
  queue: ToastData[];
  maxVisible: number;
  paused: boolean;
  expanded: boolean;
  setMaxVisible: (n: number) => void;
  setPaused: (p: boolean) => void;
  setExpanded: (e: boolean) => void;
  add: (toast: ToastData) => string | number;
  update: (id: string | number, patch: Partial<ToastData>) => void;
  upsert: (toast: ToastData) => string | number;
  dismiss: (id?: string | number) => void;
  remove: (id?: string | number) => void;
  promote: () => void;
}

export const useToastStore = create<ToastStoreState>((set, get) => ({
  toasts: [],
  queue: [],
  maxVisible: 3,
  paused: false,
  expanded: false,

  setMaxVisible: (n) => set({ maxVisible: Math.max(1, n) }),
  setPaused: (p) => set({ paused: p }),
  setExpanded: (e) => set({ expanded: e }),

  add: (toast) => {
    const state = get();
    if (state.toasts.length >= state.maxVisible) {
      set({ queue: [...state.queue, toast] });
    } else {
      set({ toasts: [toast, ...state.toasts] });
    }
    return toast.id;
  },

  update: (id, patch) => {
    set((s) => ({
      toasts: s.toasts.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      queue: s.queue.map((t) => (t.id === id ? { ...t, ...patch } : t)),
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
    const { toasts, queue, maxVisible } = get();
    if (queue.length === 0) return;
    if (toasts.length >= maxVisible) return;
    const [next, ...rest] = queue;
    if (!next) return;
    set({ toasts: [next, ...toasts], queue: rest });
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
