# react-toaster-message

A modern, premium React toast notification library — Sonner-inspired, built with Framer Motion, fully accessible, SSR-safe, and tree-shakeable.

- 🎬 Smooth Framer-Motion-powered animations (slide, blur-fade, spring, scale, bounce)
- 🧱 Stack reposition with `layout` animations
- 👆 Swipe-to-dismiss (touch + mouse) with velocity detection
- 🌗 Light / dark / system / glass / gradient themes via CSS variables
- 🌈 Rich colors mode
- ⏸ Pause on hover, pause on window blur
- 📦 Queue + `maxVisibleToasts`
- ⏳ Promise toasts with loading → success / error transitions
- 🎯 Action / cancel / undo / confirmation toasts
- ♻️ `toast.update(id, …)` to mutate live toasts
- ♿ ARIA `role`, `aria-live`, reduced-motion aware, hotkey-focusable
- 🪶 Lightweight, tree-shakeable ESM + CJS builds, SSR-safe

## Install

```bash
npm install react-toaster-message framer-motion zustand
```

## Quick start

```tsx
import { Toaster, toast } from "react-toaster-message";
import "react-toaster-message/styles.css";

export default function App() {
  return (
    <>
      <button onClick={() => toast.success("File saved!")}>Save</button>
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}
```

## API

### `toast(message, options?)`

```ts
toast("Hello world");
toast.success("Saved!");
toast.error("Failed", { description: "Try again later." });
toast.warning("Heads up");
toast.info("New update");
toast.loading("Saving…");
toast.message("Plain message");
toast.custom((t) => <MyToast toast={t} />);
toast.dismiss();          // dismiss all
toast.dismiss(id);        // dismiss one
toast.update(id, { type: "success", title: "Done!" });
```

### Promise toast

```ts
toast.promise(saveUser(), {
  loading: "Saving user…",
  success: (data) => `Saved ${data.name}`,
  error: (err) => `Failed: ${err.message}`,
});
```

### Action / undo / confirmation

```ts
toast("Item moved to trash", {
  action: { label: "Undo", onClick: () => restore() },
});

toast("Delete this project?", {
  duration: Infinity,
  action: { label: "Delete", onClick: confirmDelete },
  cancel: { label: "Cancel", onClick: () => {} },
});
```

### `<Toaster />` props

| Prop                | Type                                                        | Default          |
| ------------------- | ----------------------------------------------------------- | ---------------- |
| `position`          | `top-left` / `top-center` / `top-right` / `bottom-*`        | `bottom-right`   |
| `theme`             | `light` / `dark` / `system` / `glass` / `gradient`          | `light`          |
| `richColors`        | `boolean`                                                   | `false`          |
| `closeButton`       | `boolean`                                                   | `false`          |
| `duration`          | `number`                                                    | `4000`           |
| `maxVisibleToasts`  | `number`                                                    | `3`              |
| `gap`               | `number`                                                    | `14`             |
| `offset`            | `number` / `string`                                         | `1rem`           |
| `expand`            | `boolean` (always expanded)                                 | `false`          |
| `expandOnHover`     | `boolean`                                                   | `true`           |
| `pauseOnHover`      | `boolean`                                                   | `true`           |
| `pauseOnWindowBlur` | `boolean`                                                   | `true`           |
| `animation`         | `slide` / `blur-fade` / `scale` / `spring` / `bounce`       | `slide`          |
| `dir`               | `ltr` / `rtl` / `auto`                                      | `auto`           |
| `hotkey`            | `string[]` — e.g. `["altKey", "KeyT"]`                      | `alt+T`          |
| `toastOptions`      | `Partial<ToastOptions>` — defaults applied to every toast   | `{}`             |

### Per-toast options

```ts
toast("Hi", {
  id: "custom-id",
  duration: 6000,
  dismissible: true,
  closeButton: true,
  position: "top-center",
  variant: "glass",          // default | glass | gradient
  richColors: true,
  progressBar: true,
  draggable: true,
  swipeDirection: "x",       // x | y | auto
  animation: "blur-fade",
  icon: <MyIcon />,
  description: "Subtitle",
  className: "my-class",
  style: { padding: 20 },
  classNames: { title: "my-title" },
  styles: { title: { color: "red" } },
  onDismiss: (t) => console.log("dismissed", t),
  onAutoClose: (t) => console.log("auto-closed", t),
  action: {
    label: "Undo",
    onClick: () => console.log("clicked"),
    closeOnClick: true,
  },
  cancel: {
    label: "Cancel",
    onClick: () => {},
  },
});
```

## Theming

Override any CSS variable to customize globally:

```css
.rtoast-portal {
  --rtoast-radius: 12px;
  --rtoast-bg: #fafafa;
  --rtoast-fg: #18181b;
  --rtoast-success: #22c55e;
}
```

## Accessibility

- `role="status"` for default toasts, `role="alert"` for error / warning
- `aria-live="polite"` (or `assertive` for errors)
- Respects `prefers-reduced-motion`
- Hotkey (`alt+T` by default) focuses the most recent toast

## SSR

Safe out of the box — the portal mounts only after hydration, all `window` /
`matchMedia` access is guarded inside `useEffect`.

## License

MIT License - Copyright (c) 2026 **Yogesh Gabani**

Built by **Yogesh Gabani**.
