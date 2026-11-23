"use client";

import { useStore } from "@/lib/store";
import { relativeTime } from "@/lib/time";
import type { Platform } from "@/lib/types";
import { DemoDataBadge } from "./DemoDataBadge";

const PLATFORM: Record<Platform, { label: string; className: string }> = {
  facebook: { label: "Facebook", className: "bg-[#1877F2] text-white" },
  x: { label: "X", className: "bg-navy text-white" },
  reddit: { label: "Reddit", className: "bg-[#FF4500] text-white" },
};

export function UpdatesSection() {
  const { social } = useStore();

  return (
    <div className="space-y-3 p-4">
      <h2 className="font-display text-lg font-extrabold text-navy">
        From social media
      </h2>
      <p className="-mt-2 text-xs text-navy/50">
        Flood-related posts pulled together so you don&apos;t have to switch
        apps.
      </p>
      {social.map((post) => {
        const p = PLATFORM[post.platform];
        return (
          <article
            key={post.id}
            className="rounded-2xl border border-navy/10 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.className}`}
              >
                {p.label}
              </span>
              <span className="text-xs font-semibold text-navy">
                {post.author}
              </span>
              <DemoDataBadge />
            </div>
            <p className="mt-2 text-xs text-navy/70">{post.text}</p>
            <div className="mt-2 flex items-center justify-between">
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-signal"
              >
                View post
              </a>
              <span className="text-[11px] text-navy/50">
                {relativeTime(post.timestamp)}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
