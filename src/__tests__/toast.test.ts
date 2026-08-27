import { beforeEach, describe, expect, it } from "vitest";
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
}

beforeEach(reset);

describe("toast()", () => {
  it("creates a default toast", () => {
    toast("hello");
    const [t] = useToastStore.getState().toasts;
    expect(t?.type).toBe("default");
    expect(t?.title).toBe("hello");
  });

  it("creates typed toasts via success/error/warning/info", () => {
    toast.success("ok");
    expect(useToastStore.getState().toasts[0]?.type).toBe("success");

    toast.error("bad");
    expect(useToastStore.getState().toasts[0]?.type).toBe("error");
  });

  it("loading toasts default to an infinite duration", () => {
    toast.loading("working…");
    expect(useToastStore.getState().toasts[0]?.duration).toBe(Infinity);
  });

  it("dismiss removes a specific toast, dismiss() clears all", () => {
    const id = toast("a");
    toast("b");
    expect(useToastStore.getState().toasts).toHaveLength(2);

    toast.dismiss(id);
    expect(useToastStore.getState().toasts).toHaveLength(1);

    toast.dismiss();
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("update patches an existing toast by id", () => {
    const id = toast("initial");
    toast.update(id, { title: "changed" });
    expect(useToastStore.getState().toasts[0]?.title).toBe("changed");
  });

  it("promise() moves a toast from loading to success", async () => {
    const id = toast.promise(Promise.resolve("data"), {
      loading: "loading…",
      success: "done!",
      error: "failed",
    });

    expect(useToastStore.getState().toasts[0]?.type).toBe("loading");

    await new Promise((resolve) => setTimeout(resolve, 0));

    const resolved = useToastStore.getState().toasts.find((t) => t.id === id);
    expect(resolved?.type).toBe("success");
    expect(resolved?.title).toBe("done!");
  });

  it("promise() moves a toast from loading to error on rejection", async () => {
    const id = toast.promise(Promise.reject(new Error("nope")), {
      loading: "loading…",
      success: "done!",
      error: "failed",
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const resolved = useToastStore.getState().toasts.find((t) => t.id === id);
    expect(resolved?.type).toBe("error");
    expect(resolved?.title).toBe("failed");
  });
});
