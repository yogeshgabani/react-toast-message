import { beforeEach, describe, expect, it } from "vitest";
import { createToastData, useToastStore } from "../store";

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

describe("useToastStore", () => {
  it("adds a toast to the front of the list and returns its id", () => {
    const first = createToastData("default", "first");
    const second = createToastData("default", "second");

    useToastStore.getState().add(first);
    const id = useToastStore.getState().add(second);

    expect(id).toBe(second.id);
    expect(useToastStore.getState().toasts.map((t) => t.id)).toEqual([
      second.id,
      first.id,
    ]);
  });

  it("dismisses a single toast by id", () => {
    const a = createToastData("default", "a");
    const b = createToastData("default", "b");
    useToastStore.getState().add(a);
    useToastStore.getState().add(b);

    useToastStore.getState().dismiss(a.id);

    expect(useToastStore.getState().toasts.map((t) => t.id)).toEqual([b.id]);
  });

  it("dismisses every toast when called with no id", () => {
    useToastStore.getState().add(createToastData("default", "a"));
    useToastStore.getState().add(createToastData("default", "b"));

    useToastStore.getState().dismiss();

    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it("update patches an existing toast in place", () => {
    const toast = createToastData("loading", "loading…");
    useToastStore.getState().add(toast);

    useToastStore.getState().update(toast.id, {
      type: "success",
      title: "done",
    });

    const updated = useToastStore
      .getState()
      .toasts.find((t) => t.id === toast.id);
    expect(updated?.type).toBe("success");
    expect(updated?.title).toBe("done");
  });

  it("upsert adds when the id is new and updates when it already exists", () => {
    const toast = createToastData("loading", "loading…", { id: "p-1" });

    useToastStore.getState().upsert(toast);
    expect(useToastStore.getState().toasts).toHaveLength(1);

    useToastStore.getState().upsert({ ...toast, type: "success", title: "done" });
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0]?.type).toBe("success");
  });
});
