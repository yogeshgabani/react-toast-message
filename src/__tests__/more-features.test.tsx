import { act, cleanup, fireEvent, render } from "@testing-library/react";
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
    expanded: false,
  });
  document.documentElement.removeAttribute("dir");
}

beforeEach(reset);
afterEach(() => {
  cleanup();
  reset();
  vi.restoreAllMocks();
});

describe("toast.error() with an Error object", () => {
  it("uses the Error's message as the title", () => {
    render(<Toaster />);
    act(() => {
      toast.error(new Error("network down"));
    });

    expect(useToastStore.getState().toasts[0]?.title).toBe("network down");
  });

  it("falls back to the Error's name when message is empty", () => {
    render(<Toaster />);
    act(() => {
      const err = new Error("");
      err.name = "AbortError";
      toast.error(err);
    });

    expect(useToastStore.getState().toasts[0]?.title).toBe("AbortError");
  });

  it("still accepts a plain string as before", () => {
    render(<Toaster />);
    act(() => {
      toast.error("plain failure");
    });

    expect(useToastStore.getState().toasts[0]?.title).toBe("plain failure");
  });
});

describe("vibrate", () => {
  it("vibrates using the pattern configured for a toast's type", () => {
    const vibrateSpy = vi.fn().mockReturnValue(true);
    Object.assign(navigator, { vibrate: vibrateSpy });

    render(<Toaster vibrate={{ error: 200 }} />);
    act(() => {
      toast.error("bad");
    });

    expect(vibrateSpy).toHaveBeenCalledWith(200);
  });

  it("a per-toast `vibrate: false` mutes it even with a type entry", () => {
    const vibrateSpy = vi.fn().mockReturnValue(true);
    Object.assign(navigator, { vibrate: vibrateSpy });

    render(<Toaster vibrate={{ error: 200 }} />);
    act(() => {
      toast.error("bad", { vibrate: false });
    });

    expect(vibrateSpy).not.toHaveBeenCalled();
  });
});

describe("container prop", () => {
  it("mounts the portal into a custom element instead of document.body", () => {
    const custom = document.createElement("div");
    custom.id = "custom-portal-root";
    document.body.appendChild(custom);

    render(<Toaster container={custom} />);
    act(() => {
      toast("inside custom root");
    });

    expect(custom.querySelector(".rtoast-portal")).not.toBeNull();
    document.body.removeChild(custom);
  });
});

describe("arrow-key navigation", () => {
  it("ArrowDown moves focus to the next toast", () => {
    render(<Toaster />);
    let firstId: string | number = "";
    let secondId: string | number = "";
    act(() => {
      firstId = toast("first");
      secondId = toast("second");
    });

    // Newest toast is rendered first in DOM order (front of the stack).
    const secondEl = document.querySelector<HTMLElement>(
      `[data-toast-id="${secondId}"]`,
    )!;
    act(() => {
      secondEl.focus();
      fireEvent.keyDown(window, { key: "ArrowDown" });
    });

    const firstEl = document.querySelector<HTMLElement>(
      `[data-toast-id="${firstId}"]`,
    )!;
    expect(document.activeElement).toBe(firstEl);
  });

  it("does nothing when focus is outside any toast", () => {
    render(<Toaster />);
    act(() => {
      toast("first");
      toast("second");
    });

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    act(() => {
      fireEvent.keyDown(window, { key: "ArrowDown" });
    });

    expect(document.activeElement).toBe(input);
    document.body.removeChild(input);
  });
});
