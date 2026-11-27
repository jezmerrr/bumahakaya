import { relativeTime } from "@/lib/time";
import type { Platform, SocialPost } from "@/lib/types";
import { DemoDataBadge } from "./DemoDataBadge";

const PLATFORM: Record<Platform, { label: string; className: string }> = {
  facebook: { label: "Facebook", className: "bg-[#1877F2] text-white" },
  x: { label: "X", className: "bg-navy text-white" },
  reddit: { label: "Reddit", className: "bg-[#FF4500] text-white" },
};

export function SocialCard({ post }: { post: SocialPost }) {
  const p = PLATFORM[post.platform];
  return (
    <article
      data-testid="social-card"
      className="rounded-3xl bg-white p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.className}`}
        >
          {p.label}
        </span>
        <span className="text-xs font-semibold text-navy">{post.author}</span>
        <DemoDataBadge />
      </div>
      <p className="mt-2 text-sm text-navy/70">{post.text}</p>
      <div className="mt-2 flex items-center justify-between">
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold text-signal"
        >
          View post
        </a>
        <span className="text-[11px] text-navy/65">
          {relativeTime(post.timestamp)}
        </span>
      </div>
    </article>
  );
}
