import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Toaster, toast } from "../src";
import type {
  AnimationPreset,
  AosAnimation,
  ToastPosition,
  ToastTheme,
  ToastVisualVariant,
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
  /** Copy-paste-ready source for this demo — shown live in the
   *  "Current setup" snippet when the card is clicked. */
  code: string;
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

const VARIANTS: ToastVisualVariant[] = [
  "default",
  "accent",
  "solid",
  "soft",
  "outline",
  "neon",
  "glass",
  "gradient",
  "left-border",
  "right-border",
  "x-border",
  "top-border",
  "bottom-border",
  "y-border",
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

/* ───────── Site stats (photo-style strip) + What's New changelog ───────── */

const SITE_LAST_UPDATED = "August 27, 2026";
const STATS_NAMESPACE = "react-toaster-message-demo";
const SESSION_VISIT_FLAG = "rtm_visited";
const WHATS_NEW_STORAGE_KEY = "rtm-whatsnew-seen";

type ChangelogSectionKind =
  | "added"
  | "changed"
  | "fixed"
  | "technical"
  | "docs";
type ChangelogSection = {
  kind: ChangelogSectionKind;
  title: string;
  items: string[];
};
type ChangelogEntry = {
  version: string;
  date: string;
  highlight?: string;
  isLatest?: boolean;
  sections: ChangelogSection[];
};

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.3.0",
    date: "August 27, 2026",
    highlight:
      "Optional sound + mobile vibration per toast, a custom portal `container`, an overflow indicator, Escape/arrow-key toast navigation, and a first test suite.",
    isLatest: true,
    sections: [
      {
        kind: "added",
        title: "Added",
        items: [
          "**Sound** per toast type or per individual toast (`sounds`, `soundVolume`, `sound`) — no audio ships with the library; nothing plays until you set a URL.",
          "**Mobile vibration** per toast type or per individual toast (`vibrate`), same shape as sound.",
          "**`container` prop** — mount the portal anywhere (shadow root, a specific stacking context, a second scoped `<Toaster />`) instead of always `document.body`.",
          "**Overflow indicator** — a `+N more` badge when `maxVisibleToasts` hides older toasts.",
          "**`Escape`** dismisses the focused toast; **`↓`/`↑`** arrow keys jump between toasts.",
          "`toast.error(err)` accepts an `Error` object directly and uses `err.message`/`err.name` as the title.",
          "First test suite (Vitest + React Testing Library, `npm test`).",
        ],
      },
      {
        kind: "fixed",
        title: "Fixed",
        items: [
          "`dir=\"auto\"` never resolved to `rtl`, so RTL CSS silently never engaged even on an RTL page — now resolved from the document's real direction.",
          "`hotkey` only searched the default position for a toast to focus, missing per-toast `position` overrides — now searches the whole portal.",
        ],
      },
    ],
  },
  {
    version: "1.2.0",
    date: "August 11, 2026",
    highlight:
      "Sonner-style collapsed stack, 11 new visual variants (accent, solid, soft, outline, neon + 6 border-bar styles), accent theme, and smarter maxVisibleToasts.",
    sections: [
      {
        kind: "added",
        title: "Added",
        items: [
          "**Sonner-style collapsed stack** — older toasts tuck behind the newest one; hovering the stack expands it into the full list (`expand` / `expandOnHover`).",
          "**11 new visual variants** — `accent`, `solid`, `soft`, `outline`, `neon`, plus 6 border-bar styles: `left-border`, `right-border`, `x-border`, `top-border`, `bottom-border`, `y-border`.",
          "**`theme=\"accent\"`** — rounded color bar on every toast in the portal.",
          "Demo playground: variant selector, custom gradient color picker, and a live copy-paste snippet that mirrors your selections.",
        ],
      },
      {
        kind: "changed",
        title: "Changed",
        items: [
          "**`maxVisibleToasts` is now sonner-style** — the newest toasts always show and the oldest slide out (previously new toasts waited in a hidden queue). Hidden toasts keep expiring in the background.",
          "An explicit per-toast `variant` (`glass`, `gradient`, …) now wins over the global `richColors` flag.",
        ],
      },
      {
        kind: "fixed",
        title: "Fixed",
        items: [
          "Gradient/glass variant backgrounds were painted over when `richColors` was enabled.",
          "React `forwardRef` warning from `AnimatePresence`'s popLayout mode.",
        ],
      },
      {
        kind: "technical",
        title: "Technical",
        items: [
          "Internal `queue` array and `promote()` were removed from `useToastStore` — the `toast` API and all `<Toaster />` props are unchanged.",
        ],
      },
    ],
  },
  {
    version: "1.1.1",
    date: "June 3, 2026",
    highlight:
      "Polish release — smoother default toast animation timing out of the box.",
    sections: [
      {
        kind: "changed",
        title: "Changed",
        items: [
          "**Default animation tuned** — the `Toaster` now ships with refined enter/exit animation settings for a smoother feel without any config.",
          "Demo playground defaults updated to match the new animation settings.",
        ],
      },
    ],
  },
  {
    version: "1.1.0",
    date: "June 3, 2026",
    highlight:
      "FIFO-accurate auto-dismissal via absolute expiry timestamps, unlimited visible toasts by default, and system color-scheme support.",
    sections: [
      {
        kind: "added",
        title: "Added",
        items: [
          "**Absolute expiry timestamps** — every toast now carries an `expiresAt` value, so toasts always dismiss in FIFO order even when many are created in the same instant.",
          "**Stagger effect** — the store computes expiry times with a small stagger, so rapid-fire toasts leave one by one instead of vanishing together.",
          "**System color-scheme support** — styles now respect the OS light/dark preference.",
          "Optional `expiresAt` property exposed on the toast data type.",
        ],
      },
      {
        kind: "changed",
        title: "Changed",
        items: [
          "`Toaster` allows an **infinite number of visible toasts** by default (`maxVisibleToasts={Infinity}`).",
          "`ToastItem` uses the new expiry logic with adjusted duration handling.",
          "Improved CSS for better visual consistency and hover effects.",
        ],
      },
      {
        kind: "docs",
        title: "Documentation",
        items: [
          "README overhauled — new sections covering queue behaviour, expiry timing and the refreshed demo playground.",
        ],
      },
    ],
  },
  {
    version: "1.0.0",
    date: "May 25, 2026",
    highlight: "First stable release — the API now follows semver.",
    sections: [
      {
        kind: "added",
        title: "Added",
        items: [
          "Complete toast API — `toast()`, `toast.success` / `error` / `warning` / `info` / `loading`, `toast.promise`, `toast.update` and `toast.dismiss`.",
          "Five animation presets (slide, blur-fade, scale, spring, bounce) plus 20 AOS-inspired entrance animations.",
          "Variants — glass, gradient, accent bars and rich semantic colors, with custom gradient palettes via CSS variables.",
          "Six positions, swipe-to-dismiss, queue management with `maxVisibleToasts`, expand-on-hover stacking.",
          "Action / cancel buttons, progress bar, custom icons, sticky (non-expiring) toasts.",
          "Themes — light, dark, system, glass and gradient. SSR-safe rendering.",
        ],
      },
      {
        kind: "technical",
        title: "Technical",
        items: [
          "Tree-shakeable ESM + CJS dual build powered by Framer Motion.",
          "Sticky navigation and scroll-to-top button on the demo site.",
        ],
      },
    ],
  },
];

const LATEST_VERSION = CHANGELOG[0]!.version;

/* Renders the tiny markdown-ish syntax used in changelog items:
   **bold** and `code`. Deterministic content, so a full parser is
   unnecessary — mirrors the approach of highlightCode below. */
function renderRich(text: string): ReactNode[] {
  const re = /\*\*([^*]+)\*\*|`([^`]+)`/g;
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      m[1] !== undefined ? (
        <strong key={key++}>{m[1]}</strong>
      ) : (
        <code key={key++} className="wn-code">
          {m[2]}
        </code>
      ),
    );
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}

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

/* ── Live visitor stats — free counter API (abacus.jasoncameron.dev).
   "hits" increments on every load; "visitors" only once per browser
   session (sessionStorage flag). Fails silently to "—" offline. ── */
type VisitorStats = {
  hits: number | null;
  visitors: number | null;
};

function useVisitorStats(): VisitorStats {
  const [stats, setStats] = useState<VisitorStats>({
    hits: null,
    visitors: null,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchJson = async (url: string) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = (await res.json()) as { value?: number };
        return typeof data.value === "number" ? data.value : null;
      } catch {
        return null;
      }
    };

    const load = async () => {
      const hitsUrl = `https://abacus.jasoncameron.dev/hit/${STATS_NAMESPACE}/hits`;
      const alreadyVisited =
        typeof window !== "undefined" &&
        window.sessionStorage.getItem(SESSION_VISIT_FLAG) === "1";
      const visitorsUrl = alreadyVisited
        ? `https://abacus.jasoncameron.dev/get/${STATS_NAMESPACE}/visitors`
        : `https://abacus.jasoncameron.dev/hit/${STATS_NAMESPACE}/visitors`;

      const [hits, visitors] = await Promise.all([
        fetchJson(hitsUrl),
        fetchJson(visitorsUrl),
      ]);

      if (cancelled) return;
      if (!alreadyVisited && visitors !== null) {
        window.sessionStorage.setItem(SESSION_VISIT_FLAG, "1");
      }
      setStats({ hits, visitors });
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}

