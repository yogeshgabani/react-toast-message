import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "../src";
import type {
  AnimationPreset,
  AosAnimation,
  ToastPosition,
  ToastTheme,
} from "../src";
import "../src/styles.css";

type DemoCategory =
  | "basics"
  | "variants"
  | "interactive"
  | "animations"
  | "advanced";

type Demo = {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: DemoCategory;
  run: () => void;
};

const AOS_ANIMATIONS: AosAnimation[] = [
  "fade-up",
  "fade-down",
  "fade-left",
  "fade-right",
  "fade-up-right",
  "fade-up-left",
  "fade-down-right",
  "fade-down-left",
  "zoom-in",
  "zoom-out",
  "zoom-in-up",
  "zoom-out-down",
  "flip-up",
  "flip-down",
  "flip-left",
  "flip-right",
  "slide-up",
  "slide-down",
  "slide-left",
  "slide-right",
];

const POSITIONS: ToastPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

const ANIMATIONS: AnimationPreset[] = [
  "slide",
  "blur-fade",
  "scale",
  "spring",
  "bounce",
];

const CATEGORIES: { id: DemoCategory; label: string; hint: string }[] = [
  { id: "basics", label: "Basics", hint: "Five core toast types" },
  { id: "variants", label: "Variants", hint: "Glass, gradient, rich colors" },
  {
    id: "interactive",
    label: "Interactive",
    hint: "Actions, promises, updates",
  },
  { id: "animations", label: "Animations", hint: "AOS-inspired entrances" },
  { id: "advanced", label: "Advanced", hint: "Queue, stack & control" },
];

type GradientPalette = {
  id: string;
  label: string;
  preview: string;
  default: string;
  success: string;
  error: string;
  warning: string;
  info: string;
};

const GRADIENT_PALETTES: GradientPalette[] = [
  {
    id: "indigo",
    label: "Indigo",
    preview: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    default: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    success: "linear-gradient(135deg, #10b981, #059669)",
    error: "linear-gradient(135deg, #ef4444, #b91c1c)",
    warning: "linear-gradient(135deg, #f59e0b, #d97706)",
    info: "linear-gradient(135deg, #3b82f6, #2563eb)",
  },
  {
    id: "sunset",
    label: "Sunset",
    preview: "linear-gradient(135deg, #f97316, #db2777)",
    default: "linear-gradient(135deg, #f97316, #db2777)",
    success: "linear-gradient(135deg, #f59e0b, #84cc16)",
    error: "linear-gradient(135deg, #f43f5e, #7c2d12)",
    warning: "linear-gradient(135deg, #fbbf24, #ea580c)",
    info: "linear-gradient(135deg, #f97316, #6366f1)",
  },
  {
    id: "ocean",
    label: "Ocean",
    preview: "linear-gradient(135deg, #06b6d4, #2563eb)",
    default: "linear-gradient(135deg, #06b6d4, #2563eb)",
    success: "linear-gradient(135deg, #14b8a6, #0284c7)",
    error: "linear-gradient(135deg, #f43f5e, #1e3a8a)",
    warning: "linear-gradient(135deg, #fbbf24, #0ea5e9)",
    info: "linear-gradient(135deg, #38bdf8, #1d4ed8)",
  },
  {
    id: "forest",
    label: "Forest",
    preview: "linear-gradient(135deg, #16a34a, #064e3b)",
    default: "linear-gradient(135deg, #16a34a, #064e3b)",
    success: "linear-gradient(135deg, #22c55e, #166534)",
    error: "linear-gradient(135deg, #ef4444, #064e3b)",
    warning: "linear-gradient(135deg, #eab308, #166534)",
    info: "linear-gradient(135deg, #14b8a6, #065f46)",
  },
  {
    id: "candy",
    label: "Candy",
    preview: "linear-gradient(135deg, #ec4899, #a855f7)",
    default: "linear-gradient(135deg, #ec4899, #a855f7)",
    success: "linear-gradient(135deg, #34d399, #a855f7)",
    error: "linear-gradient(135deg, #f43f5e, #c026d3)",
    warning: "linear-gradient(135deg, #fbbf24, #ec4899)",
    info: "linear-gradient(135deg, #60a5fa, #a855f7)",
  },
];

