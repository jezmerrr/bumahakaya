"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, type FormEvent } from "react";

type View = "welcome" | "login" | "signup";

export function StartScreen({ onStart }: { onStart: () => void }) {
  const [view, setView] = useState<View>("welcome");

  function enter(e: FormEvent) {
    e.preventDefault();
    onStart();
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-navy px-8 py-10 text-center">
      <img
        src="/brand/bumahakaya-stacked-on-navy.svg"
        alt="BumahaKaya?"
        className="h-32 w-auto"
      />
      <p className="mt-5 font-display text-lg font-extrabold text-white">
        Alamin bago lumusong.
      </p>
      <p className="mt-1 text-sm text-white/60">
        Every flood update that matters, in one place.
      </p>

      {view === "welcome" ? (
        <div className="mt-10 w-full max-w-xs">
          {/* Guest is the main way in: accounts aren't part of the MVP. */}
          <button
            onClick={onStart}
            className="w-full rounded-full bg-signal py-3.5 text-base font-semibold text-white shadow-lg"
          >
            Continue as guest
          </button>
          <p className="mt-2 text-xs text-white/60">
            No account needed. Reports stay on this phone.
          </p>

          <div className="mt-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide text-white/50">
            <span className="h-px flex-1 bg-white/15" />
            Accounts preview
            <span className="h-px flex-1 bg-white/15" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setView("login")}
              className="rounded-full border border-white/30 py-2.5 text-sm font-semibold text-white"
            >
              Log in
            </button>
            <button
              onClick={() => setView("signup")}
              className="rounded-full border border-white/30 py-2.5 text-sm font-semibold text-white"
            >
              Sign up
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={enter} className="mt-8 w-full max-w-xs space-y-3 text-left">
          <h2 className="text-center font-display text-base font-extrabold text-white">
            {view === "login" ? "Log in" : "Create account"}
          </h2>

          {view === "signup" ? (
            <Field id="name" label="Name" type="text" placeholder="Juan dela Cruz" />
          ) : null}
          <Field
            id="email"
            label="Email"
            type="email"
            placeholder="you@dlsu.edu.ph"
          />
          <Field
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
          />

          <button
            type="submit"
            className="w-full rounded-full bg-signal py-3 text-sm font-semibold text-white"
          >
            {view === "login" ? "Log in" : "Create account"}
          </button>
          <button
            type="button"
            onClick={() => setView("welcome")}
            className="w-full py-1 text-xs font-semibold text-white/50"
          >
            Back
          </button>
        </form>
      )}
    </div>
  );
}

function Field({
  id,
  label,
  type,
  placeholder,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-xs font-semibold text-white/70">
        {label}
      </span>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/15 bg-surface/95 px-3 py-2 text-base text-ink"
      />
    </label>
  );
}