/* Eases a number from 0 → target so the stat cards count up on load. */
function useCountUp(target: number | null, durationMs = 1400): number | null {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    if (target === null) {
      setValue(null);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

const formatStat = (n: number | null) =>
  n === null ? "—" : n.toLocaleString("en-US");

/* Tiny regex highlighter for the generated snippet — the snippet is our
   own deterministic output, so a full parser isn't needed. */
function highlightCode(code: string): ReactNode[] {
  const re =
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(import|from|const|let|for|return|new)\b|\b(toast|Toaster)\b|\b(\d+|Infinity|true|false)\b/g;
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const cls = m[1]
      ? "tok-comment"
      : m[2]
        ? "tok-string"
        : m[3]
          ? "tok-kw"
          : m[4]
            ? "tok-fn"
            : "tok-num";
    out.push(
      <span key={key++} className={cls}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  out.push(code.slice(last));
  return out;
}

export default function App() {
  const [theme, setTheme] = useState<ToastTheme>("light");
  const [position, setPosition] = useState<ToastPosition>("bottom-right");
  const [animation, setAnimation] = useState<AnimationPreset>("blur-fade");
  const [richColors, setRichColors] = useState(true);
  const [closeButton, setCloseButton] = useState(true);
  const [progressBar, setProgressBar] = useState(false);
  // Visual variant applied to every toast via toastOptions
  const [variant, setVariant] = useState<ToastVisualVariant>("default");
  const [expand, setExpand] = useState(false);
  const [maxVisible, setMaxVisible] = useState<number>(Infinity);
  // null = no palette selected (library default colors)
  const [paletteId, setPaletteId] = useState<string | null>(null);
  // Custom gradient picker (paletteId === "custom")
  const [customFrom, setCustomFrom] = useState("#6366f1");
  const [customTo, setCustomTo] = useState("#ec4899");
  // Theme to restore when the palette is removed (picking a palette
  // force-switches the theme to "gradient").
  const prevThemeRef = useRef<ToastTheme>("light");
  const [activeCat, setActiveCat] = useState<DemoCategory>("basics");
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null);

  const customGrad = `linear-gradient(135deg, ${customFrom}, ${customTo})`;
  const customPalette: GradientPalette = {
    id: "custom",
    label: "Custom",
    preview: customGrad,
    default: customGrad,
    success: customGrad,
    error: customGrad,
    warning: customGrad,
    info: customGrad,
  };
  const palette =
    paletteId === "custom"
      ? customPalette
      : (GRADIENT_PALETTES.find((p) => p.id === paletteId) ??
          GRADIENT_PALETTES[0])!;
  const gradientVars = {
    "--rtoast-grad-default": palette.default,
    "--rtoast-grad-success": palette.success,
    "--rtoast-grad-error": palette.error,
    "--rtoast-grad-warning": palette.warning,
    "--rtoast-grad-info": palette.info,
    "--rtoast-grad-loading": palette.default,
  } as React.CSSProperties;

  // Selecting a palette switches the theme to "gradient" so every toast
  // shows the colors immediately; removing it restores the previous theme.
  const applyPalette = (id: string, label: string, desc: string) => {
    if (theme !== "gradient") prevThemeRef.current = theme;
    setPaletteId(id);
    setTheme("gradient");
    toast.success(`${label} palette applied`, {
      id: "palette-preview",
      variant: "gradient",
      description: desc,
    });
  };
  const removePalette = () => {
    setPaletteId(null);
    if (theme === "gradient") setTheme(prevThemeRef.current);
    toast("Palette removed", {
      id: "palette-preview",
      // The preview toast is reused via its fixed id, so explicitly reset
      // the variant — otherwise the old "gradient" variant sticks around.
      variant: "default",
      description: "Back to the default look.",
    });
  };
  const [pageTheme, setPageTheme] = useState<"light" | "dark">("dark");
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // What's New modal — the trigger pill shows a pulsing dot until the
  // visitor has opened the latest release notes at least once.
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const [whatsNewSeen, setWhatsNewSeen] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(WHATS_NEW_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const hasUnseenWhatsNew = whatsNewSeen !== LATEST_VERSION;
  const openWhatsNew = () => {
    setWhatsNewOpen(true);
    if (hasUnseenWhatsNew) {
      try {
        window.localStorage.setItem(WHATS_NEW_STORAGE_KEY, LATEST_VERSION);
      } catch {
        /* localStorage blocked — the dot just stays */
      }
      setWhatsNewSeen(LATEST_VERSION);
    }
  };

  // Live site stats for the bottom strip
  const { hits, visitors } = useVisitorStats();
  const hitsAnim = useCountUp(hits);
  const visitorsAnim = useCountUp(visitors);

  useEffect(() => {
    document.documentElement.dataset.pageTheme = pageTheme;
  }, [pageTheme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Build the copy-paste snippet with ONLY the props that differ from the
  // library defaults — a fresh user shouldn't copy noise like
  // `expand={false}` or `maxVisibleToasts={Infinity}`.
  const buildSnippet = (activeDemo: Demo | null) => {
    const props: string[] = [];
    if (position !== "bottom-right") props.push(`position="${position}"`);
    if (theme !== "light") props.push(`theme="${theme}"`);
    if (animation !== "slide") props.push(`animation="${animation}"`);
    if (richColors) props.push("richColors");
    if (closeButton) props.push("closeButton");
    if (expand) props.push("expand");
    if (maxVisible !== Infinity) props.push(`maxVisibleToasts={${maxVisible}}`);
    const toastOpts: string[] = [];
    if (variant !== "default") toastOpts.push(`variant: "${variant}"`);
    if (progressBar) toastOpts.push("progressBar: true");
    if (toastOpts.length > 0)
      props.push(`toastOptions={{ ${toastOpts.join(", ")} }}`);
    if (paletteId && paletteId !== "indigo") {
      props.push(`containerStyle={{
    "--rtoast-grad-default": "${palette.default}",
    "--rtoast-grad-success": "${palette.success}",
    "--rtoast-grad-error":   "${palette.error}",
    "--rtoast-grad-warning": "${palette.warning}",
    "--rtoast-grad-info":    "${palette.info}",
  }}`);
    }

    const toaster =
      props.length === 0
        ? "<Toaster />"
        : props.length === 1 && !props[0]!.includes("\n")
          ? `<Toaster ${props[0]} />`
          : `<Toaster\n  ${props.join("\n  ")}\n/>`;

    return `import { Toaster, toast } from "react-toaster-message";
import "react-toaster-message/styles.css";

/* Fire toasts from anywhere${activeDemo ? ` — ${activeDemo.label}` : ""} */
${activeDemo?.code ?? `toast.success("Hello from react-toaster-message!");`}

/* Mount once at your app root */
${toaster}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed", {
        description: "Clipboard access was blocked.",
      });
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
        code: `toast("Event has been created", {
  description: "Sunday, December 03 at 9:00 AM",
});`,
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
        code: `toast.success("File uploaded successfully");`,
        run: () => toast.success("File uploaded successfully"),
      },
      {
        id: "error",
        label: "Error",
        description: "Surface failure with retry context.",
        icon: "⛔",
        category: "basics",
        code: `toast.error("Something went wrong", {
  description: "Please try again later.",
});`,
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
        code: `toast.warning("Heads up", {
  description: "Storage is almost full.",
});`,
        run: () =>
          toast.warning("Heads up", { description: "Storage is almost full." }),
      },
      {
        id: "info",
        label: "Info",
        description: "Non-urgent informational note.",
        icon: "ℹ️",
        category: "basics",
        code: `toast.info("New version available");`,
        run: () => toast.info("New version available"),
      },
      {
        id: "loading",
        label: "Loading",
        description: "Indeterminate async work in progress.",
        icon: "⏳",
        category: "basics",
        code: `toast.loading("Saving changes…");`,
        run: () => toast.loading("Saving changes…"),
      },

      // Variants
      {
        id: "glass",
        label: "Glass",
        description: "Backdrop-blur, frosted look.",
        icon: "🧊",
        category: "variants",
        code: `toast.success("Glass variant", {
  variant: "glass",
  description: "Backdrop-blur premium look.",
});`,
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
        code: `toast.success("Gradient variant", { variant: "gradient" });`,
        run: () => toast.success("Gradient variant", { variant: "gradient" }),
      },
      {
        id: "accent",
        label: "Accent bars",
        description: "Left color bar, clean surface.",
        icon: "🖍️",
        category: "variants",
        code: `toast.success("Profile updated", { variant: "accent" });
toast.info("Signed out", { variant: "accent" });
toast.warning("Storage almost full", { variant: "accent" });
toast.error("Payment failed", { variant: "accent" });`,
        run: () => {
          const fire = [
            () => toast.success("Profile updated", { variant: "accent" }),
            () => toast.info("Signed out", { variant: "accent" }),
            () => toast.warning("Storage almost full", { variant: "accent" }),
            () => toast.error("Payment failed", { variant: "accent" }),
          ];
          fire.forEach((fn, i) => setTimeout(fn, i * 220));
        },
      },
      {
        id: "solid",
        label: "Solid",
        description: "Bold filled surface per type.",
        icon: "🟩",
        category: "variants",
        code: `toast.success("Payment received", { variant: "solid" });
toast.error("Payment failed", { variant: "solid" });`,
        run: () => {
          toast.success("Payment received", { variant: "solid" });
          setTimeout(
            () => toast.error("Payment failed", { variant: "solid" }),
            220,
          );
        },
      },
      {
        id: "soft",
        label: "Soft",
        description: "Pastel tint, colored text.",
        icon: "🌸",
        category: "variants",
        code: `toast.success("Draft saved", { variant: "soft" });
toast.info("Syncing…", { variant: "soft" });`,
        run: () => {
          toast.success("Draft saved", { variant: "soft" });
          setTimeout(() => toast.info("Syncing…", { variant: "soft" }), 220);
        },
      },
      {
        id: "outline",
        label: "Outline",
        description: "Colored border, clean card.",
        icon: "⭕",
        category: "variants",
        code: `toast.warning("Session expiring", { variant: "outline" });
toast.info("New comment", { variant: "outline" });`,
        run: () => {
          toast.warning("Session expiring", { variant: "outline" });
          setTimeout(
            () => toast.info("New comment", { variant: "outline" }),
            220,
          );
        },
      },
      {
        id: "neon",
        label: "Neon",
        description: "Dark card, glowing edge.",
        icon: "💡",
        category: "variants",
        code: `toast.success("Deploy complete", { variant: "neon" });
toast.error("Build failed", { variant: "neon" });`,
        run: () => {
          toast.success("Deploy complete", { variant: "neon" });
          setTimeout(
            () => toast.error("Build failed", { variant: "neon" }),
            220,
          );
        },
      },
      {
        id: "border-bars",
        label: "Border bars",
        description: "left / right / x / top / bottom / y",
        icon: "📐",
        category: "variants",
        code: `toast.success("Profile updated", { variant: "left-border" });
toast.info("New message", { variant: "right-border" });
toast.warning("Low storage", { variant: "x-border" });
toast.success("Draft saved", { variant: "top-border" });
toast.error("Upload failed", { variant: "bottom-border" });
toast.info("Syncing…", { variant: "y-border" });`,
        run: () => {
          const fire = [
            () =>
              toast.success("left-border", { variant: "left-border" }),
            () => toast.info("right-border", { variant: "right-border" }),
            () => toast.warning("x-border", { variant: "x-border" }),
            () => toast.success("top-border", { variant: "top-border" }),
            () =>
              toast.error("bottom-border", { variant: "bottom-border" }),
            () => toast.info("y-border", { variant: "y-border" }),
          ];
          fire.forEach((fn, i) => setTimeout(fn, i * 200));
        },
      },
      {
        id: "rich",
        label: "Rich color",
        description: "Bold semantic tinting.",
        icon: "🌈",
        category: "variants",
        code: `toast.error("Rich color error", {
  richColors: true,
  description: "High-contrast semantic styling.",
});`,
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
        code: `toast("Custom icon", {
  icon: "🚀",
  description: "Drop in any ReactNode as the icon.",
});`,
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
        code: `toast("Item moved to trash", {
  action: {
    label: "Undo",
    onClick: () => toast.success("Restored"),
  },
});`,
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
        code: `toast("Delete project?", {
  duration: Infinity,
  action: {
    label: "Delete",
    onClick: () => toast.success("Deleted"),
  },
  cancel: { label: "Cancel", onClick: () => {} },
});`,
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
        code: `toast.promise(uploadFile(), {
  loading: "Uploading…",
  success: (data) => \`Uploaded \${data.name}\`,
  error: "Upload failed",
});`,
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
        code: `const id = toast.loading("Processing…");
// …later, when the work finishes:
toast.update(id, {
  type: "success",
  title: "Done!",
  duration: 3000,
});`,
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
        code: `toast("AOS: ${name}", {
  animation: "${name}",
  description: 'Triggered with animation="${name}"',
});`,
        run: () => {
          // Sync the Toaster-level animation control too, so the live
          // snippet's <Toaster animation="…"> reflects the selection.
          setAnimation(name);
          toast(`AOS: ${name}`, {
            animation: name,
            description: `Triggered with animation="${name}"`,
          });
        },
      })),

      // Advanced
      {
        id: "progress",
        label: "Progress bar",
        description: "Visual countdown to auto-close.",
        icon: "📊",
        category: "advanced",
        code: `toast("With progress", {
  progressBar: true,
  duration: 5000,
  closeButton: true,
});`,
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
        code: `for (let i = 1; i <= 6; i++) {
  toast.error("Something went wrong", {
    description: \`Attempt #\${i} failed.\`,
  });
}`,
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
        code: `toast.info("Read the changelog", {
  description:
    "We just shipped v1.0.0 — improved swipe gestures, " +
    "redesigned themes, and smoother stacking.",
  duration: 8000,
});`,
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
        code: `toast("Sticky toast", {
  duration: Infinity,
  closeButton: true,
  description: "This will not auto-close.",
});`,
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
        code: `toast.dismiss(); // no id = clear every toast`,
        run: () => toast.dismiss(),
      },
    ],
    [],
  );

  const filtered = demos.filter((d) => d.category === activeCat);

  // Live snippet: reflects the current Toaster controls AND the last demo
  // card the user clicked, ready to copy-paste.
  const activeDemo = demos.find((d) => d.id === activeDemoId) ?? null;
  const snippet = buildSnippet(activeDemo);

  return (
    <div className="page">
      <style>{styles}</style>

      <nav
        className={`sticky-nav ${scrolled ? "is-visible" : ""}`}
        aria-hidden={!scrolled}
      >
        <div className="sticky-nav-inner">
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
              className={`ghost-btn whatsnew-btn ${hasUnseenWhatsNew ? "has-unseen" : ""}`}
              onClick={openWhatsNew}
              aria-label="What's new"
              title="What's new"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 2l2.39 5.16L20 8.27l-4 3.9.94 5.52L12 15l-4.94 2.69L8 12.17l-4-3.9 5.61-1.11L12 2z" />
              </svg>
              <span className="whatsnew-label">What's new</span>
              {hasUnseenWhatsNew && (
                <span className="whatsnew-dot" aria-hidden="true" />
              )}
            </button>
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
      </nav>

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
                className={`ghost-btn whatsnew-btn ${hasUnseenWhatsNew ? "has-unseen" : ""}`}
                onClick={openWhatsNew}
                aria-label="What's new"
                title="What's new"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M12 2l2.39 5.16L20 8.27l-4 3.9.94 5.52L12 15l-4.94 2.69L8 12.17l-4-3.9 5.61-1.11L12 2z" />
                </svg>
                <span className="whatsnew-label">What's new</span>
                {hasUnseenWhatsNew && (
                  <span className="whatsnew-dot" aria-hidden="true" />
                )}
              </button>
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
            <span className="pill">V1.3.0 · Framer Motion · SSR-safe</span>
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
              <div className="install-stack">
                <CopyableLine
                  className="install"
                  copyText="npm install react-toaster-message"
                  label="Copy install command"
                >
                  <span className="prompt">$</span> npm install
                  react-toaster-message
                </CopyableLine>
                <CopyableLine
                  className="install install--import"
                  copyText={`import "react-toaster-message/styles.css";`}
                  label="Copy CSS import"
                >
                  <span className="import-kw">import</span>{" "}
                  <span className="import-str">
                    "react-toaster-message/styles.css"
                  </span>
                  ;
                </CopyableLine>
              </div>
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
                    "accent",
                  ] as ToastTheme[]
                }
                onChange={(v) => {
                  setTheme(v);
                  // Instant live preview of the chosen theme
                  toast.success(`${v} theme`, {
                    id: "theme-preview",
                    description: "Every toast now uses this theme.",
                  });
                }}
              />
            </Control>

            <Control label="Animation">
              <Segmented
                value={animation}
                options={ANIMATIONS}
                onChange={(v) => setAnimation(v)}
              />
            </Control>

            <Control label="Variant">
              <Segmented
                value={variant}
                options={VARIANTS}
                onChange={(v) => {
                  setVariant(v);
                  // Instant live preview of the chosen design (fixed id =
                  // re-picking just updates the same toast).
                  toast.success(
                    v === "default" ? "Default variant" : `${v} variant`,
                    {
                      id: "variant-preview",
                      variant: v,
                      description: "Every toast will now use this design.",
                    },
                  );
                }}
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
                    onClick={() =>
                      paletteId === p.id
                        ? removePalette()
                        : applyPalette(
                            p.id,
                            p.label,
                            "Every toast now uses these colors. Click the chip again to remove.",
                          )
                    }
                    title={
                      paletteId === p.id
                        ? `${p.label} — click again to remove`
                        : p.label
                    }
                  >
                    <span
                      className="palette-swatch"
                      style={{ background: p.preview }}
                    />
                    <span className="palette-label">{p.label}</span>
                  </button>
                ))}

                {/* Custom gradient — pick both stops with native color
                    pickers; changes apply live to every toast. */}
                <div
                  role="radio"
                  aria-checked={paletteId === "custom"}
                  tabIndex={0}
                  className={`palette-chip palette-chip--custom ${
                    paletteId === "custom" ? "is-active" : ""
                  }`}
                  onClick={() =>
                    paletteId === "custom"
                      ? removePalette()
                      : applyPalette(
                          "custom",
                          "Custom",
                          `${customFrom} → ${customTo}`,
                        )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      paletteId === "custom"
                        ? removePalette()
                        : applyPalette(
                            "custom",
                            "Custom",
                            `${customFrom} → ${customTo}`,
                          );
                    }
                  }}
                  title={
                    paletteId === "custom"
                      ? "Custom — click again to remove"
                      : "Pick your own gradient"
                  }
                >
                  <span
                    className="palette-swatch"
                    style={{ background: customGrad }}
                  />
                  <span className="palette-label">Custom</span>
                  <input
                    type="color"
                    className="palette-color-input"
                    value={customFrom}
                    aria-label="Gradient start color"
                    title="Gradient start color"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      setCustomFrom(e.target.value);
                      applyPalette(
                        "custom",
                        "Custom",
                        `${e.target.value} → ${customTo}`,
                      );
                    }}
                  />
                  <input
                    type="color"
                    className="palette-color-input"
                    value={customTo}
                    aria-label="Gradient end color"
                    title="Gradient end color"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      setCustomTo(e.target.value);
                      applyPalette(
                        "custom",
                        "Custom",
                        `${customFrom} → ${e.target.value}`,
                      );
                    }}
                  />
                </div>
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

            <Control label="Options" className="control--options">
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
                <Toggle checked={expand} onChange={setExpand} label="Expand" />
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
            <button
              key={d.id}
              className={`demo-card ${activeDemoId === d.id ? "is-selected" : ""}`.trim()}
              onClick={() => {
                d.run();
                setActiveDemoId(d.id);
              }}
            >
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
            <h3>
              Current setup
              {activeDemo && (
                <span className="snippet-demo-tag">· {activeDemo.label}</span>
              )}
            </h3>
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
          <div className="code-window">
            <div className="code-window-bar">
              <span className="cw-dot cw-red" />
              <span className="cw-dot cw-yellow" />
              <span className="cw-dot cw-green" />
              <span className="cw-file">App.tsx</span>
            </div>
            <pre className="snippet">
              <code>{highlightCode(snippet)}</code>
            </pre>
          </div>
        </section>

        <footer className="footer-card">
          <div className="footer-glow" aria-hidden />
          {/* footer title */}
          <div className="footer-row footer-row-top">
            <div className="footer-brand">
              <div className="brand-mark footer-mark">
                <span className="dot dot-a" />
                <span className="dot dot-b" />
                <span className="dot dot-c" />
              </div>
              <div className="footer-brand-text">
                <div className="footer-brand-name">react-toaster-message</div>
                <div className="footer-brand-tag">
                  Premium toasts for modern React apps
                </div>
              </div>
            </div>

            <div className="footer-actions">
              <a
                className="footer-btn"
                href="https://github.com/yogeshgabani/react-toast-message"
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.96 10.96 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.12 3.04.73.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.68.41.35.78 1.04.78 2.11v3.12c0 .31.21.67.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
                </svg>
                GitHub
              </a>
              <a
                className="footer-btn"
                href="https://www.npmjs.com/package/react-toaster-message"
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
                </svg>
                npm
              </a>
              <a
                className="footer-btn"
                href="https://react-toast-message.netlify.app/"
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
                Demos
              </a>
            </div>
          </div>

          <div className="footer-divider" />

          {/* Social media — env-driven, falls back to a "Coming soon" toast */}
          <div className="connect-row">
            <div className="connect-headline">
              <span className="connect-grad">Connect with Yogesh</span>
              <span className="connect-sep">—</span>
              <span className="connect-tag">
                follow for updates &amp; new releases
              </span>
            </div>
            <SocialIcons />
          </div>

          {/* footer end data */}
          <div className="footer-row footer-row-bottom">
            <div className="footer-meta">
              <div className="footer-meta-row">
                <span className="mit-badge">MIT</span>
                <span className="footer-dot">·</span>
                <span>© 2026 react-toaster-message</span>
              </div>
              <div className="footer-meta-row footer-crafted">
                Crafted with <span className="heart">♥</span> for the React
                community
              </div>
            </div>

            <a
              className="footer-author"
              href="https://github.com/yogeshgabani"
              target="_blank"
              rel="noreferrer"
            >
              Built by <strong>Yogesh Gabani</strong>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
        </footer>
      </main>

      {/* ── Site stats strip — full-width bar pinned to the page bottom ── */}
      <div className="stats-strip">
        <div className="stats-strip-inner">
          <div className="stat-card">
            <span className="stat-icon" aria-hidden>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </span>
            <span className="stat-body">
              <span className="stat-label">Last Updated</span>
              <span className="stat-value">{SITE_LAST_UPDATED}</span>
            </span>
          </div>

          <div className="stat-card">
            <span className="stat-icon" aria-hidden>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            <span className="stat-body">
              <span className="stat-label">Total Hits</span>
              <span className="stat-value stat-num">
                {formatStat(hitsAnim)}
              </span>
            </span>
          </div>

          <div className="stat-card stat-card--highlight">
            <span className="stat-icon" aria-hidden>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </span>
            <span className="stat-body">
              <span className="stat-label">
                Total Visitors
                <span className="stat-live" aria-label="live">
                  <span className="stat-live-dot" />
                  LIVE
                </span>
              </span>
              <span className="stat-value stat-num">
                {formatStat(visitorsAnim)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {whatsNewOpen && <WhatsNewModal onClose={() => setWhatsNewOpen(false)} />}

      <button
        className={`scroll-top-btn ${scrolled ? "is-visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Back to top"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </button>

      <Toaster
        position={position}
        theme={theme}
        richColors={richColors}
        closeButton={closeButton}
        expand={expand}
        expandOnHover
        animation={animation}
        maxVisibleToasts={maxVisible}
        toastOptions={{ progressBar, variant }}
        containerStyle={gradientVars}
      />
    </div>
  );
}

function Control({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`control ${className ?? ""}`.trim()}>
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

/* A code-pill that has an inline copy button on the right. Used by the
   hero install block so users can grab the npm command and the CSS import
   in one click each. */
function CopyableLine({
  copyText,
  label,
  className,
  children,
}: {
  copyText: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Copy failed", {
        description: "Clipboard access was blocked.",
      });
    }
  };

  return (
    <code className={`${className ?? ""} copyable`.trim()}>
      <span className="copyable-text">{children}</span>
      <button
        type="button"
        className={`copyable-btn ${copied ? "is-copied" : ""}`}
        onClick={handleCopy}
        aria-label={copied ? "Copied" : label}
        title={copied ? "Copied!" : label}
      >
        {copied ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
        )}
      </button>
    </code>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   <SocialIcons />

   URLs come from the env (Vite `import.meta.env.VITE_SOCIAL_*`). When a key
   is missing or blank, clicking the icon opens a small "Data Not Available"
   modal instead of navigating.

   To wire real URLs: copy `examples/.env.example` → `examples/.env.local`
   and fill in the values you want.
   ─────────────────────────────────────────────────────────────────────────── */

interface SocialLink {
  key: string;
  label: string;
  href: string;
  brand: string; // brand color used on hover (light theme / default)
  brandDark?: string; // optional override for dark theme (use when `brand` has poor contrast on dark bg)
  icon: ReactNode;
}

const BRAND_GRADIENT =
  "linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #6366f1 100%)";
const BRAND_SHADOW =
  "0 8px 20px -8px rgba(168, 85, 247, 0.55), 0 2px 6px rgba(99, 102, 241, 0.25)";

/** Tracks the demo page's light/dark mode by observing the data attribute
 *  that App.tsx already sets on <html>. Self-contained so the social-icons
 *  block stays decoupled from App's state. */
function useTheme() {
  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "dark";
    return (
      (document.documentElement.dataset.pageTheme as "light" | "dark") || "dark"
    );
  });

  useEffect(() => {
    const read = () =>
      setResolvedMode(
        (document.documentElement.dataset.pageTheme as "light" | "dark") ||
          "dark",
      );
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-page-theme"],
    });
    return () => obs.disconnect();
  }, []);

  return { resolvedMode };
}

const SOCIALS: SocialLink[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    href: import.meta.env.VITE_SOCIAL_WHATSAPP || "",
    brand: "#25D366",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    href: import.meta.env.VITE_SOCIAL_INSTAGRAM || "",
    brand: "#E4405F",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07M12 0C8.741 0 8.332.014 7.052.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.052.014 8.332 0 8.741 0 12s.014 3.668.072 4.948c.085 1.855.601 3.697 1.942 5.038 1.341 1.341 3.183 1.857 5.038 1.942C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.855-.085 3.697-.601 5.038-1.942 1.341-1.341 1.857-3.183 1.942-5.038.058-1.28.072-1.689.072-4.948s-.014-3.668-.072-4.948c-.085-1.855-.601-3.697-1.942-5.038C20.645.673 18.803.157 16.948.072 15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324ZM12 16a4 4 0 110-8 4 4 0 010 8Zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881Z" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    href: import.meta.env.VITE_SOCIAL_FACEBOOK || "",
    brand: "#1877F2",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 11.005 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.017 1.792-4.687 4.533-4.687 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.255h3.328l-.532 3.49h-2.796V24C19.612 23.078 24 18.092 24 12.073Z" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    href: import.meta.env.VITE_SOCIAL_YOUTUBE || "",
    brand: "#FF0000",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
      </svg>
    ),
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    href: import.meta.env.VITE_SOCIAL_TWITTER || "",
    brand: "#0F1419",
    brandDark: "#E7E9EA",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
      </svg>
    ),
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: import.meta.env.VITE_SOCIAL_LINKEDIN || "",
    brand: "#0A66C2",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
      </svg>
    ),
  },
  {
    key: "github",
    label: "GitHub",
    href: import.meta.env.VITE_SOCIAL_GITHUB || "",
    brand: "#24292F",
    brandDark: "#F0F6FC",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.52 11.52 0 013-.405c1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12Z" />
      </svg>
    ),
  },
];

function SocialIcons({ size = 36 }: { size?: number }) {
  const { resolvedMode } = useTheme();
  const isDark = resolvedMode === "dark";
  const [missing, setMissing] = useState<SocialLink | null>(null);

  // ESC closes the unavailable-link modal
  useEffect(() => {
    if (!missing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMissing(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [missing]);

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {SOCIALS.map((s) => {
          const hoverColor = isDark && s.brandDark ? s.brandDark : s.brand;
          const available = Boolean(s.href);
          return (
            <a
              key={s.key}
              href={available ? s.href : "#"}
              target={available ? "_blank" : undefined}
              rel="noreferrer noopener"
              aria-label={available ? s.label : `${s.label} — not available`}
              title={available ? s.label : `${s.label} — not configured yet`}
              onClick={(e) => {
                if (!available) {
                  e.preventDefault();
                  setMissing(s);
                }
              }}
              style={{
                width: size,
                height: size,
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "inherit",
                background: "color-mix(in srgb, currentColor 4%, transparent)",
                border:
                  "1px solid color-mix(in srgb, currentColor 12%, transparent)",
                textDecoration: "none",
                transition: "all 180ms ease",
                opacity: available ? 1 : 0.65,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `color-mix(in srgb, ${hoverColor} 14%, transparent)`;
                e.currentTarget.style.borderColor = `color-mix(in srgb, ${hoverColor} 55%, transparent)`;
                e.currentTarget.style.color = hoverColor;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "color-mix(in srgb, currentColor 4%, transparent)";
                e.currentTarget.style.borderColor =
                  "color-mix(in srgb, currentColor 12%, transparent)";
                e.currentTarget.style.color = "inherit";
                e.currentTarget.style.transform = "";
              }}
            >
              {s.icon}
            </a>
          );
        })}
      </div>
      {missing && (
        <SocialUnavailableModal
          social={missing}
          onClose={() => setMissing(null)}
        />
      )}
    </>
  );
}

function SocialUnavailableModal({
  social,
  onClose,
}: {
  social: SocialLink;
  onClose: () => void;
}) {
  // Match the chip's contrast logic: brands like X (#0F1419) and GitHub
  // (#24292F) disappear against a dark modal surface, so fall back to the
  // `brandDark` override in dark mode.
  const { resolvedMode } = useTheme();
  const isDark = resolvedMode === "dark";
  const displayBrand =
    isDark && social.brandDark ? social.brandDark : social.brand;

  // Prevent body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Render via portal so the fixed-positioned backdrop is centered on the
  // viewport, not trapped inside an ancestor that creates a containing
  // block (e.g. `.footer-card` uses `backdrop-filter`, which — together with
  // `filter` / `transform` / `perspective` — confines `position: fixed`
  // descendants to that ancestor's box).
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rnl-social-modal-title"
      aria-describedby="rnl-social-modal-desc"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.58)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: 380,
          width: "100%",
          background: "var(--bg-2)",
          color: "inherit",
          borderRadius: 16,
          padding: "32px 24px 24px",
          border: "1px solid color-mix(in srgb, currentColor 12%, transparent)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.4)",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Top gradient border */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background:
              "linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
          }}
        />

        {/* Close X (top-right) */}
        <button
          aria-label="Close"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 30,
            height: 30,
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            fontSize: 20,
            lineHeight: 1,
            opacity: 0.55,
            transition: "opacity 160ms, background 160ms",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.background =
              "color-mix(in srgb, currentColor 8%, transparent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.55";
            e.currentTarget.style.background = "transparent";
          }}
        >
          ×
        </button>

        {/* Big social icon — uses brandDark in dark mode so deeply-tinted
            brands (X #0F1419, GitHub #24292F) stay visible against the
            dark modal surface. */}
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 16px",
            borderRadius: "50%",
            background: `color-mix(in srgb, ${displayBrand} 16%, transparent)`,
            color: displayBrand,
            border: `1px solid color-mix(in srgb, ${displayBrand} 35%, transparent)`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ transform: "scale(1.7)" }}>{social.icon}</div>
        </div>

        <h3
          id="rnl-social-modal-title"
          style={{
            margin: "0 0 8px",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          Data Not Available
        </h3>
        <p
          id="rnl-social-modal-desc"
          style={{
            margin: "0 0 20px",
            fontSize: 13,
            color: "var(--text-mute, #52525b)",
            lineHeight: 1.55,
          }}
        >
          The <strong style={{ color: "inherit" }}>{social.label}</strong> link
          hasn&apos;t been configured yet. Please check back later.
        </p>

        <button
          onClick={onClose}
          style={{
            padding: "8px 22px",
            borderRadius: 999,
            border: "none",
            background: BRAND_GRADIENT,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: BRAND_SHADOW,
            transition: "transform 160ms",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >
          Got it
        </button>
      </div>
    </div>,
    document.body,
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   <WhatsNewModal />

   Changelog dialog listing every release, newest first — mirrors the
   design language of the demo page (glass surfaces, gradient accents).
   Portaled to <body> for the same containing-block reason as the social
   modal above.
   ─────────────────────────────────────────────────────────────────────────── */
function WhatsNewModal({ onClose }: { onClose: () => void }) {
  // ESC closes; body scroll locks while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="wn-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wn-title"
      onClick={onClose}
    >
      <div className="wn-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="wn-close"
          aria-label="Close"
          onClick={onClose}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="wn-head">
          <span className="wn-chip">
            <span className="wn-chip-dot" />
            Changelog
          </span>
          <h3 id="wn-title" className="wn-title">
            What's new in react-toaster-message
          </h3>
          <p className="wn-desc">
            Release notes for every version. Latest changes at the top.
          </p>
        </div>

        <div className="wn-body">
          {CHANGELOG.map((entry) => (
            <article
              key={entry.version}
              className="wn-version"
              aria-labelledby={`wn-v-${entry.version}`}
            >
              <header className="wn-vhead">
                <div className="wn-vmeta">
                  <h4 id={`wn-v-${entry.version}`} className="wn-vtitle">
                    v{entry.version}
                  </h4>
                  {entry.isLatest && <span className="wn-badge">Latest</span>}
                </div>
                <time className="wn-vdate">{entry.date}</time>
              </header>

              {entry.highlight && (
                <p className="wn-highlight">{renderRich(entry.highlight)}</p>
              )}

              {entry.sections.map((section) => (
                <section
                  key={section.kind}
                  className="wn-section"
                  data-kind={section.kind}
                >
                  <span className={`wn-section-tag wn-tag-${section.kind}`}>
                    {section.title}
                  </span>
                  <ul className="wn-list">
                    {section.items.map((item, i) => (
                      <li key={i} className="wn-item">
                        {renderRich(item)}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </article>
          ))}
        </div>

        <div className="wn-footer">
          <button type="button" className="primary-btn" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body,
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
  --code-comment: #6b7280;
  --code-string: #7ee787;
  --code-kw: #c084fc;
  --code-fn: #79b8ff;
  --code-num: #fbbf24;
  --scroll-track: rgba(255, 255, 255, 0.04);
  --scroll-thumb: rgba(167, 139, 250, 0.35);
  --scroll-thumb-hover: rgba(167, 139, 250, 0.55);
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
  --code-comment: #8b8b96;
  --code-string: #0f766e;
  --code-kw: #7c3aed;
  --code-fn: #1d4ed8;
  --code-num: #b45309;
  --scroll-track: rgba(15, 15, 25, 0.05);
  --scroll-thumb: rgba(124, 58, 237, 0.30);
  --scroll-thumb-hover: rgba(124, 58, 237, 0.50);
}

* { box-sizing: border-box; }
*, *::before, *::after { min-width: 0; }
html, body, #root {
  min-height: 100%;
  margin: 0;
  padding: 0;
}
html, body {
  width: 100%;
  max-width: 100vw;
  overflow-x: clip;
}
#root { width: 100%; max-width: 100%; }
html {
  scroll-behavior: smooth;
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
img, svg, video, canvas, iframe { max-width: 100%; height: auto; }
body {
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  background: var(--bg-0);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* ═══════════════════════════════════════════════════════════
   THEMED SCROLLBARS — global (page + every scrollable panel)
   ═══════════════════════════════════════════════════════════ */
/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--scroll-thumb) var(--scroll-track);
}
/* WebKit (Chrome / Edge / Safari) */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  background: var(--scroll-track);
}
::-webkit-scrollbar-thumb {
  background: var(--scroll-thumb);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--scroll-thumb-hover);
  border: 2px solid transparent;
  background-clip: padding-box;
}
::-webkit-scrollbar-corner {
  background: transparent;
}
/* Declaring any ::-webkit-scrollbar rule resurrects the platform
   stepper arrows — remove them explicitly. */
::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}

/* Tighter scrollbar inside compact scroll areas (modal body, code) */
.wn-body::-webkit-scrollbar,
.snippet::-webkit-scrollbar,
.tabs-bar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.page {
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  background:
    radial-gradient(1100px 600px at 80% -10%, rgba(167,139,250,0.18), transparent 60%),
    radial-gradient(900px 500px at -10% 10%, rgba(96,165,250,0.16), transparent 60%),
    radial-gradient(700px 500px at 50% 100%, rgba(244,114,182,0.10), transparent 60%),
    var(--bg-0);
}

/* STICKY NAV */
.sticky-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding: 12px 24px;
  background: color-mix(in srgb, var(--bg-0) 72%, transparent);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border-bottom: 1px solid transparent;
  transform: translateY(-100%);
  opacity: 0;
  transition:
    transform .4s cubic-bezier(.22, 1, .36, 1),
    opacity .35s ease,
    border-color .35s ease,
    background .35s ease;
  will-change: transform, opacity;
}
.sticky-nav.is-visible {
  transform: translateY(0);
  opacity: 1;
  border-bottom-color: var(--border);
  box-shadow: 0 8px 24px -18px rgba(0, 0, 0, 0.45);
}
.sticky-nav-inner {
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* SCROLL TO TOP */
.scroll-top-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 49;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  background: var(--surface-strong);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: var(--text);
  cursor: pointer;
  display: grid;
  place-items: center;
  box-shadow: 0 10px 28px -12px rgba(0, 0, 0, 0.45);
  opacity: 0;
  transform: translateY(16px) scale(0.85);
  pointer-events: none;
  transition:
    opacity .3s ease,
    transform .4s cubic-bezier(.22, 1, .36, 1),
    background .2s ease,
    color .2s ease,
    border-color .2s ease;
}
.scroll-top-btn.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}
.scroll-top-btn:hover {
  background: var(--primary-bg);
  color: var(--primary-text);
  border-color: transparent;
  transform: translateY(-3px) scale(1.05);
}
.scroll-top-btn:active {
  transform: translateY(-1px) scale(1);
}

/* HERO */
.hero {
  position: relative;
  padding: 28px 24px 56px;
  overflow: hidden;
}
.hero-inner {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
}
.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 56px;
  flex-wrap: nowrap;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1 1 auto;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.brand-mark { flex-shrink: 0; }

.hero-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: nowrap;
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

.hero-content { width: 100%; max-width: 760px; min-width: 0; }
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
  font-size: clamp(30px, 6vw, 64px);
  line-height: 1.08;
  letter-spacing: -0.035em;
  margin: 0 0 18px;
  font-weight: 700;
  overflow-wrap: break-word;
  word-break: break-word;
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
.install-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.install {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 12px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  font-family: ui-monospace, SFMono-Regular, "Menlo", monospace;
  font-size: 13.5px;
  color: var(--text);
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.install .prompt { color: var(--text-mute); }
.install--import {
  background: color-mix(in srgb, var(--accent) 8%, var(--surface-strong));
  border-color: color-mix(in srgb, var(--accent) 25%, var(--border));
}
.install--import .import-kw { color: var(--accent-3); font-weight: 600; }
.install--import .import-str { color: var(--accent-2); }

/* Inline copy button inside the install pills */
.install.copyable {
  position: relative;
  padding-right: 44px;            /* reserve room for the button */
  flex-wrap: nowrap;
  align-items: center;
}
.copyable-text {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.copyable-btn {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  appearance: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-soft);
  cursor: pointer;
  font: inherit;
  transition:
    background .15s ease,
    border-color .15s ease,
    color .15s ease,
    transform .15s ease;
}
.copyable-btn:hover {
  background: var(--surface-strong);
  border-color: var(--border-strong);
  color: var(--text);
  transform: translateY(-50%) scale(1.05);
}
.copyable-btn:active {
  transform: translateY(-50%) scale(0.95);
}
.copyable-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.copyable-btn.is-copied {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: transparent;
  color: #fff;
}
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
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 0 80px;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 28px;
}
.main > * { min-width: 0; max-width: 100%; }

/* CONTROL CARD */
.control-card {
  width: 100%;
  max-width: 100%;
  min-width: 0;
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
/* 6 controls — lay them out as a clean 3×2 on wide screens so the bottom
   row never ends up with a trailing empty cell. Falls back to 2-col then
   1-col at smaller widths via the media queries below. */
.control-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
@media (max-width: 1024px) {
  .control-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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

/* Custom gradient chip — two native color pickers, live preview */
.palette-chip--custom { user-select: none; }
.palette-color-input {
  appearance: none;
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid var(--border-strong);
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
}
.palette-color-input::-webkit-color-swatch-wrapper { padding: 0; }
.palette-color-input::-webkit-color-swatch {
  border: none;
  border-radius: 50%;
}
.palette-color-input::-moz-color-swatch {
  border: none;
  border-radius: 50%;
}
.palette-color-input:hover { transform: scale(1.1); }

.toggle-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Options control — 7 controls in a 3-col grid leave the last row with
   two empty cells, so this one spans the full row and lays its toggles
   out as chip cards that share the width evenly. */
.control--options { grid-column: 1 / -1; }
.control--options .toggle-row {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}
.control--options .toggle {
  flex: 1 1 160px;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--bg-1);
  border: 1px solid var(--border);
  transition: background .15s ease, border-color .15s ease;
}
.control--options .toggle:hover {
  background: var(--surface);
  border-color: var(--border-strong);
}
.control--options .toggle.is-on {
  background: color-mix(in srgb, var(--accent) 8%, var(--bg-1));
  border-color: color-mix(in srgb, var(--accent) 30%, var(--border));
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
  width: 100%;
  max-width: 100%;
  min-width: 0;
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
  width: 100%;
  max-width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
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
  width: 100%;
  max-width: 100%;
  min-width: 0;
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
.demo-card.is-selected {
  border-color: var(--accent);
  background: var(--surface-strong);
  box-shadow: 0 0 0 1px var(--accent) inset;
}
.snippet-demo-tag {
  margin-left: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
}
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
  width: 100%;
  max-width: 100%;
  min-width: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px 24px 24px;
  backdrop-filter: blur(20px);
  overflow: hidden;
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
.code-window {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-1);
  overflow: hidden;
  box-shadow: 0 14px 40px -24px rgba(0, 0, 0, 0.5);
}
.code-window-bar {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 11px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.cw-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  flex-shrink: 0;
}
.cw-red { background: #ff5f57; }
.cw-yellow { background: #febc2e; }
.cw-green { background: #28c840; }
.cw-file {
  margin-left: 10px;
  font-family: ui-monospace, SFMono-Regular, "Menlo", monospace;
  font-size: 12px;
  color: var(--text-mute);
}
.snippet {
  margin: 0;
  padding: 18px 20px;
  font-family: ui-monospace, SFMono-Regular, "Menlo", monospace;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text);
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  white-space: pre;
  -webkit-overflow-scrolling: touch;
}
.snippet .tok-comment { color: var(--code-comment); font-style: italic; }
.snippet .tok-string { color: var(--code-string); }
.snippet .tok-kw { color: var(--code-kw); }
.snippet .tok-fn { color: var(--code-fn); font-weight: 600; }
.snippet .tok-num { color: var(--code-num); }

/* FOOTER CARD */
.footer-card {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-top: 20px;
  padding: 26px 28px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)),
    var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  backdrop-filter: blur(22px) saturate(140%);
  -webkit-backdrop-filter: blur(22px) saturate(140%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.04) inset,
    0 20px 50px -28px rgba(0, 0, 0, 0.55),
    0 6px 18px -10px rgba(124, 58, 237, 0.18);
  overflow: hidden;
  isolation: isolate;
}
.footer-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--accent-3) 18%,
    var(--accent) 50%,
    var(--accent-2) 82%,
    transparent
  );
  opacity: 0.85;
  z-index: 2;
}
.footer-glow {
  position: absolute;
  inset: -40% -20% auto -20%;
  height: 240px;
  background:
    radial-gradient(420px 200px at 20% 0%, rgba(244,114,182,0.18), transparent 60%),
    radial-gradient(420px 200px at 80% 0%, rgba(96,165,250,0.16), transparent 60%);
  filter: blur(6px);
  pointer-events: none;
  z-index: 0;
}

.footer-row {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.footer-mark {
  padding: 8px 10px;
  border-radius: 12px;
}
.footer-brand-text { min-width: 0; }
.footer-brand-name {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.01em;
  color: var(--text);
}
.footer-brand-tag {
  margin-top: 2px;
  font-size: 12.5px;
  color: var(--text-mute);
}

.footer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.footer-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px -8px rgba(0, 0, 0, 0.4);
  transition:
    background .18s ease,
    border-color .18s ease,
    transform .18s ease,
    color .18s ease,
    box-shadow .18s ease;
}
.footer-btn svg { opacity: 0.85; transition: opacity .18s ease; }
.footer-btn:hover {
  background: var(--surface-strong);
  border-color: var(--border-strong);
  transform: translateY(-2px);
  box-shadow: 0 10px 22px -12px rgba(124, 58, 237, 0.35);
}
.footer-btn:hover svg { opacity: 1; }

.footer-divider {
  position: relative;
  z-index: 1;
  height: 1px;
  margin: 20px 0 18px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
}

/* CONNECT / SOCIAL ROW */
.connect-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.connect-headline {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-soft);
}
.connect-grad {
  background: linear-gradient(120deg, var(--accent-3), var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
}
.connect-sep { opacity: 0.4; }
.connect-tag { font-weight: 400; color: var(--text-mute); }

/* SocialIcons styles itself inline; the modal too. Kept .connect-* only. */

.footer-row-bottom { gap: 12px 18px; }
.footer-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12.5px;
  color: var(--text-mute);
}
.footer-meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.mit-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent);
  font-family: ui-monospace, SFMono-Regular, "Menlo", monospace;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.footer-dot { opacity: 0.5; }
.footer-sep {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--text-mute);
  opacity: 0.5;
}
.footer-crafted .heart {
  display: inline-block;
  color: #f43f5e;
  transform: translateY(1px);
  animation: heartBeat 1.6s ease-in-out infinite;
}
@keyframes heartBeat {
  0%, 100% { transform: translateY(1px) scale(1); }
  25% { transform: translateY(1px) scale(1.18); }
  50% { transform: translateY(1px) scale(1); }
  75% { transform: translateY(1px) scale(1.12); }
}
@media (prefers-reduced-motion: reduce) {
  .footer-crafted .heart { animation: none; }
}

.footer-author {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-soft);
  text-decoration: none;
  font-size: 13px;
  transition:
    background .2s ease,
    color .2s ease,
    border-color .2s ease,
    transform .2s ease,
    box-shadow .2s ease;
}
.footer-author strong {
  background: linear-gradient(120deg, var(--accent-3), var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
}
.footer-author svg {
  color: var(--text-mute);
  transition: transform .2s ease, color .2s ease;
}
.footer-author:hover {
  background: var(--surface-strong);
  border-color: var(--border-strong);
  color: var(--text);
  transform: translateY(-2px);
  box-shadow: 0 10px 22px -12px rgba(124, 58, 237, 0.4);
}
.footer-author:hover svg {
  color: var(--accent);
  transform: translate(2px, -2px);
}

/* Tablet & small laptop */
@media (max-width: 900px) {
  .hero { padding: 24px 20px 48px; }
  .hero-top { margin-bottom: 44px; gap: 12px; flex-wrap: wrap; }
  .main { padding: 0 20px 64px; gap: 24px; }
  .control-card { padding: 20px; }
  .control-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .snippet-card { padding: 18px 20px 20px; }
  .snippet { padding: 16px 18px; font-size: 12.5px; }
  .tab { flex: 1 1 140px; padding: 9px 14px; }
  .demos { grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr)); }
  .footer-card { padding: 24px 22px; }
  .sticky-nav { padding: 11px 20px; }
}

/* Mobile landscape & large phones */
@media (max-width: 640px) {
  .hero { padding: 18px 12px 32px; }
  .hero-top {
    margin-bottom: 32px;
    gap: 10px;
    flex-wrap: nowrap;
  }
  .hero-actions { flex-wrap: nowrap; gap: 6px; }
  .main { padding: 0 12px 56px; gap: 22px; }
  .pill { font-size: 11.5px; padding: 5px 10px; margin-bottom: 18px; }
  .lede { margin-bottom: 22px; }
  .hero-cta { flex-direction: column; align-items: stretch; gap: 10px; }
  .install, .primary-btn { width: 100%; justify-content: center; }
  .install { padding: 11px 14px; font-size: 12.5px; }

  .control-card { padding: 18px; border-radius: 16px; }
  .control-head h2 { font-size: 16px; }
  .control-head p { font-size: 13px; margin-bottom: 16px; }
  .control-grid { grid-template-columns: 1fr; gap: 14px; }
  .toggle-row { flex-direction: row; flex-wrap: wrap; gap: 12px; }

  .tabs-bar {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    scroll-snap-type: x mandatory;
  }
  .tabs-bar::-webkit-scrollbar { display: none; }
  .tab {
    flex: 0 0 auto;
    min-width: 140px;
    scroll-snap-align: start;
  }

  .demos { grid-template-columns: 1fr; gap: 10px; }
  .demo-card { padding: 14px; gap: 12px; }
  .demo-icon { width: 36px; height: 36px; font-size: 17px; }

  .snippet-card { padding: 16px; border-radius: 16px; }
  .snippet-head h3 { font-size: 14px; }
  .snippet { padding: 14px 16px; font-size: 12px; line-height: 1.6; }
  .copy-btn { padding: 6px 10px; font-size: 12px; }

  .sticky-nav { padding: 10px 16px; }
  .sticky-nav .brand-text { font-size: 13px; }
  .scroll-top-btn { bottom: 16px; right: 16px; width: 40px; height: 40px; }

  .footer-card { padding: 22px 18px; border-radius: 16px; }
  .footer-row { gap: 14px; }
  .footer-row-top { flex-direction: column; align-items: flex-start; }
  .footer-actions { width: 100%; }
  .footer-btn { flex: 1 1 auto; justify-content: center; padding: 9px 12px; }
  .footer-divider { margin: 16px 0 14px; }
  .footer-row-bottom { flex-direction: column; align-items: flex-start; gap: 14px; }
  .footer-author { width: 100%; justify-content: center; }

  .connect-row { flex-direction: column; align-items: flex-start; gap: 12px; }
}

/* Small phones */
@media (max-width: 420px) {
  .hero { padding: 14px 10px 24px; }
  .hero-top { margin-bottom: 24px; gap: 8px; }
  .brand { gap: 8px; }
  .brand-text { font-size: 12.5px; }
  .hero-actions { gap: 4px; }
  .ghost-btn { padding: 6px 10px; font-size: 12px; }
  .ghost-btn.icon-only { padding: 6px 8px; }
  .main { padding: 0 10px 44px; gap: 18px; }

  .title { letter-spacing: -0.025em; }
  .lede { font-size: 14px; line-height: 1.5; }
  .install { font-size: 11.5px; padding: 10px 12px; }
  .install .prompt { display: none; }
  .primary-btn { padding: 10px 16px; font-size: 13px; }

  .control-card { padding: 14px; border-radius: 14px; }
  .position-grid { padding: 6px; gap: 4px; }
  .palette-row { padding: 5px; gap: 4px; }
  .palette-chip { padding: 4px 8px 4px 5px; font-size: 12px; }
  .palette-swatch { width: 16px; height: 16px; }

  .snippet-card { padding: 14px; border-radius: 14px; }
  .snippet { padding: 12px 14px; font-size: 11.5px; }

  .footer-card { padding: 20px 14px; border-radius: 14px; }
  .footer-actions { gap: 6px; }
  .footer-btn { font-size: 12px; padding: 8px 10px; gap: 6px; }
  .footer-brand { gap: 12px; }
  .footer-brand-name { font-size: 14px; }
  .footer-brand-tag { font-size: 11.5px; }
  .footer-meta { font-size: 11.5px; }
  .footer-meta-row { gap: 8px; }
  .mit-badge { font-size: 10px; padding: 2px 6px; }

  .sticky-nav { padding: 9px 14px; }
  .sticky-nav .ghost-btn { padding: 6px 8px; font-size: 11.5px; }
  .scroll-top-btn { bottom: 14px; right: 14px; width: 38px; height: 38px; }
}

/* Very small phones — hide long brand text, keep colorful mark */
@media (max-width: 360px) {
  .brand-text, .sticky-nav .brand-text { display: none; }
  .ghost-btn { padding: 5px 8px; font-size: 11px; }
  .ghost-btn.icon-only { padding: 5px 7px; }
}

/* ═══════════════════════════════════════════════════════════
   WHAT'S NEW trigger pill (navs)
   ═══════════════════════════════════════════════════════════ */
.whatsnew-btn { position: relative; }
.whatsnew-btn svg { flex-shrink: 0; }
.whatsnew-btn.has-unseen {
  border-color: color-mix(in srgb, var(--accent) 45%, transparent);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 12%, transparent),
    color-mix(in srgb, var(--accent-2) 9%, transparent)
  );
  color: var(--accent);
}
.whatsnew-btn.has-unseen:hover {
  border-color: color-mix(in srgb, var(--accent) 65%, transparent);
}
.whatsnew-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: var(--accent-3);
  box-shadow:
    0 0 0 2px var(--bg-0),
    0 0 0 0 rgba(219, 39, 119, 0.55);
  animation: livePulse 1.8s ease-out infinite;
}

@keyframes livePulse {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.55); }
  70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
.whatsnew-dot {
  animation-name: whatsnewPulse;
}
@keyframes whatsnewPulse {
  0% {
    box-shadow: 0 0 0 2px var(--bg-0), 0 0 0 0 rgba(219, 39, 119, 0.55);
  }
  70% {
    box-shadow: 0 0 0 2px var(--bg-0), 0 0 0 8px rgba(219, 39, 119, 0);
  }
  100% {
    box-shadow: 0 0 0 2px var(--bg-0), 0 0 0 0 rgba(219, 39, 119, 0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .whatsnew-dot, .stat-live-dot, .wn-chip-dot { animation: none; }
}

/* ═══════════════════════════════════════════════════════════
   SITE STATS STRIP (photo design) — page-bottom bar
   ═══════════════════════════════════════════════════════════ */
.stats-strip {
  position: relative;
  padding: 22px 24px;
  border-top: 1px solid var(--border-strong);
  background: color-mix(in srgb, var(--bg-1) 55%, transparent);
}
.stats-strip::before {
  content: "";
  position: absolute;
  inset: -1px 0 auto 0;
  height: 2px;
  background: linear-gradient(120deg, var(--accent-3), var(--accent), var(--accent-2));
  opacity: 0.55;
  pointer-events: none;
}
.stats-strip-inner {
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface-strong);
  overflow: hidden;
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    background 0.22s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-strong);
  box-shadow:
    0 8px 22px -14px rgba(124, 58, 237, 0.45),
    0 2px 6px -2px rgba(15, 23, 42, 0.08);
}

.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 14%, transparent),
    color-mix(in srgb, var(--accent-2) 11%, transparent)
  );
  color: var(--accent);
  border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
  transition: transform 0.25s ease, background 0.25s ease;
}
.stat-icon svg { width: 18px; height: 18px; }
.stat-card:hover .stat-icon { transform: scale(1.06) rotate(-3deg); }

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.stat-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-mute);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stat-num {
  font-family: ui-monospace, SFMono-Regular, "Menlo", monospace;
  font-variant-numeric: tabular-nums;
  font-size: 17px;
  letter-spacing: 0;
}

.stat-card--highlight {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 12%, transparent),
    color-mix(in srgb, var(--accent-2) 7%, transparent) 60%,
    color-mix(in srgb, var(--accent-3) 10%, transparent)
  );
  border-color: color-mix(in srgb, var(--accent) 25%, transparent);
}
.stat-card--highlight .stat-icon {
  background: var(--primary-bg);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6px 16px -8px rgba(124, 58, 237, 0.55);
}
.stat-card--highlight .stat-value {
  background: linear-gradient(120deg, var(--accent-3), var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.stat-live {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  border: 1px solid rgba(16, 185, 129, 0.25);
}
html[data-page-theme="dark"] .stat-live {
  background: rgba(16, 185, 129, 0.16);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.32);
}
.stat-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
  animation: livePulse 1.6s ease-out infinite;
}

/* ═══════════════════════════════════════════════════════════
   WHAT'S NEW modal (changelog)
   ═══════════════════════════════════════════════════════════ */
.wn-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.58);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: wnFadeIn 0.22s ease-out;
}
@keyframes wnFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.wn-modal {
  position: relative;
  width: 100%;
  max-width: 640px;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  padding: 28px 0 0;
  border-radius: 22px;
  background: var(--bg-2);
  border: 1px solid var(--border-strong);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.1),
    0 30px 70px -20px rgba(0, 0, 0, 0.45),
    0 50px 120px -30px rgba(124, 58, 237, 0.4);
  overflow: hidden;
  animation: wnPop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes wnPop {
  from { opacity: 0; transform: translateY(12px) scale(0.94); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.wn-modal::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-2), var(--accent), var(--accent-3));
  z-index: 2;
}

.wn-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-mute);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
}
.wn-close:hover {
  background: var(--surface-strong);
  color: var(--text);
  transform: rotate(90deg);
}

.wn-head {
  padding: 0 28px 18px;
  text-align: center;
  border-bottom: 1px solid var(--border);
}
.wn-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 14%, transparent),
    color-mix(in srgb, var(--accent-3) 11%, transparent)
  );
  border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
  color: var(--accent);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.wn-chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--accent-3);
  box-shadow: 0 0 0 0 rgba(219, 39, 119, 0.6);
  animation: livePulse 1.6s ease-out infinite;
}
.wn-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
  margin: 0 0 6px;
}
.wn-desc {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--text-soft);
  margin: 0;
}

.wn-body {
  padding: 22px 28px 8px;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
  text-align: left;
}

.wn-version { position: relative; }
.wn-version + .wn-version {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px dashed var(--border);
}

.wn-vhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.wn-vmeta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.wn-vtitle {
  font-family: ui-monospace, SFMono-Regular, "Menlo", monospace;
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  letter-spacing: -0.01em;
}
.wn-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--primary-bg);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow: 0 4px 14px -6px rgba(124, 58, 237, 0.6);
}
.wn-vdate {
  font-size: 12.5px;
  color: var(--text-mute);
  font-variant-numeric: tabular-nums;
}
.wn-highlight {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--text);
  margin: 0 0 16px;
  padding: 10px 14px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 9%, transparent),
    color-mix(in srgb, var(--accent-2) 7%, transparent)
  );
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
}

.wn-section + .wn-section { margin-top: 16px; }
.wn-section-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
  border: 1px solid transparent;
}
.wn-tag-added {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.28);
  color: #15803d;
}
.wn-tag-changed {
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.30);
  color: #b45309;
}
.wn-tag-fixed {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.28);
  color: #1d4ed8;
}
.wn-tag-technical {
  background: rgba(124, 58, 237, 0.12);
  border-color: rgba(124, 58, 237, 0.28);
  color: #6d28d9;
}
.wn-tag-docs {
  background: rgba(236, 72, 153, 0.12);
  border-color: rgba(236, 72, 153, 0.28);
  color: #be185d;
}
html[data-page-theme="dark"] .wn-tag-added { color: #4ade80; }
html[data-page-theme="dark"] .wn-tag-changed { color: #fbbf24; }
html[data-page-theme="dark"] .wn-tag-fixed { color: #60a5fa; }
html[data-page-theme="dark"] .wn-tag-technical { color: #c4b5fd; }
html[data-page-theme="dark"] .wn-tag-docs { color: #f9a8d4; }

.wn-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wn-item {
  position: relative;
  padding-left: 18px;
  font-size: 13.25px;
  line-height: 1.55;
  color: var(--text-soft);
}
.wn-item::before {
  content: "";
  position: absolute;
  top: 8px;
  left: 4px;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--accent);
  opacity: 0.7;
}
.wn-item strong { color: var(--text); font-weight: 600; }
.wn-code {
  font-family: ui-monospace, SFMono-Regular, "Menlo", monospace;
  font-size: 12px;
  padding: 1px 5px;
  border-radius: 5px;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
  color: var(--accent);
}

.wn-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 28px;
  border-top: 1px solid var(--border);
  background: var(--surface);
}

/* Stats + What's New — responsive */
@media (max-width: 768px) {
  .stats-strip { padding: 18px 20px; }
  .stats-strip-inner { grid-template-columns: 1fr; gap: 10px; }
}
@media (max-width: 640px) {
  .whatsnew-label { display: none; }
  .whatsnew-btn { padding: 8px 10px; }
  .wn-modal {
    max-height: calc(100vh - 24px);
    border-radius: 18px;
  }
  .wn-head, .wn-body, .wn-footer {
    padding-left: 20px;
    padding-right: 20px;
  }
  .wn-footer { flex-direction: column-reverse; align-items: stretch; }
  .wn-footer .primary-btn { width: 100%; }
  .wn-vhead { gap: 8px; }
}
`;
