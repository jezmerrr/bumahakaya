"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { relativeTime } from "@/lib/time";
import type { Report } from "@/lib/types";
import { Avatar, SensorBar, StatusPill } from "./ui";
import { CommentIcon, MapPinIcon, ThumbsUpIcon } from "./icons";

export function ReportCard({
  report,
  distanceM,
}: {
  report: Report;
  distanceM?: number;
}) {
  const [confirms, setConfirms] = useState(report.confirms ?? 0);
  const [confirmed, setConfirmed] = useState(false);

  const title = report.headline ?? report.streetName;
  const body = report.description ?? report.note;

  function toggleConfirm() {
    setConfirms((c) => c + (confirmed ? -1 : 1));
    setConfirmed((v) => !v);
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
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-navy/5 py-2 text-sm font-semibold text-navy/70"
        >
          <CommentIcon className="h-4 w-4" /> Comments ({report.comments ?? 0})
        </button>
      </div>
    </article>
  );
}
