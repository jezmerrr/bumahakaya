"use client";

import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { TrashIcon } from "./icons";

// Several overlays can be open at once (details -> edit -> confirm), and they
// can close in any order, so page scrolling is locked with a counter rather
// than by each overlay saving and restoring the body style itself.
let openOverlays = 0;
let savedOverflow = "";

function lockScroll() {
  if (openOverlays++ === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
}

function unlockScroll() {
  if (--openOverlays === 0) {
    document.body.style.overflow = savedOverflow;
  }
}

// Shared overlay behavior: lock page scroll, move focus into the overlay,
// close on Escape, and hand focus back to whatever opened it.
function useOverlay(onClose: () => void) {
  const initialFocus = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    lockScroll();
    initialFocus.current?.focus();
    return () => {
      unlockScroll();
      opener?.focus?.();
    };
  }, []);

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      // Stop here so only the top-most overlay closes.
      e.stopPropagation();
      onClose();
    }
  }

  function onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return { initialFocus, onKeyDown, onBackdropClick };
}

// Full-screen page that slides over the app (report details, edit form).
// Uses the same "‹ Back" header as the Profile sub-pages.
export function Sheet({
  title,
  onClose,
  actions,
  children,
}: {
  title: string;
  onClose: () => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const titleId = useId();
  const { initialFocus, onKeyDown, onBackdropClick } = useOverlay(onClose);

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] flex justify-center bg-navy/40"
      onKeyDown={onKeyDown}
      onClick={onBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-mist motion-safe:animate-sheet-in"
      >
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-navy/10 bg-mist/95 px-4 py-3 backdrop-blur">
          <button
            ref={initialFocus}
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="shrink-0 rounded-full border border-navy/15 px-3 py-1 text-sm font-semibold text-navy/70"
          >
            ‹ Back
          </button>
          <h2
            id={titleId}
            className="min-w-0 flex-1 truncate font-display text-lg font-extrabold text-navy"
          >
            {title}
          </h2>
          {actions}
        </div>
        <div className="flex-1 px-4 pb-10 pt-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

// "Are you sure?" step before anything is deleted. Cancel has focus first so
// a stray Enter never deletes.
export function ConfirmDeleteDialog({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const messageId = useId();
  const { initialFocus, onKeyDown, onBackdropClick } = useOverlay(onCancel);

  return createPortal(
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center bg-navy/50 p-4 sm:items-center"
      onKeyDown={onKeyDown}
      onClick={onBackdropClick}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl motion-safe:animate-sheet-in"
      >
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-impass/10 text-impass">
          <TrashIcon className="h-6 w-6" />
        </div>
        <h2
          id={titleId}
          className="mt-3 text-center font-display text-lg font-extrabold text-navy"
        >
          {title}
        </h2>
        <p id={messageId} className="mt-1 text-center text-sm text-navy/60">
          {message}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            ref={initialFocus}
            type="button"
            onClick={onCancel}
            className="rounded-2xl bg-navy/5 py-3 text-sm font-semibold text-navy/70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-impass py-3 text-sm font-semibold text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
