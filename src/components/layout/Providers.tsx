"use client";

import { MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { useAppStore } from "@/store/useAppStore";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useAppStore.persist.rehydrate();
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
