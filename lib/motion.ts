// Motion tokens and variants for consistent animations

export const motionTokens = {
  durations: {
    fast: 0.28,
    normal: 0.35,
    slow: 0.42,
  },
  easing: {
    easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
    spring: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  stagger: 0.1,
} as const;

// Framer Motion variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: motionTokens.durations.normal,
      ease: motionTokens.easing.easeOut,
    },
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.durations.normal,
      ease: motionTokens.easing.easeOut,
    },
  },
};

export const fadeScale = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: motionTokens.durations.normal,
      ease: motionTokens.easing.easeOut,
    },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: motionTokens.stagger,
    },
  },
};

// Reduced motion variants (immediate, no animation)
export const reducedMotionVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};


