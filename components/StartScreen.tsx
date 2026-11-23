"use client";

/* eslint-disable @next/next/no-img-element */

export function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-navy px-8 text-center">
      <img
        src="/brand/bumahakaya-stacked-on-navy.svg"
        alt="BumahaKaya?"
        className="h-40 w-auto"
      />
      <p className="mt-6 font-display text-lg font-extrabold text-white">
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
