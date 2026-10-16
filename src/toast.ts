import type { ReactNode } from "react";
import { createToastData, genId, useToastStore } from "./store";
import type {
  PromiseToastMessages,
  ToastData,
  ToastOptions,
  ToastType,
} from "./types";

function emit(
  type: ToastType,
  title: ReactNode,
  options: ToastOptions = {},
): string | number {
  const data = createToastData(type, title, options);
  return useToastStore.getState().upsert(data);
}

function message(title: ReactNode, options?: ToastOptions) {
  return emit("default", title, options);
}

function success(title: ReactNode, options?: ToastOptions) {
  return emit("success", title, options);
}

function error(title: ReactNode | Error, options?: ToastOptions) {
  const resolved = title instanceof Error ? title.message || title.name : title;
  return emit("error", resolved, options);
}

function warning(title: ReactNode, options?: ToastOptions) {
  return emit("warning", title, options);
}

function info(title: ReactNode, options?: ToastOptions) {
  return emit("info", title, options);
}

function loading(title: ReactNode, options?: ToastOptions) {
  return emit("loading", title, { duration: Infinity, ...options });
}

function custom(
  render: (t: ToastData) => ReactNode,
  options: ToastOptions = {},
): string | number {
  const data = createToastData("custom", undefined, options);
  data.custom = render;
  return useToastStore.getState().upsert(data);
}

function action(
  title: ReactNode,
  options: ToastOptions & { action: NonNullable<ToastOptions["action"]> },
) {
  return emit("action", title, options);
}

function dismiss(id?: string | number) {
  useToastStore.getState().dismiss(id);
}

function update(id: string | number, patch: Partial<ToastData>) {
  useToastStore.getState().update(id, patch);
}

/** Reports determinate progress (0–1, clamped) on an existing toast —
 *  e.g. from an upload's `onprogress`. `patch` lets the same call refresh
 *  other fields, like a "42% · 2.1 MB of 5 MB" description. */
function progress(
  id: string | number,
  value: number,
  patch?: Partial<ToastData>,
) {
  const clamped = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  useToastStore.getState().update(id, { ...patch, progress: clamped });
}

function promiseToast<TData>(
  promise: Promise<TData> | (() => Promise<TData>),
  messages: PromiseToastMessages<TData>,
  options: ToastOptions = {},
): string | number {
  // genId (not a bare timestamp) so two promises started in the same
  // millisecond get separate toasts instead of overwriting each other.
  const id = options.id ?? genId();
  const data = createToastData("loading", messages.loading, {
    duration: Infinity,
    ...options,
    id,
    description:
      typeof messages.description === "function"
        ? undefined
        : (messages.description as ReactNode | undefined),
  });
  useToastStore.getState().upsert(data);

  // A function that throws synchronously (before returning a promise)
  // should surface as the error toast, not an uncaught exception.
  let actualPromise: Promise<TData>;
  try {
    actualPromise =
      typeof promise === "function" ? (promise as () => Promise<TData>)() : promise;
  } catch (err) {
    actualPromise = Promise.reject(err);
  }

  actualPromise
    .then((value) => {
      const title =
        typeof messages.success === "function"
          ? (messages.success as (d: TData) => ReactNode)(value)
          : messages.success;
      const description =
        typeof messages.description === "function"
          ? (
              messages.description as (
                d: unknown,
                s: "success" | "error",
              ) => ReactNode
            )(value, "success")
          : undefined;
      useToastStore.getState().update(id, {
        type: "success",
        title,
        description: description ?? data.description,
        // undefined falls back to the Toaster's `duration`
        duration: options.duration,
      });
    })
    .catch((err) => {
      const title =
        typeof messages.error === "function"
          ? (messages.error as (e: unknown) => ReactNode)(err)
          : messages.error;
      const description =
        typeof messages.description === "function"
          ? (
              messages.description as (
                d: unknown,
                s: "success" | "error",
              ) => ReactNode
            )(err, "error")
          : undefined;
      useToastStore.getState().update(id, {
        type: "error",
        title,
        description: description ?? data.description,
        // errors get a little longer to be read than the default
        duration:
          options.duration ??
          Math.max(5000, useToastStore.getState().defaultDuration),
      });
    });

  return id;
}

type ToastFn = ((title: ReactNode, options?: ToastOptions) => string | number) & {
  success: typeof success;
  error: typeof error;
  warning: typeof warning;
  info: typeof info;
  loading: typeof loading;
  message: typeof message;
  custom: typeof custom;
  action: typeof action;
  promise: typeof promiseToast;
  progress: typeof progress;
  dismiss: typeof dismiss;
  update: typeof update;
};

const baseFn: (title: ReactNode, options?: ToastOptions) => string | number =
  (title, options) => emit("default", title, options);

export const toast: ToastFn = Object.assign(baseFn, {
  success,
  error,
  warning,
  info,
  loading,
  message,
  custom,
  action,
  promise: promiseToast,
  progress,
  dismiss,
  update,
});
