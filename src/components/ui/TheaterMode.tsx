"use client";

import { useEffect, useState } from "react";
import { Maximize2, X } from "lucide-react";

interface TheaterModeProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Wraps an interactive visualization with a toggle that expands it into a
 * fullscreen overlay — large canvas, minimal chrome — so it stays readable
 * on a projector or big screen. The children stay mounted across the
 * toggle, so simulation state (trained weights, drawn points) is preserved.
 */
export default function TheaterMode({ title, children }: TheaterModeProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const toggle = () => {
    setOpen((current) => !current);
    // Canvas-based visualizations size themselves off window resize events;
    // the container change alone doesn't fire one.
    requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
  };

  return (
    <div
      className={
        open ? "fixed inset-0 z-[70] flex flex-col bg-background" : undefined
      }
      role={open ? "dialog" : undefined}
      aria-modal={open || undefined}
      aria-label={open ? `${title} — theater mode` : undefined}
    >
      <div
        className={
          open
            ? "flex items-center justify-between gap-4 border-b border-outline px-4 py-3 sm:px-6"
            : "mb-3 flex justify-end"
        }
      >
        {open && (
          <p className="truncate font-headline text-lg font-medium text-on-surface">
            {title}
          </p>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-pressed={open}
          className="inline-flex shrink-0 items-center gap-2 border border-outline bg-surface px-3 py-2 text-sm font-medium tracking-tight text-on-surface transition-colors hover:border-primary hover:text-primary"
        >
          {open ? (
            <>
              <X size={15} aria-hidden="true" />
              Exit theater
            </>
          ) : (
            <>
              <Maximize2 size={15} aria-hidden="true" />
              Theater mode
            </>
          )}
        </button>
      </div>
      <div className={open ? "flex-1 overflow-y-auto p-3 sm:p-6" : undefined}>
        {children}
      </div>
    </div>
  );
}