export default function App() {
  const [theme, setTheme] = useState<ToastTheme>("light");
  const [position, setPosition] = useState<ToastPosition>("bottom-right");
  const [animation, setAnimation] = useState<AnimationPreset>("blur-fade");
  const [richColors, setRichColors] = useState(true);
  const [closeButton, setCloseButton] = useState(true);
  const [progressBar, setProgressBar] = useState(false);
  const [maxVisible, setMaxVisible] = useState<number>(Infinity);
  const [paletteId, setPaletteId] = useState<string>("indigo");
  const [activeCat, setActiveCat] = useState<DemoCategory>("basics");

  const palette = (GRADIENT_PALETTES.find((p) => p.id === paletteId) ??
    GRADIENT_PALETTES[0])!;
  const gradientVars = {
    "--rtoast-grad-default": palette.default,
    "--rtoast-grad-success": palette.success,
    "--rtoast-grad-error": palette.error,
    "--rtoast-grad-warning": palette.warning,
    "--rtoast-grad-info": palette.info,
    "--rtoast-grad-loading": palette.default,
  } as React.CSSProperties;
  const [pageTheme, setPageTheme] = useState<"light" | "dark">("dark");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.pageTheme = pageTheme;
  }, [pageTheme]);

  const snippet = `import { Toaster, toast } from "react-toaster-message";
import "react-toaster-message/styles.css";

<Toaster
  position="${position}"
  theme="${theme}"
  animation="${animation}"
  richColors={${richColors}}
  closeButton={${closeButton}}
  maxVisibleToasts={${maxVisible === Infinity ? "Infinity" : maxVisible}}
  toastOptions={{ progressBar: ${progressBar} }}
  containerStyle={{
    "--rtoast-grad-default": "${palette.default}",
    "--rtoast-grad-success": "${palette.success}",
    "--rtoast-grad-error":   "${palette.error}",
    "--rtoast-grad-warning": "${palette.warning}",
    "--rtoast-grad-info":    "${palette.info}",
  }}
/>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed", { description: "Clipboard access was blocked." });
    }
  };

  const demos: Demo[] = useMemo(
    () => [
      // Basics
      {
        id: "default",
        label: "Default",
        description: "A plain neutral toast.",
        icon: "💬",
        category: "basics",
        run: () =>
          toast("Event has been created", {
            description: "Sunday, December 03 at 9:00 AM",
          }),
      },
      {
        id: "success",
        label: "Success",
        description: "Confirm a positive outcome.",
        icon: "✅",
        category: "basics",
        run: () => toast.success("File uploaded successfully"),
      },
      {
        id: "error",
        label: "Error",
        description: "Surface failure with retry context.",
        icon: "⛔",
        category: "basics",
        run: () =>
          toast.error("Something went wrong", {
            description: "Please try again later.",
          }),
      },
      {
        id: "warning",
        label: "Warning",
        description: "Caution the user, non-blocking.",
        icon: "⚠️",
        category: "basics",
        run: () =>
          toast.warning("Heads up", { description: "Storage is almost full." }),
      },
      {
        id: "info",
        label: "Info",
        description: "Non-urgent informational note.",
        icon: "ℹ️",
        category: "basics",
        run: () => toast.info("New version available"),
      },
      {
        id: "loading",
        label: "Loading",
        description: "Indeterminate async work in progress.",
        icon: "⏳",
        category: "basics",
        run: () => toast.loading("Saving changes…"),
      },

      // Variants
      {
        id: "glass",
        label: "Glass",
        description: "Backdrop-blur, frosted look.",
        icon: "🧊",
        category: "variants",
        run: () =>
          toast.success("Glass variant", {
            variant: "glass",
            description: "Backdrop-blur premium look.",
          }),
      },
      {
        id: "gradient",
        label: "Gradient",
        description: "Soft gradient surface.",
        icon: "🎨",
        category: "variants",
        run: () => toast.success("Gradient variant", { variant: "gradient" }),
      },
      {
        id: "rich",
        label: "Rich color",
        description: "Bold semantic tinting.",
        icon: "🌈",
        category: "variants",
        run: () =>
          toast.error("Rich color error", {
            richColors: true,
            description: "High-contrast semantic styling.",
          }),
      },
      {
        id: "custom-icon",
        label: "Custom icon",
        description: "Bring your own visual.",
        icon: "✨",
        category: "variants",
        run: () =>
          toast("Custom icon", {
            icon: "🚀",
            description: "Drop in any ReactNode as the icon.",
          }),
      },

      // Interactive
      {
        id: "action",
        label: "Action / Undo",
        description: "Single primary action.",
        icon: "↩️",
        category: "interactive",
        run: () =>
          toast("Item moved to trash", {
            action: {
              label: "Undo",
              onClick: () => void toast.success("Restored"),
            },
          }),
      },
      {
        id: "confirm",
        label: "Confirmation",
        description: "Primary + cancel, sticky duration.",
        icon: "❓",
        category: "interactive",
        run: () =>
          toast("Delete project?", {
            duration: Infinity,
            action: {
              label: "Delete",
              onClick: () => void toast.success("Deleted"),
            },
            cancel: { label: "Cancel", onClick: () => {} },
          }),
      },
      {
        id: "promise",
        label: "Promise",
        description: "Loading → resolve / reject.",
        icon: "🌀",
        category: "interactive",
        run: () =>
          toast.promise(
            new Promise<{ name: string }>((res) =>
              setTimeout(() => res({ name: "report.pdf" }), 2000),
            ),
            {
              loading: "Uploading…",
              success: (data) => `Uploaded ${data.name}`,
              error: "Upload failed",
            },
          ),
      },
      {
        id: "update",
        label: "Update live",
        description: "Mutate an existing toast in place.",
        icon: "♻️",
        category: "interactive",
        run: () => {
          const id = toast.loading("Processing…");
          setTimeout(
            () =>
              toast.update(id, {
                type: "success",
                title: "Done!",
                duration: 3000,
              }),
            1500,
          );
        },
      },

      // Animations
      ...AOS_ANIMATIONS.map<Demo>((name) => ({
        id: `aos-${name}`,
        label: name,
        description: `animation="${name}"`,
        icon: "🎬",
        category: "animations",
        run: () =>
          toast(`AOS: ${name}`, {
            animation: name,
            description: `Triggered with animation="${name}"`,
          }),
      })),

      // Advanced
      {
        id: "progress",
        label: "Progress bar",
        description: "Visual countdown to auto-close.",
        icon: "📊",
        category: "advanced",
        run: () =>
          toast("With progress", {
            progressBar: true,
            duration: 5000,
            closeButton: true,
          }),
      },
      {
        id: "spam",
        label: "Stress test",
        description: "Queue 6 errors rapidly.",
        icon: "💥",
        category: "advanced",
        run: () => {
          for (let i = 1; i <= 6; i++) {
            setTimeout(
              () =>
                toast.error("Something went wrong", {
                  description: `Attempt #${i} failed.`,
                }),
              i * 120,
            );
          }
        },
      },
      {
        id: "long",
        label: "Long content",
        description: "Multi-line body wrapping.",
        icon: "📝",
        category: "advanced",
        run: () =>
          toast.info("Read the changelog", {
            description:
              "We just shipped v1.0.0 — improved swipe gestures, redesigned themes, smoother stacking with layout animations, and a tree-shakeable bundle.",
            duration: 8000,
          }),
      },
      {
        id: "sticky",
        label: "Sticky (no auto)",
        description: "Stays until dismissed.",
        icon: "📌",
        category: "advanced",
        run: () =>
          toast("Sticky toast", {
            duration: Infinity,
            closeButton: true,
            description: "This will not auto-close.",
          }),
      },
      {
        id: "dismiss",
        label: "Dismiss all",
        description: "Clear the entire stack.",
        icon: "🧹",
        category: "advanced",
        run: () => toast.dismiss(),
      },
    ],
    [],
  );

  const filtered = demos.filter((d) => d.category === activeCat);

  return (
    <div className="page">
      <style>{styles}</style>

      <header className="hero">
        <div className="hero-inner">
          <div className="hero-top">
            <div className="brand">
              <div className="brand-mark">
                <span className="dot dot-a" />
                <span className="dot dot-b" />
                <span className="dot dot-c" />
              </div>
              <span className="brand-text">react-toaster-message</span>
            </div>
            <div className="hero-actions">
              <a
                className="ghost-btn"
                href="https://www.npmjs.com/package/react-toaster-message"
                target="_blank"
                rel="noreferrer"
              >
                npm
              </a>
              <a
                className="ghost-btn"
                href="https://github.com/yogeshgabani/react-toast-message"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              <button
                className="ghost-btn icon-only"
                onClick={() =>
                  setPageTheme(pageTheme === "dark" ? "light" : "dark")
                }
                aria-label="Toggle page theme"
                title="Toggle page theme"
              >
                {pageTheme === "dark" ? "☀️" : "🌙"}
              </button>
            </div>
          </div>

          <div className="hero-content">
            <span className="pill">v1.0.0 · Framer Motion · SSR-safe</span>
            <h1 className="title">
              Premium toasts
              <br />
              <span className="title-grad">for modern React apps.</span>
            </h1>
            <p className="lede">
              A Sonner-inspired toast system with buttery animations,
              swipe-to-dismiss, promise flows, queue management, and
              tree-shakeable ESM/CJS builds.
            </p>

            <div className="hero-cta">
              <code className="install">
                <span className="prompt">$</span> npm install
                react-toaster-message
              </code>
              <button
                className="primary-btn"
                onClick={() =>
                  toast.success("Welcome 👋", {
                    description: "Pick any demo below to explore.",
                  })
                }
              >
                Try a toast
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="control-card">
          <div className="control-head">
            <h2>Live controls</h2>
            <p>Tweak the Toaster — every demo below uses these settings.</p>
          </div>

          <div className="control-grid">
            <Control label="Theme">
              <Segmented
                value={theme}
                options={
                  [
                    "light",
                    "dark",
                    "system",
                    "glass",
                    "gradient",
                  ] as ToastTheme[]
                }
                onChange={(v) => setTheme(v)}
              />
            </Control>

            <Control label="Animation">
              <Segmented
                value={animation}
                options={ANIMATIONS}
                onChange={(v) => setAnimation(v)}
              />
            </Control>

            <Control label="Position">
              <div
                className="position-grid"
                role="radiogroup"
                aria-label="Position"
              >
                {POSITIONS.map((p) => (
                  <button
                    key={p}
                    role="radio"
                    aria-checked={position === p}
                    className={`pos-btn ${position === p ? "is-active" : ""}`}
                    onClick={() => setPosition(p)}
                    title={p}
                  >
                    <span className={`pos-dot pos-${p}`} />
                  </button>
                ))}
              </div>
            </Control>

            <Control label="Gradient palette">
              <div
                className="palette-row"
                role="radiogroup"
                aria-label="Gradient palette"
              >
                {GRADIENT_PALETTES.map((p) => (
                  <button
                    key={p.id}
                    role="radio"
                    aria-checked={paletteId === p.id}
                    className={`palette-chip ${paletteId === p.id ? "is-active" : ""}`}
                    onClick={() => setPaletteId(p.id)}
                    title={p.label}
                  >
                    <span
                      className="palette-swatch"
                      style={{ background: p.preview }}
                    />
                    <span className="palette-label">{p.label}</span>
                  </button>
                ))}
              </div>
            </Control>

            <Control label="Max visible">
              <div
                className="segmented"
                role="radiogroup"
                aria-label="Max visible toasts"
              >
                {[1, 3, 5, 10, Infinity].map((n) => (
                  <button
                    key={String(n)}
                    role="radio"
                    aria-checked={maxVisible === n}
                    className={`seg ${maxVisible === n ? "is-active" : ""}`}
                    onClick={() => setMaxVisible(n)}
                  >
                    {n === Infinity ? "∞" : n}
                  </button>
                ))}
              </div>
            </Control>

            <Control label="Options">
              <div className="toggle-row">
                <Toggle
                  checked={richColors}
                  onChange={setRichColors}
                  label="Rich colors"
                />
                <Toggle
                  checked={closeButton}
                  onChange={setCloseButton}
                  label="Close button"
                />
                <Toggle
                  checked={progressBar}
                  onChange={setProgressBar}
                  label="Progress bar"
                />
              </div>
            </Control>
          </div>
        </section>

        <section className="tabs">
          <div className="tabs-bar" role="tablist">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={activeCat === c.id}
                className={`tab ${activeCat === c.id ? "is-active" : ""}`}
                onClick={() => setActiveCat(c.id)}
              >
                <span className="tab-label">{c.label}</span>
                <span className="tab-hint">{c.hint}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="demos">
          {filtered.map((d) => (
            <button key={d.id} className="demo-card" onClick={d.run}>
              <div className="demo-icon" aria-hidden>
                {d.icon}
              </div>
              <div className="demo-body">
                <div className="demo-label">{d.label}</div>
                <div className="demo-desc">{d.description}</div>
              </div>
              <div className="demo-go" aria-hidden>
                →
              </div>
            </button>
          ))}
        </section>

        <section className="snippet-card">
          <div className="snippet-head">
            <h3>Current setup</h3>
            <button
              className={`copy-btn ${copied ? "is-copied" : ""}`}
              onClick={handleCopy}
              aria-label="Copy snippet"
            >
              {copied ? (
                <>
                  <span aria-hidden>✓</span> Copied
                </>
              ) : (
                <>
                  <span aria-hidden>📋</span> Copy
                </>
              )}
            </button>
          </div>
          <pre className="snippet">{snippet}</pre>
        </section>

        <footer className="footer">
          <div>
            Built by <strong>Yogesh Gabani</strong> · MIT License
          </div>
          <div className="footer-links">
            <a
              href="https://react-toast-message.netlify.app/"
              target="_blank"
              rel="noreferrer"
            >
              Live demo
            </a>
            <a
              href="https://www.npmjs.com/package/react-toaster-message"
              target="_blank"
              rel="noreferrer"
            >
              npm
            </a>
            <a
              href="https://github.com/yogeshgabani/react-toast-message"
              target="_blank"
              rel="noreferrer"
            >
              Source
            </a>
          </div>
        </footer>
      </main>

      <Toaster
        position={position}
        theme={theme}
        richColors={richColors}
        closeButton={closeButton}
        expandOnHover
        animation={animation}
        maxVisibleToasts={maxVisible}
        toastOptions={{ progressBar }}
        containerStyle={gradientVars}
      />
    </div>
  );
}

