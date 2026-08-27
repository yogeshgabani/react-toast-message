import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
});

describe("<Toaster />", () => {
  it("renders toasts into a portal on document.body", () => {
    render(<Toaster />);
    act(() => {
      toast("hello world");
    });

    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  it("shows an overflow badge once toasts exceed maxVisibleToasts", () => {
    render(<Toaster maxVisibleToasts={2} />);
    act(() => {
      toast("a");
      toast("b");
      toast("c");
    });

    expect(screen.getByText("+1 more")).toBeInTheDocument();
  });

  it("does not show an overflow badge when under the cap", () => {
    render(<Toaster maxVisibleToasts={2} />);
    act(() => {
      toast("a");
    });

    expect(screen.queryByText(/more$/)).not.toBeInTheDocument();
  });

  it("Escape dismisses the currently focused toast", () => {
    render(<Toaster />);
    let id: string | number = "";
    act(() => {
      id = toast("dismiss me");
    });

    const el = document.querySelector<HTMLElement>(
      `[data-toast-id="${id}"]`,
    );
    expect(el).not.toBeNull();

    act(() => {
      el!.focus();
      fireEvent.keyDown(window, { key: "Escape" });
    });

    expect(
      useToastStore.getState().toasts.find((t) => t.id === id),
    ).toBeUndefined();
  });

  it("Escape does nothing when no toast is focused", () => {
    render(<Toaster />);
    act(() => {
      toast("stays");
    });

    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    expect(useToastStore.getState().toasts).toHaveLength(1);
  });

  it("resolves dir=\"auto\" from the document direction", () => {
    document.documentElement.setAttribute("dir", "rtl");
    render(<Toaster />);

    const portal = document.querySelector(".rtoast-portal");
    expect(portal).toHaveAttribute("data-dir", "rtl");
  });

  it("respects an explicit dir prop over the document direction", () => {
    document.documentElement.setAttribute("dir", "rtl");
    render(<Toaster dir="ltr" />);

    const portal = document.querySelector(".rtoast-portal");
    expect(portal).toHaveAttribute("data-dir", "ltr");
  });
});
