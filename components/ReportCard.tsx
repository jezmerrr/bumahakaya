"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, type FormEvent } from "react";
import { relativeTime } from "@/lib/time";
import type { Report } from "@/lib/types";
import { useStore } from "@/lib/store";
import { CURRENT_USER } from "@/lib/user";
import { Avatar, SensorBar, StatusPill } from "./ui";
import { CommentIcon, MapPinIcon, ThumbsUpIcon } from "./icons";

export function ReportCard({
  report,
  distanceM,
}: {
  report: Report;
  distanceM?: number;
}) {
  const { comments, addComment, removeReport, removeComment } = useStore();
  const thread = comments.filter((c) => c.reportId === report.id);
  const isMine =
    report.source === "community" && report.author === CURRENT_USER.handle;

  const [confirms, setConfirms] = useState(report.confirms ?? 0);
  const [confirmed, setConfirmed] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const title = report.headline ?? report.streetName;
  const body = report.description ?? report.note;

  function toggleConfirm() {
    setConfirms((c) => c + (confirmed ? -1 : 1));
    setConfirmed((v) => !v);
  }

  function postComment(e: FormEvent) {
    e.preventDefault();
    addComment(report.id, draft);
    setDraft("");
  }

  return (
    <article
      data-testid="report-card"
      className="rounded-3xl bg-white p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <Avatar name={report.author ?? report.streetName} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">
            <span className="font-semibold text-navy">
              {report.author ?? "Anonymous"}
            </span>
            <span className="text-navy/40">
              {" "}
              · {relativeTime(report.timestamp)}
            </span>
          </p>
          <p className="flex items-center gap-1 text-xs text-navy/50">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{report.streetName}</span>
          </p>
        </div>
        {isMine ? (
          <button
            type="button"
            aria-label="Remove report"
            onClick={() => removeReport(report.id)}
            className="shrink-0 self-start rounded-full bg-impass/10 px-2.5 py-1 text-[11px] font-semibold text-impass"
          >
            Remove
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-extrabold leading-snug text-navy">
            {title}
          </h3>
          {body ? <p className="mt-1 text-sm text-navy/60">{body}</p> : null}
        </div>
        {report.photoUrl ? (
          <img
            src={report.photoUrl}
            alt={`Flood at ${report.streetName}`}
            className="h-20 w-24 shrink-0 rounded-xl object-cover"
          />
        ) : null}
      </div>

      <div className="mt-3">
        <StatusPill severity={report.severity} />
      </div>

      {report.sensorCm != null ? (
        <div className="mt-3">
          <SensorBar
            cm={report.sensorCm}
            trend={report.trend}
            severity={report.severity}
            distanceM={distanceM}
          />
        </div>
      ) : null}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={toggleConfirm}
          aria-pressed={confirmed}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold ${
            confirmed ? "bg-signal text-white" : "bg-navy/5 text-navy/70"
          }`}
        >
          <ThumbsUpIcon className="h-4 w-4" /> Confirm ({confirms})
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-navy/5 py-2 text-sm font-semibold text-navy/70"
        >
          <CommentIcon className="h-4 w-4" /> Comments ({thread.length})
        </button>
      </div>

      {open ? (
        <div className="mt-3 border-t border-navy/10 pt-3">
          {thread.length === 0 ? (
            <p className="text-xs text-navy/40">
              Wala pang comments. Ikaw ang mauna.
            </p>
          ) : (
            <ul className="space-y-2">
              {thread.map((c) => (
                <li key={c.id} className="flex gap-2">
                  <Avatar name={c.author} className="h-7 w-7 text-[10px]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs">
                      <span className="font-semibold text-navy">
                        {c.author}
                      </span>
                      <span className="text-navy/40">
                        {" "}
                        · {relativeTime(c.timestamp)}
                      </span>
                      {c.author === CURRENT_USER.handle ? (
                        <button
                          type="button"
                          aria-label="Remove comment"
                          onClick={() => removeComment(c.id)}
                          className="ml-2 font-semibold text-impass"
                        >
                          Remove
                        </button>
                      ) : null}
                    </p>
                    <p className="text-sm text-navy/70">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={postComment} className="mt-3 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a comment…"
              className="min-w-0 flex-1 rounded-full border border-navy/15 bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-full bg-signal px-4 py-2 text-sm font-semibold text-white"
            >
              Post
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}
