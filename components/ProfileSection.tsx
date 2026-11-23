"use client";

import { useStore } from "@/lib/store";
import { Avatar } from "./ui";

export function ProfileSection() {
  const { reports } = useStore();
  const myReports = reports.filter((r) => r.source === "community").length;

  const stats = [
    { value: myReports, label: "Reports" },
    { value: 9, label: "Verified" },
    { value: 5, label: "Day streak" },
  ];

  return (
    <div className="px-4 pb-4 pt-4">
      <h1 className="font-display text-2xl font-extrabold text-navy">Profile</h1>

      <div className="mt-4 flex flex-col items-center">
        <Avatar
          name="Jezmer Ramos"
          className="h-24 w-24 bg-signal text-2xl"
        />
        <h2 className="mt-3 font-display text-xl font-extrabold text-navy">
          Jezmer Ramos
        </h2>
        <p className="text-sm text-navy/50">DLSU student · commuter</p>
      </div>

      <div className="mt-5 flex rounded-3xl bg-white p-4 shadow-sm">
        {stats.map((s) => (
          <div key={s.label} className="flex-1 text-center">
            <p className="font-display text-xl font-extrabold text-navy">
              {s.value}
            </p>
            <p className="text-xs text-navy/50">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-sm">
        <button className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-semibold text-navy">
          My reports <span className="text-navy/30">›</span>
        </button>
        <div className="mx-4 border-t border-navy/10" />
        <button className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-semibold text-navy">
          Saved areas <span className="text-navy/30">›</span>
        </button>
        <div className="mx-4 border-t border-navy/10" />
        <button className="w-full px-4 py-4 text-left text-sm font-semibold text-impass">
          Log out
        </button>
      </div>

      <p className="mt-4 text-center text-[11px] text-navy/40">
        Demo profile — accounts are not part of this MVP.
      </p>
    </div>
  );
}
