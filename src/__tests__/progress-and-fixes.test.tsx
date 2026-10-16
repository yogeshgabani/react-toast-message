import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toaster } from "../Toaster";
import { toast } from "../toast";
import { useToastStore } from "../store";

function reset() {
  useToastStore.setState({
    toasts: [],
    maxVisible: Infinity,
    defaultDuration: 4000,
    paused: false,
    windowBlurred: false,
    expanded: false,
  });
}

const getToast = (id: string | number) =>
  useToastStore.getState().toasts.find((t) => t.id === id);

beforeEach(reset);
afterEach(() => {
  cleanup();
  reset();
  vi.useRealTimers();
});

describe("toast.progress()", () => {
  it("renders a determinate bar that follows reported progress", () => {
    render(<Toaster />);
    let id: string | number = "";
    act(() => {
      id = toast.loading("Uploading…", { progress: 0 });
    });

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");

    act(() => {
      toast.progress(id, 0.42);
    });
    expect(bar).toHaveAttribute("aria-valuenow", "42");
  });

  it("clamps values outside 0–1 and can patch other fields", () => {
    const id = toast.loading("Uploading…", { progress: 0 });

    toast.progress(id, 7, { description: "almost" });
    expect(getToast(id)?.progress).toBe(1);
    expect(getToast(id)?.description).toBe("almost");

    toast.progress(id, -3);
    expect(getToast(id)?.progress).toBe(0);
  });

  it("never auto-closes while progress is being reported", () => {
    const id = toast("Exporting…", { progress: 0, duration: 1000 });
    expect(getToast(id)?.expiresAt).toBeUndefined();
  });

  it("clears progress and starts the timer once the type changes", () => {
    const id = toast.loading("Uploading…", { progress: 0.9 });

    toast.success("Uploaded!", { id });

    const t = getToast(id);
    expect(t?.type).toBe("success");
    expect(t?.progress).toBeUndefined();
    expect(typeof t?.expiresAt).toBe("number");
  });
});

describe("loading -> success via the same id", () => {
  it("auto-closes the success toast instead of staying forever", () => {
    const id = toast.loading("Saving…");
    toast.success("Saved!", { id });

    const t = getToast(id)!;
    expect(t.duration).toBeUndefined();
    expect(typeof t.expiresAt).toBe("number");
  });

  it("still honours an explicit duration on the follow-up", () => {
    const id = toast.loading("Saving…");
    toast.success("Saved!", { id, duration: Infinity });
    expect(getToast(id)?.expiresAt).toBeUndefined();
  });
});

describe("toast.promise()", () => {
  it("gives concurrent promises separate toasts", () => {
    const never = new Promise<void>(() => {});
    const a = toast.promise(never, { loading: "a", success: "ok", error: "no" });
    const b = toast.promise(never, { loading: "b", success: "ok", error: "no" });

    expect(a).not.toBe(b);
    expect(useToastStore.getState().toasts).toHaveLength(2);
  });

  it("turns a synchronous throw into the error toast", async () => {
    const id = toast.promise(
      () => {
        throw new Error("boom");
      },
      { loading: "…", success: "ok", error: (e) => (e as Error).message },
    );

    await new Promise((r) => setTimeout(r, 0));
    expect(getToast(id)?.type).toBe("error");
    expect(getToast(id)?.title).toBe("boom");
  });

  it("uses the Toaster's duration for the success state", async () => {
    useToastStore.setState({ defaultDuration: 9000 });
    const id = toast.promise(Promise.resolve(1), {
      loading: "…",
      success: "ok",
      error: "no",
    });

    await new Promise((r) => setTimeout(r, 0));
    const t = getToast(id)!;
    expect(t.expiresAt! - Date.now()).toBeGreaterThan(8000);
  });
});

describe("<Toaster /> fixes", () => {
  it("applies toastOptions.duration to auto-close timing", () => {
    render(<Toaster toastOptions={{ duration: 10000 }} />);
    let id: string | number = "";
    act(() => {
      id = toast("hello");
    });

    const t = getToast(id)!;
    expect(t.expiresAt! - t.createdAt).toBeGreaterThanOrEqual(10000);
  });

  it("pauseOnHover={false} lets a hovered toast still auto-close", () => {
    vi.useFakeTimers();
    render(<Toaster pauseOnHover={false} pauseOnWindowBlur={false} />);
    let id: string | number = "";
    act(() => {
      id = toast("bye", { duration: 1000 });
    });

    const el = document.querySelector(`[data-toast-id="${id}"]`)!;
    act(() => {
      fireEvent.mouseEnter(el);
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(getToast(id)).toBeUndefined();
  });

  it("hover pauses by default", () => {
    vi.useFakeTimers();
    render(<Toaster pauseOnWindowBlur={false} />);
    let id: string | number = "";
    act(() => {
      id = toast("stay", { duration: 1000 });
    });

    const el = document.querySelector(`[data-toast-id="${id}"]`)!;
    act(() => {
      fireEvent.mouseEnter(el);
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(getToast(id)).toBeDefined();
  });

  it("keeps the countdown bar length stable across re-renders", () => {
    render(<Toaster />);
    let id: string | number = "";
    act(() => {
      id = toast("tick", { duration: 5000, progressBar: true });
    });

    const bar = () =>
      document.querySelector<HTMLElement>(
        `[data-toast-id="${id}"] .rtoast-progress__bar`,
      )!;
    const before = bar().style.animationDuration;

    // force a re-render of the toast a little later (hover + new toast)
    const later = Date.now() + 1200;
    vi.spyOn(Date, "now").mockReturnValue(later);
    act(() => {
      fireEvent.mouseEnter(
        document.querySelector(`[data-toast-id="${id}"]`)!,
      );
      toast("another");
    });

    expect(bar().style.animationDuration).toBe(before);
  });

  it("makes non-draggable toasts reachable by the hotkey", () => {
    render(<Toaster />);
    let id: string | number = "";
    act(() => {
      id = toast("static", { draggable: false });
    });

    act(() => {
      fireEvent.keyDown(window, { key: "t", code: "KeyT", altKey: true });
    });

    expect((document.activeElement as HTMLElement).dataset.toastId).toBe(
      String(id),
    );
  });
});
