"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Apple-style sheet: bottom sheet with a grabber on phones, centered card on larger screens.
 * One task per sheet, Escape and backdrop dismiss (unless busy), explicit close button,
 * focus moved into the sheet on open and restored on close.
 */
export function Sheet({
  open,
  onClose,
  label,
  busy,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  busy?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => panel.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, busy, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && !busy && onClose()}
        >
          <motion.div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            drag={busy ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => info.offset.y > 120 && !busy && onClose()}
            className={cn(
              "relative max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-raised px-6 pb-8 pt-3 text-ink shadow-2xl outline-none sm:max-w-[460px] sm:rounded-[28px] sm:pt-6",
              className,
            )}
          >
            <div className="mx-auto mb-3 h-[5px] w-9 rounded-full bg-line sm:hidden" aria-hidden />
            {!busy && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-mist text-ink-2 transition hover:text-ink sm:top-5"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Segmented control (iOS-style). */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("grid auto-cols-fr grid-flow-col gap-0.5 rounded-[10px] bg-mist p-0.5", className)}
    >
      {options.map((o) => (
        <button
          key={String(o.value)}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-[8px] px-3 py-1.5 text-[13px] font-medium transition",
            value === o.value ? "bg-raised text-ink shadow-[0_1px_4px_rgba(0,0,0,0.12)]" : "text-ink-2 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** iOS-style switch with a visible label. */
export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span className="min-w-0">
        <span className="block text-[15px]">{label}</span>
        {hint && <span className="block text-[13px] text-ink-2">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-[31px] w-[51px] shrink-0 rounded-full transition", checked ? "bg-[#34c759]" : "bg-line")}
      >
        <span
          className={cn(
            "absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-all",
            checked ? "left-[22px]" : "left-[2px]",
          )}
        />
      </button>
    </label>
  );
}
