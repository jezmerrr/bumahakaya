"use client";

import { PinMark } from "./Logo";

export function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-navy px-8 text-center">
      <PinMark className="h-20 w-auto" />
      <p className="mt-5 font-display text-3xl font-extrabold tracking-tight">
        <span className="text-white">Bumaha</span>
        <span className="text-aqua">Kaya</span>
        <span className="text-amber">?</span>
      </p>
      <p className="mt-4 font-display text-lg font-extrabold text-white">
        Alamin bago lumusong.
      </p>
      <p className="mt-1 text-sm text-white/60">
        Every flood update that matters, in one place.
      </p>

      <button
        onClick={onStart}
        className="mt-10 w-full max-w-xs rounded-full bg-signal py-3 text-sm font-semibold text-white"
      >
        Magsimula
      </button>

      <div className="mt-8 flex gap-2">
        <span className="h-2 w-2 rounded-full bg-aqua" />
        <span className="h-2 w-2 rounded-full bg-white/30" />
        <span className="h-2 w-2 rounded-full bg-white/30" />
      </div>
    </div>
  );
}
