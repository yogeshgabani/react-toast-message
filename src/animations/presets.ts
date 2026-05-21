import type { Variants, Transition } from "framer-motion";
import type { AnimationPreset, AosAnimation, ToastPosition } from "../types";

const isTop = (p: ToastPosition) => p.startsWith("top");

const springTransition: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
  mass: 0.9,
};

const smoothTransition: Transition = {
  type: "tween",
  ease: [0.22, 1, 0.36, 1],
  duration: 0.42,
};

const bounceTransition: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 18,
  mass: 0.8,
};

const aosTransition: Transition = {
  type: "tween",
  ease: [0.25, 0.1, 0.25, 1],
  duration: 0.6,
};

const AOS_DISTANCE = 60;

const AOS_SET: ReadonlySet<string> = new Set<AosAnimation>([
  "fade-up", "fade-down", "fade-left", "fade-right",
  "fade-up-right", "fade-up-left", "fade-down-right", "fade-down-left",
  "slide-up", "slide-down", "slide-left", "slide-right",
  "zoom-in", "zoom-out",
  "zoom-in-up", "zoom-in-down", "zoom-in-left", "zoom-in-right",
  "zoom-out-up", "zoom-out-down", "zoom-out-left", "zoom-out-right",
  "flip-up", "flip-down", "flip-left", "flip-right",
]);

export function isAosAnimation(name: string): name is AosAnimation {
  return AOS_SET.has(name);
}

function getAosVariants(name: AosAnimation): Variants {
  const D = AOS_DISTANCE;
  const parts = name.split("-");
  const slide = parts[0] === "slide";
  const zoom = parts[0] === "zoom";
  const flip = parts[0] === "flip";
  const zoomIn = zoom && parts[1] === "in";
  const zoomOut = zoom && parts[1] === "out";

  let x = 0;
  let y = 0;
  let scale = 1;
  let rotateX = 0;
  let rotateY = 0;
  let opacity = 0;

  // Direction tokens: "up" / "down" / "left" / "right" can appear anywhere
  // in the name. fade-up = start BELOW & animate UP, fade-left = start RIGHT
  // & animate LEFT, fade-up-right = start at bottom-left & animate up-right.
  if (parts.includes("up")) y = D;
  else if (parts.includes("down")) y = -D;
  if (parts.includes("left")) x = D;
  else if (parts.includes("right")) x = -D;

  if (slide) {
    opacity = 1; // slide-* in AOS does not fade
  }

  if (zoomIn) scale = 0.6;
  else if (zoomOut) scale = 1.2;

  if (flip) {
    x = 0;
    y = 0;
    if (name === "flip-up") rotateX = 90;
    else if (name === "flip-down") rotateX = -90;
    else if (name === "flip-left") rotateY = -90;
    else if (name === "flip-right") rotateY = 90;
  }

  const exitScale = zoomIn ? 0.85 : zoomOut ? 1.1 : 0.98;

  return {
    initial: { opacity, x, y, scale, rotateX, rotateY },
    animate: { opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0 },
    exit: {
      opacity: 0,
      x: x * 0.4,
      y: y * 0.4,
      scale: exitScale,
      rotateX: rotateX * 0.5,
      rotateY: rotateY * 0.5,
      transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
    },
  };
}

export function getVariants(
  preset: AnimationPreset,
  position: ToastPosition,
): { variants: Variants; transition: Transition } {
  const dir = isTop(position) ? -1 : 1;

  if (isAosAnimation(preset)) {
    return { variants: getAosVariants(preset), transition: aosTransition };
  }

  switch (preset) {
    case "blur-fade":
      return {
        variants: {
          initial: {
            opacity: 0,
            y: dir * 18,
            filter: "blur(8px)",
            scale: 0.96,
          },
          animate: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            scale: 1,
          },
          exit: {
            opacity: 0,
            y: dir * 14,
            filter: "blur(6px)",
            scale: 0.96,
            transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
          },
        },
        transition: smoothTransition,
      };

    case "scale":
      return {
        variants: {
          initial: { opacity: 0, scale: 0.85, y: dir * 8 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: {
            opacity: 0,
            scale: 0.9,
            y: dir * 6,
            transition: { duration: 0.2, ease: "easeIn" },
          },
        },
        transition: springTransition,
      };

    case "spring":
      return {
        variants: {
          initial: { opacity: 0, y: dir * 40, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: {
            opacity: 0,
            y: dir * 20,
            scale: 0.95,
            transition: { duration: 0.22 },
          },
        },
        transition: springTransition,
      };

    case "bounce":
      return {
        variants: {
          initial: { opacity: 0, y: dir * 60, scale: 0.7 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: {
            opacity: 0,
            y: dir * 30,
            scale: 0.85,
            transition: { duration: 0.22 },
          },
        },
        transition: bounceTransition,
      };

    case "slide":
    default:
      return {
        variants: {
          initial: { opacity: 0, y: dir * 32, scale: 0.98 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: {
            opacity: 0,
            y: dir * 24,
            scale: 0.98,
            transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
          },
        },
        transition: smoothTransition,
      };
  }
}

export const reducedMotionVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export const reducedMotionTransition: Transition = {
  duration: 0.15,
  ease: "linear",
};
