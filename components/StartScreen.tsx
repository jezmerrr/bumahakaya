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
        <div className="mt-10 w-full max-w-xs space-y-3">
          <button
            onClick={() => setView("login")}
            className="w-full rounded-full bg-signal py-3 text-sm font-semibold text-white"
          >
            Log in
          </button>
          <button
            onClick={() => setView("signup")}
            className="w-full rounded-full border border-white/40 py-3 text-sm font-semibold text-white"
          >
            Sign up
          </button>
          <button
            onClick={onStart}
            className="w-full py-2 text-sm font-semibold text-white/60"
          >
            Continue as guest
          </button>
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
        className="w-full rounded-xl border border-white/15 bg-surface/95 px-3 py-2 text-sm text-ink"
      />
    </label>
  );
}
