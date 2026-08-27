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

describe("sound", () => {
  it("plays the sound configured for a toast's type", async () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, "play");
    render(<Toaster sounds={{ success: "https://example.com/success.mp3" }} />);

    act(() => {
      toast.success("done");
    });

    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it("does not play a sound for a type with no entry in `sounds`", () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, "play");
    render(<Toaster sounds={{ success: "https://example.com/success.mp3" }} />);

    act(() => {
      toast.error("oops");
    });

    expect(playSpy).not.toHaveBeenCalled();
  });

  it("a per-toast `sound` overrides the type's entry in `sounds`", () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, "play");
    render(<Toaster sounds={{ success: "https://example.com/default.mp3" }} />);

    act(() => {
      toast.success("done", { sound: "https://example.com/custom.mp3" });
    });

    expect(playSpy).toHaveBeenCalledTimes(1);
  });

  it("`sound: false` on a toast mutes it even though `sounds` has an entry", () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, "play");
    render(<Toaster sounds={{ success: "https://example.com/success.mp3" }} />);

    act(() => {
      toast.success("done", { sound: false });
    });

    expect(playSpy).not.toHaveBeenCalled();
  });
});

describe("hotkey", () => {
  it("focuses the frontmost toast, including at a non-default position", () => {
    render(<Toaster position="bottom-right" />);

    act(() => {
      toast("top-left toast", { position: "top-left" });
    });

    act(() => {
      fireEvent.keyDown(window, { key: "t", code: "KeyT", altKey: true });
    });

    const focused = document.activeElement as HTMLElement;
    expect(focused.dataset.toastId).toBeDefined();
    expect(focused.closest("[data-position]")).toHaveAttribute(
      "data-position",
      "top-left",
    );
  });
});
