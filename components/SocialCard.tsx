import { relativeTime } from "@/lib/time";
import type { Platform, SocialPost } from "@/lib/types";
import { DemoDataBadge } from "./DemoDataBadge";

const PLATFORM: Record<Platform, { label: string; className: string }> = {
  facebook: { label: "Facebook", className: "bg-[#1877F2] text-white" },
  x: { label: "X", className: "bg-ink text-surface" },
  reddit: { label: "Reddit", className: "bg-[#FF4500] text-white" },
};

// `compact` is the fixed-width card used in the sideways "From social media"
// row on Home; the full-width card is used when showing only social posts.
export function SocialCard({
  post,
  compact = false,
}: {
  post: SocialPost;
  compact?: boolean;
}) {
  const p = PLATFORM[post.platform];
  return (
    <article
      data-testid="social-card"
      className={`flex flex-col rounded-3xl bg-surface p-4 shadow-sm ${
        compact ? "h-full w-64 shrink-0 snap-start" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.className}`}
        >
          {p.label}
        </span>
        <span className="text-xs font-semibold text-ink">{post.author}</span>
        <DemoDataBadge />
      </div>
      <p
        className={`mt-2 text-sm text-ink/70 ${compact ? "line-clamp-3 flex-1" : ""}`}
      >
        {post.text}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold text-signal"
        >
          View post
        </a>
        <span className="text-[11px] text-ink/65">
          {relativeTime(post.timestamp)}
        </span>
      </div>
    </article>
  );
}
