<div align="center">

# react-toaster-message

**A premium, Sonner-inspired React toast notification library.**

Framer-Motion animations · swipe-to-dismiss · promise toasts · FIFO stagger · 6 themes · 14 visual variants · rich colors · a11y · SSR-safe · TypeScript-first.

[![npm](https://img.shields.io/npm/v/react-toaster-message.svg?color=4f46e5&style=flat-square)](https://www.npmjs.com/package/react-toaster-message)
[![types](https://img.shields.io/badge/types-included-3178c6?style=flat-square)](#api)
[![license](https://img.shields.io/badge/license-MIT-emerald?style=flat-square)](./LICENSE)
[![bundle](https://img.shields.io/badge/tree--shakable-✓-10b981?style=flat-square)](#ssr)

</div>

A modern, premium React toast notification library — Sonner-inspired, built with Framer Motion, fully accessible, SSR-safe, and tree-shakeable.

🔗 **Live demo:** [https://react-toast-message.netlify.app/](https://react-toast-message.netlify.app/)

- 🎬 Smooth Framer-Motion-powered animations (slide, blur-fade, spring, scale, bounce)
- 🧱 Stack reposition with `layout` animations
- 👆 Swipe-to-dismiss (touch + mouse) with velocity detection
- 🌗 Light / dark / system / glass / gradient / accent themes via CSS variables
- 🎨 14 visual variants — glass, gradient, accent, solid, soft, outline, neon, and 6 border-bar styles (`left/right/x/top/bottom/y-border`)
- 🌈 Rich colors mode
- ⏸ Pause on hover, pause on window blur
- 📦 Sonner-style collapsed stack (expand on hover) + `maxVisibleToasts`
- ⏳ Promise toasts with loading → success / error transitions
- 🎯 Action / cancel / undo / confirmation toasts
- ♻️ `toast.update(id, …)` to mutate live toasts
- 🔊 Optional sound + mobile vibration, per toast type or per individual toast
- 🎯 `container` prop to mount the portal anywhere (shadow root, modal, …)
- ♿ ARIA `role`, `aria-live`, reduced-motion aware, hotkey-focusable, arrow-key toast navigation, Escape-to-dismiss
- 🪶 Lightweight, tree-shakeable ESM + CJS builds, SSR-safe

## What's new in v1.3.0

**Added**

- Optional **sound** per toast type or per individual toast (`sounds`, `soundVolume`, `sound`) — the library ships no audio files, nothing plays until you point it at a URL.
- Optional **mobile vibration** per toast type or per individual toast (`vibrate`), using the same shape as sound.
- **`container` prop** — mount the toast portal anywhere (a shadow root, a specific stacking context, a second scoped `<Toaster />`) instead of always `document.body`.
- **Overflow indicator** — a `+N more` badge appears when `maxVisibleToasts` hides older toasts, instead of them silently expiring with no trace.
- **`Escape`** dismisses whichever toast is currently focused; **`↓`/`↑`** arrow keys jump between toasts once one has focus.
- `toast.error(err)` now accepts an `Error` object directly and uses `err.message` (or `err.name`) as the title — a plain string still works as before.
- First test suite (Vitest + React Testing Library, `npm test`) covering the store, the `toast()` API, and `<Toaster />` behaviour.

**Fixed**

- `dir="auto"` (the default) never actually resolved to `rtl`, so the RTL CSS (icon/text order, accent bar side) silently never engaged even on an RTL page. Now resolved from the document's real direction, and kept in sync if it changes.
- `hotkey` only searched the Toaster's default position for a toast to focus, missing any toast rendered at a per-toast `position` override. Now searches the whole portal.

**Changed**

- Center-positioned toasts with an explicit `swipeDirection: "x"` now feel biased toward the natural swipe-away direction for the resolved `dir` (mirrored in RTL).

## Install

**1. Install the package** (peer deps included):

```bash
npm install react-toaster-message framer-motion zustand
```

**2. Import the stylesheet** — required, otherwise toasts will render unstyled / invisible:

```ts
import "react-toaster-message/styles.css";
```

> Put this once at the root of your app (e.g. `main.tsx` / `_app.tsx` / `layout.tsx`).
> Next.js 13+ App Router and Vite both support importing CSS from `node_modules` directly.

## Quick start

The bare minimum — render `<Toaster />` once at the root of your app, then call
`toast()` from anywhere:

```tsx
// app entry — e.g. main.tsx
import "react-toaster-message/styles.css";

import { Toaster, toast } from "react-toaster-message";

export default function App() {
  return (
    <>
      <button onClick={() => toast.success("File saved!")}>Save</button>
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}
```

### Full `<Toaster />` reference (every prop, with comments)

Copy-paste this once into your app — every option is documented inline so you
know what to keep and what to remove:

```tsx
import "react-toaster-message/styles.css";
import { Toaster } from "react-toaster-message";

<Toaster
  /* ─── Placement ──────────────────────────────────────────────── */
  position="bottom-right"        // top-left | top-center | top-right |
                                 // bottom-left | bottom-center | bottom-right
  offset="1rem"                  // distance from the viewport edge (number = px)
  gap={14}                       // pixels between toasts when expanded
  dir="auto"                     // ltr | rtl | auto — mirrors layout (icon/text
                                 //   order, accent bar side) and, for
                                 //   center-positioned toasts, which way
                                 //   feels natural to swipe away

  /* ─── Look & feel ───────────────────────────────────────────── */
  theme="light"                  // light | dark | system | glass | gradient |
                                 //   accent (left color bar on every toast)
  richColors                     // bold semantic tint per type (success/error/…)
  closeButton                    // show ✕ on every toast
  animation="slide"              // slide | blur-fade | scale | spring | bounce
                                 //   …or any AOS-style preset: fade-up,
                                 //   zoom-in, flip-left, slide-right, etc.

  /* ─── Stack behaviour ───────────────────────────────────────── */
  maxVisibleToasts={Infinity}    // how many are on screen at once.
                                 //   The NEWEST toasts always show — older
                                 //   ones slide out and keep expiring in the
                                 //   background (sonner-style). Default: Infinity.
  expand={false}                 // false (default) = collapsed stack: older
                                 //   toasts peek out behind the newest one.
                                 //   true = always show every toast at full
                                 //   size in a list.
  expandOnHover                  // when collapsed, hovering the stack expands
                                 //   the whole stack into the full list;
                                 //   collapses again on mouse leave.

  /* ─── Timing ────────────────────────────────────────────────── */
  duration={4000}                // default auto-close time in ms.
                                 //   Pass Infinity (or `duration: Infinity`
                                 //   per-toast) to disable auto-close.
  pauseOnHover                   // hover any toast → all timers pause
  pauseOnWindowBlur              // tab/window blur → timers pause

  /* ─── Keyboard / a11y ───────────────────────────────────────── */
  hotkey={["altKey", "KeyT"]}    // press Alt+T anywhere on the page →
                                 //   focuses the frontmost toast (any
                                 //   position). From there: Tab moves
                                 //   through its action/cancel/close
                                 //   buttons, ↑/↓ arrows jump between
                                 //   toasts, Escape dismisses the focused
                                 //   one. Modifier keys (altKey/ctrlKey/
                                 //   metaKey/shiftKey) + a KeyboardEvent.code
                                 //   (e.g. "KeyT", "Digit1"). Set to `[]`
                                 //   or `undefined` to disable.

  /* ─── Sound & vibration ─────────────────────────────────────── */
  sounds={{                      // per-type sound URLs — no sound plays
    success: "/sounds/success.mp3", //   for a type with no entry here (the
    error:   "/sounds/error.mp3",   //   library ships no audio files, so
  }}                              //   nothing plays unless you set this)
  soundVolume={0.6}              // 0–1, applies to every `sounds` entry
                                 //   (and to a per-toast `sound` override)
  vibrate={{                     // per-type vibration pattern (ms, or an
    error: 200,                  //   on/off/on/… array). Mobile only —
    success: [40, 30, 40],       //   silently does nothing on desktop /
  }}                              //   browsers without the Vibration API.

  /* ─── Defaults applied to every toast call ──────────────────── */
  toastOptions={{
    progressBar: false,          // visual countdown bar
    closeButton: true,           // overrideable per toast()
    classNames: { toast: "my-toast" },
    styles:     { toast: { borderRadius: 12 } },
  }}

  /* ─── Portal target (advanced) ──────────────────────────────── */
  container={() => document.getElementById("modal-root")}
                                 // where the toast portal mounts — an
                                 //   element, or a function returning one.
                                 //   Defaults to `document.body`. Use this
                                 //   to render inside a shadow root, a
                                 //   specific stacking context (e.g. so
                                 //   toasts stay above an open modal), or
                                 //   to keep two `<Toaster />`s scoped to
                                 //   different parts of the page.

  /* ─── Custom container styling (advanced) ───────────────────── */
  containerClassName="my-portal"
  containerStyle={{
    // any CSS variable from styles.css can be overridden here, e.g.:
    // ["--rtoast-radius" as any]: "12px",
    // ["--rtoast-bg" as any]:     "#fafafa",
  }}
/>;
```

### Calling `toast()` — every per-toast option

```tsx
import { toast } from "react-toaster-message";

// ─── Built-in types (auto-styled, auto a11y role) ────────────────
toast("Hello world");                       // default
toast.success("Saved!");
toast.error("Failed", { description: "Try again later." });
toast.error(err);                           // err is an Error → uses err.message
                                            //   (or err.name if message is empty).
                                            //   A plain string still works as before.
toast.warning("Heads up");
toast.info("New update available");
toast.loading("Saving…");                   // stays until dismissed/updated
toast.message("Plain message");             // alias of toast(...)

// ─── Full options bag (everything is optional) ──────────────────
toast("Item moved to trash", {
  id: "trash-1",                            // pass an id to update/dismiss later
  description: "You can undo within 5s.",
  duration: 5000,                           // override the global default
  position: "top-center",                   // per-toast position override
  variant: "glass",                         // default | glass | gradient | accent |
                                            //   solid | soft | outline | neon |
                                            //   left-border | right-border | x-border |
                                            //   top-border | bottom-border | y-border
                                            //   accent  = rounded color bar on the left
                                            //   solid   = bold filled surface per type
                                            //   soft    = pastel tint + colored text
                                            //   outline = colored border, clean card
                                            //   neon    = dark card with glowing edge
                                            //   *-border = rounded color bar on that
                                            //   edge (x = both sides, y = top+bottom)
  richColors: true,                         // semantic tint just for this toast
  progressBar: true,                        // visual countdown bar
  closeButton: true,                        // show ✕
  dismissible: true,                        // false = ignore swipe/✕
  draggable: true,                          // swipe-to-dismiss on/off
  swipeDirection: "x",                      // x | y | auto

  icon: "🗑️",                                // any ReactNode (string/JSX/svg)
  animation: "blur-fade",                   // override the global animation
  sound: "/sounds/ding.mp3",                // overrides the Toaster's `sounds`
                                            //   map for this toast; `false`
                                            //   mutes it even if `sounds` has
                                            //   an entry for its type
  vibrate: 200,                             // overrides the Toaster's `vibrate`
                                            //   map for this toast (ms, or an
                                            //   on/off/on/… array); `false` mutes it

  className: "my-toast",                    // attached to the toast <li>
  style: { padding: 20 },
  classNames: { title: "my-title", description: "my-desc" },
  styles:     { title: { color: "crimson" } },

  action: {                                 // primary button on the right
    label: "Undo",
    onClick: () => restore(),
    closeOnClick: true,                     // dismiss after click (default true)
  },
  cancel: {                                 // secondary/ghost button
    label: "Cancel",
    onClick: () => {},
  },

  onDismiss:   (t) => console.log("dismissed (any reason)", t.id),
  onAutoClose: (t) => console.log("dismissed by timer",     t.id),
});

// ─── Programmatic control ───────────────────────────────────────
const id = toast.loading("Uploading…");
toast.update(id, { type: "success", title: "Uploaded!", duration: 3000 });
toast.dismiss(id);     // dismiss one
toast.dismiss();       // dismiss all

// ─── Fully custom render ────────────────────────────────────────
toast.custom((t) => <MyOwnToast toast={t} onClose={() => toast.dismiss(t.id)} />);
```

## API

### Promise toast — loading → success / error

`toast.promise()` shows a loading toast that resolves to a success or error
toast when the promise settles. Great for save/upload/fetch flows:

```tsx
toast.promise(saveUser(), {
  loading: "Saving user…",
  success: (data) => `Saved ${data.name}`,        // string or ReactNode
  error:   (err)  => `Failed: ${err.message}`,    // string or ReactNode
  description: (data, state) =>                   // optional second line
    state === "success" ? "All set." : "Try again in a moment.",
});

// Also accepts a function form (lazy):
toast.promise(() => fetch("/api/me").then((r) => r.json()), {
  loading: "Loading…",
  success: "Done",
  error:   "Failed",
});
```

### Confirmation / undo

```tsx
// Undo pattern — auto-dismisses, but offers a quick action while visible
toast("Item moved to trash", {
  action: { label: "Undo", onClick: () => restore() },
});

// Modal-ish confirmation — sticky until user picks
toast("Delete this project?", {
  duration: Infinity,                            // never auto-close
  action: { label: "Delete", onClick: confirmDelete },
  cancel: { label: "Cancel", onClick: () => {} },
});
```

### Sound

The library ships **no audio files** — nothing plays unless you point it at
a sound (an `.mp3`/`.wav`/`.ogg` URL: a path under your `public/` folder, or
a hosted file). Map a URL per toast type on `<Toaster sounds={...} />`:

```tsx
<Toaster
  sounds={{
    success: "/sounds/success.mp3",
    error: "/sounds/error.mp3",
  }}
  soundVolume={0.6}              // 0–1, defaults to 1
/>
```

**Effect:** with the config above, `toast.success(...)` plays
`success.mp3` and `toast.error(...)` plays `error.mp3`; every other type
(`default`, `warning`, `info`, `loading`, …) stays silent since it has no
entry in the map. A `toast.promise()` loading → success transition plays
the *success* sound the moment it resolves (loading itself stays silent
unless you add a `loading` entry too).

Override or mute it per call:

```tsx
toast.success("Saved!", { sound: "/sounds/custom-ding.mp3" }); // this call only
toast.success("Saved quietly", { sound: false });              // never plays, even with `sounds` set
```

Browsers block audio before any user interaction with the page (autoplay
policy) — a sound triggered by a `toast()` call from a click handler plays
fine; one fired on page load, before the user has clicked/typed anything,
may be silently blocked. That failure is swallowed rather than thrown.

### Vibration (mobile haptics)

Same shape as sound, using the same `Partial<Record<ToastType, …>>` map —
this time of vibration patterns instead of URLs:

```tsx
<Toaster
  vibrate={{
    error: 200,              // one 200ms buzz
    success: [40, 30, 40],   // buzz, pause 30ms, buzz — on/off/on/… pairs
  }}
/>
```

**Effect:** `toast.error(...)` triggers a 200ms vibration, `toast.success(...)`
a double-tap pattern; every other type stays silent (no entry in the map).
Override or mute per call the same way as sound —
`toast.error("bad", { vibrate: 400 })` or `{ vibrate: false }`.

Only does anything on devices/browsers that support the
[Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
— mobile Chrome/Firefox on Android, mainly. Desktop browsers and iOS Safari
don't implement it, so this is a no-op there rather than an error.

### Custom mount target

By default the toast portal renders into `document.body`. Point it
elsewhere with `container`:

```tsx
<Toaster container={() => document.getElementById("modal-root")} />
```

**Effect:** toasts render inside `#modal-root` instead of `document.body` —
useful when an open modal/dialog traps focus or sits in its own stacking
context and toasts need to render inside it to stay visible/reachable, when
rendering inside a shadow root, or when running two independent
`<Toaster />`s that need to stay visually scoped to different parts of the
page. If the function returns `null`/`undefined` (e.g. the element isn't
mounted yet), it falls back to `document.body`.

### Keyboard shortcuts

```tsx
<Toaster hotkey={["altKey", "KeyT"]} />   // default — change or set to [] to disable
```

**Effect:**

- **`Alt` + `T`** (or whatever `hotkey` is set to) — jumps focus to the
  frontmost toast on screen, at any position. Useful for keyboard-only
  users who don't want to `Tab` through the rest of the page first.
- **`Tab`**, once a toast is focused — moves into its action / cancel /
  close buttons.
- **`↓` / `↑`** (arrow keys), while a toast is focused — jumps to the
  next / previous toast, wrapping around at the ends. Does nothing when
  focus isn't on a toast, so it never hijacks arrow keys used elsewhere on
  the page (a `<select>`, a text input, …).
- **`Escape`**, while a toast (or one of its buttons) is focused — dismisses
  that toast, the same as clicking its ✕. Toasts created with
  `dismissible: false` ignore it, same as they ignore the close button and
  swipe.

`hotkey` accepts any combination of the modifier keys (`altKey`, `ctrlKey`,
`metaKey`, `shiftKey`) plus one `KeyboardEvent.code`, e.g.
`["ctrlKey", "shiftKey", "KeyN"]` for Ctrl+Shift+N.

### `<Toaster />` props (cheat-sheet)

Full annotated reference is in [Quick start](#quick-start) above. Defaults:

| Prop                | Type                                                      | Default        |
| ------------------- | --------------------------------------------------------- | -------------- |
| `position`          | `top-left` / `top-center` / `top-right` / `bottom-*`      | `bottom-right` |
| `theme`             | `light`/`dark`/`system`/`glass`/`gradient`/`accent`       | `light`        |
| `richColors`        | `boolean`                                                 | `false`        |
| `closeButton`       | `boolean`                                                 | `false`        |
| `duration`          | `number`                                                  | `4000`         |
| `maxVisibleToasts`  | `number`                                                  | `Infinity`     |
| `gap`               | `number`                                                  | `14`           |
| `offset`            | `number` / `string`                                       | `1rem`         |
| `expand`            | `boolean` (`false` = collapsed stack, `true` = full list) | `false`        |
| `expandOnHover`     | `boolean` (hovering the stack expands it)                 | `true`         |
| `pauseOnHover`      | `boolean`                                                 | `true`         |
| `pauseOnWindowBlur` | `boolean`                                                 | `true`         |
| `animation`         | `slide` / `blur-fade` / `scale` / `spring` / `bounce`     | `slide`        |
| `dir`               | `ltr` / `rtl` / `auto`                                    | `auto`         |
| `hotkey`            | `string[]` — e.g. `["altKey", "KeyT"]`                    | `alt+T`        |
| `sounds`            | `Partial<Record<ToastType, string>>` — sound URL per type | `undefined`    |
| `soundVolume`       | `number` (0–1)                                             | `1`            |
| `vibrate`           | `Partial<Record<ToastType, number \| number[]>>`          | `undefined`    |
| `container`         | `Element` / `() => Element \| null \| undefined`          | `document.body`|
| `toastOptions`      | `Partial<ToastOptions>` — defaults applied to every toast | `{}`           |

### Per-toast options

See the fully-commented `toast(...)` block in [Quick start](#quick-start) for
every per-call option (`description`, `action`, `cancel`, `icon`, `variant`,
`richColors`, `progressBar`, `draggable`, `swipeDirection`, `sound`, `vibrate`,
`onDismiss`, `onAutoClose`, `className(s)`, `style(s)`, …).

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

## Gradient colors

Use `theme="gradient"` to apply gradients to every toast, or `variant: "gradient"` per-toast.
The gradient backgrounds are driven by six CSS variables — override them to pick your own palette:

| Variable                | Applied to       | Default                                     |
| ----------------------- | ---------------- | ------------------------------------------- |
| `--rtoast-grad-default` | `default` toasts | `linear-gradient(135deg, #6366f1, #8b5cf6)` |
| `--rtoast-grad-success` | `success` toasts | `linear-gradient(135deg, #10b981, #059669)` |
| `--rtoast-grad-error`   | `error` toasts   | `linear-gradient(135deg, #ef4444, #b91c1c)` |
| `--rtoast-grad-warning` | `warning` toasts | `linear-gradient(135deg, #f59e0b, #d97706)` |
| `--rtoast-grad-info`    | `info` toasts    | `linear-gradient(135deg, #3b82f6, #2563eb)` |
| `--rtoast-grad-loading` | `loading` toasts | inherits `--rtoast-grad-default`            |

### Globally via CSS

```css
.rtoast-portal {
  --rtoast-grad-default: linear-gradient(135deg, #ec4899, #a855f7);
  --rtoast-grad-success: linear-gradient(135deg, #14b8a6, #0284c7);
  --rtoast-grad-error: linear-gradient(135deg, #f43f5e, #7c2d12);
}
```

### Inline via the `<Toaster>` (per-instance)

```tsx
<Toaster
  theme="gradient"
  containerStyle={
    {
      "--rtoast-grad-default": "linear-gradient(135deg, #ec4899, #a855f7)",
      "--rtoast-grad-success": "linear-gradient(135deg, #14b8a6, #0284c7)",
      "--rtoast-grad-error": "linear-gradient(135deg, #f43f5e, #7c2d12)",
    } as React.CSSProperties
  }
/>
```

The CSS variables also drive the per-toast `variant: "gradient"`, so you can mix and match — keep the
base theme `light`/`dark` and call `toast.success("…", { variant: "gradient" })` for one-off gradient toasts.

## Accessibility

- `role="status"` for default toasts, `role="alert"` for error / warning
- `aria-live="polite"` (or `assertive` for errors)
- Respects `prefers-reduced-motion`
- Hotkey (`alt+T` by default) focuses the frontmost toast, `↓`/`↑` move between toasts — see [Keyboard shortcuts](#keyboard-shortcuts)
- `Escape`, while a toast is focused, dismisses it (unless `dismissible: false`)
- The overflow badge (when `maxVisibleToasts` hides older toasts) is `aria-live="polite"` so screen readers announce the hidden count

## SSR

Safe out of the box — the portal mounts only after hydration, all `window` /
`matchMedia` access is guarded inside `useEffect`.

## License

MIT License - Copyright (c) 2026 **Yogesh Gabani**

Built by **Yogesh Gabani**.