function Control({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="control">
      <div className="control-label">{label}</div>
      <div className="control-body">{children}</div>
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="segmented" role="radiogroup" aria-label="Segmented control">
      {options.map((opt) => (
        <button
          key={opt}
          role="radio"
          aria-checked={value === opt}
          className={`seg ${value === opt ? "is-active" : ""}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className={`toggle ${checked ? "is-on" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="track">
        <span className="thumb" />
      </span>
      <span className="toggle-label">{label}</span>
    </label>
  );
}

const styles = `
:root {
  color-scheme: light dark;
}
html[data-page-theme="dark"] {
  --bg-0: #0a0a0f;
  --bg-1: #11111a;
  --bg-2: #181822;
  --surface: rgba(255,255,255,0.04);
  --surface-strong: rgba(255,255,255,0.07);
  --border: rgba(255,255,255,0.08);
  --border-strong: rgba(255,255,255,0.16);
  --text: #f4f4f6;
  --text-soft: #b4b4be;
  --text-mute: #777783;
  --accent: #a78bfa;
  --accent-2: #60a5fa;
  --accent-3: #f472b6;
  --primary-bg: linear-gradient(135deg, #8b5cf6, #6366f1);
  --primary-text: #fff;
}
html[data-page-theme="light"] {
  --bg-0: #fafafb;
  --bg-1: #f4f4f7;
  --bg-2: #ffffff;
  --surface: rgba(255,255,255,0.7);
  --surface-strong: #ffffff;
  --border: rgba(15,15,25,0.08);
  --border-strong: rgba(15,15,25,0.16);
  --text: #18181b;
  --text-soft: #4a4a55;
  --text-mute: #84848e;
  --accent: #7c3aed;
  --accent-2: #2563eb;
  --accent-3: #db2777;
  --primary-bg: linear-gradient(135deg, #7c3aed, #4f46e5);
  --primary-text: #fff;
}

* { box-sizing: border-box; }
html, body, #root { min-height: 100%; margin: 0; }
body {
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  background: var(--bg-0);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.page {
  min-height: 100vh;
  background:
    radial-gradient(1100px 600px at 80% -10%, rgba(167,139,250,0.18), transparent 60%),
    radial-gradient(900px 500px at -10% 10%, rgba(96,165,250,0.16), transparent 60%),
    radial-gradient(700px 500px at 50% 100%, rgba(244,114,182,0.10), transparent 60%),
    var(--bg-0);
}

/* HERO */
.hero {
  position: relative;
  padding: 28px 24px 56px;
  overflow: hidden;
}
.hero-inner {
  max-width: 1120px;
  margin: 0 auto;
}
.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 56px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand-mark {
  display: inline-flex;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
}
.brand-mark .dot {
  width: 8px; height: 8px; border-radius: 50%;
}
.dot-a { background: #f472b6; }
.dot-b { background: #a78bfa; }
.dot-c { background: #60a5fa; }
.brand-text {
  font-weight: 600;
  letter-spacing: -0.01em;
}

.hero-actions {
  display: flex; gap: 8px;
}
.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease, transform .15s ease;
}
.ghost-btn:hover {
  background: var(--surface-strong);
  border-color: var(--border-strong);
  transform: translateY(-1px);
}
.ghost-btn.icon-only { padding: 8px 10px; }

.hero-content { max-width: 760px; }
.pill {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-soft);
  margin-bottom: 22px;
}
.title {
  font-size: clamp(36px, 6vw, 64px);
  line-height: 1.05;
  letter-spacing: -0.035em;
  margin: 0 0 18px;
  font-weight: 700;
}
.title-grad {
  background: linear-gradient(120deg, var(--accent-3), var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.lede {
  color: var(--text-soft);
  font-size: clamp(15px, 1.6vw, 18px);
  line-height: 1.55;
  margin: 0 0 28px;
  max-width: 640px;
}
.hero-cta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}
.install {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 12px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  font-family: ui-monospace, SFMono-Regular, "Menlo", monospace;
  font-size: 13.5px;
  color: var(--text);
}
.install .prompt { color: var(--text-mute); }
.primary-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  padding: 12px 22px;
  border-radius: 12px;
  background: var(--primary-bg);
  color: var(--primary-text);
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 8px 20px -8px rgba(124,58,237,0.55);
  transition: transform .15s ease, box-shadow .15s ease, filter .15s ease;
}
.primary-btn:hover { transform: translateY(-1px); filter: brightness(1.05); }
.primary-btn:active { transform: translateY(0); }

/* MAIN */
.main {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px 80px;
  display: grid;
  gap: 28px;
}

/* CONTROL CARD */
.control-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.control-head h2 {
  margin: 0 0 4px;
  font-size: 18px;
  letter-spacing: -0.01em;
}
.control-head p {
  margin: 0 0 18px;
  color: var(--text-soft);
  font-size: 14px;
}
.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}
.control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.control-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-mute);
}

.segmented {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: var(--bg-1);
  border: 1px solid var(--border);
}
.seg {
  flex: 1 1 auto;
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--text-soft);
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 500;
  text-transform: capitalize;
  transition: background .15s ease, color .15s ease;
}
.seg:hover { color: var(--text); }
.seg.is-active {
  background: var(--surface-strong);
  color: var(--text);
  box-shadow: 0 1px 0 var(--border-strong);
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  padding: 8px;
  border-radius: 12px;
  background: var(--bg-1);
  border: 1px solid var(--border);
}
.pos-btn {
  aspect-ratio: 16 / 7;
  appearance: none;
  border: 1px dashed var(--border);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  position: relative;
  transition: border-color .15s, background .15s;
}
.pos-btn:hover { border-color: var(--border-strong); background: var(--surface); }
.pos-btn.is-active {
  border-color: var(--accent);
  border-style: solid;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}
.pos-dot {
  position: absolute;
  width: 10px; height: 10px;
  border-radius: 3px;
  background: var(--accent);
}
.pos-top-left { top: 4px; left: 4px; }
.pos-top-center { top: 4px; left: 50%; transform: translateX(-50%); }
.pos-top-right { top: 4px; right: 4px; }
.pos-bottom-left { bottom: 4px; left: 4px; }
.pos-bottom-center { bottom: 4px; left: 50%; transform: translateX(-50%); }
.pos-bottom-right { bottom: 4px; right: 4px; }

.palette-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px;
  border-radius: 12px;
  background: var(--bg-1);
  border: 1px solid var(--border);
}
.palette-chip {
  appearance: none;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 6px;
  border-radius: 999px;
  color: var(--text-soft);
  font-size: 12.5px;
  font-weight: 500;
  transition: background .15s ease, color .15s ease, border-color .15s ease;
}
.palette-chip:hover { color: var(--text); background: var(--surface); }
.palette-chip.is-active {
  background: var(--surface-strong);
  color: var(--text);
  border-color: var(--border-strong);
}
.palette-swatch {
  width: 18px; height: 18px;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  box-shadow: 0 1px 3px rgba(0,0,0,0.25);
}
.palette-label { line-height: 1; }

.toggle-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  font-size: 13.5px;
  color: var(--text-soft);
}
.toggle input { display: none; }
.toggle .track {
  position: relative;
  width: 34px; height: 20px;
  border-radius: 999px;
  background: var(--bg-1);
  border: 1px solid var(--border);
  transition: background .15s ease, border-color .15s ease;
}
.toggle .thumb {
  position: absolute;
  top: 2px; left: 2px;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: var(--text-soft);
  transition: transform .18s ease, background .15s ease;
}
.toggle.is-on .track {
  background: color-mix(in srgb, var(--accent) 35%, transparent);
  border-color: var(--accent);
}
.toggle.is-on .thumb {
  transform: translateX(14px);
  background: #fff;
}
.toggle.is-on .toggle-label { color: var(--text); }

/* TABS */
.tabs-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  backdrop-filter: blur(20px);
}
.tab {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--text-soft);
  padding: 10px 16px;
  border-radius: 12px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1 1 160px;
  transition: background .15s ease, color .15s ease;
}
.tab:hover { background: var(--surface-strong); color: var(--text); }
.tab.is-active {
  background: var(--surface-strong);
  color: var(--text);
  box-shadow: 0 1px 0 var(--border-strong);
}
.tab-label { font-weight: 600; font-size: 14px; }
.tab-hint { font-size: 12px; color: var(--text-mute); }

/* DEMOS */
.demos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
.demo-card {
  appearance: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  color: var(--text);
  backdrop-filter: blur(20px);
  transition: transform .15s ease, border-color .15s ease, background .15s ease, box-shadow .15s ease;
}
.demo-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-strong);
  background: var(--surface-strong);
  box-shadow: 0 12px 28px -18px rgba(0,0,0,0.45);
}
.demo-card:active { transform: translateY(0); }
.demo-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 18px;
  background: var(--bg-1);
  border: 1px solid var(--border);
  flex-shrink: 0;
}
.demo-body { flex: 1; min-width: 0; }
.demo-label { font-weight: 600; font-size: 14px; }
.demo-desc {
  margin-top: 2px;
  font-size: 12.5px;
  color: var(--text-mute);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.demo-go {
  color: var(--text-mute);
  font-size: 18px;
  transition: transform .15s ease, color .15s ease;
}
.demo-card:hover .demo-go {
  color: var(--accent);
  transform: translateX(3px);
}

/* SNIPPET */
.snippet-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px 24px 24px;
  backdrop-filter: blur(20px);
}
.snippet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.snippet-head h3 {
  margin: 0;
  font-size: 16px;
  letter-spacing: -0.01em;
}
.copy-btn {
  appearance: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 12.5px;
  font-weight: 500;
  transition: background .15s ease, border-color .15s ease, color .15s ease, transform .15s ease;
}
.copy-btn:hover {
  background: var(--surface-strong);
  border-color: var(--border-strong);
  transform: translateY(-1px);
}
.copy-btn:active { transform: translateY(0); }
.copy-btn.is-copied {
  color: #fff;
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: transparent;
}
.snippet {
  margin: 0;
  padding: 18px 20px;
  border-radius: 12px;
  background: var(--bg-1);
  border: 1px solid var(--border);
  font-family: ui-monospace, SFMono-Regular, "Menlo", monospace;
  font-size: 13px;
  line-height: 1.65;
  color: var(--text);
  overflow-x: auto;
}

/* FOOTER */
.footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  color: var(--text-mute);
  font-size: 13px;
}
.footer-links { display: flex; gap: 16px; }
.footer-links a {
  color: var(--text-soft);
  text-decoration: none;
  transition: color .15s ease;
}
.footer-links a:hover { color: var(--text); }

@media (max-width: 640px) {
  .hero { padding: 20px 16px 36px; }
  .hero-top { margin-bottom: 36px; }
  .main { padding: 0 16px 56px; }
  .hero-cta { flex-direction: column; align-items: stretch; }
  .install, .primary-btn { width: 100%; justify-content: center; }
}
`;
