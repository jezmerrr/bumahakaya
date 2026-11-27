"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { relativeTime } from "@/lib/time";
import type { Report } from "@/lib/types";
import { useStore } from "@/lib/store";
import { CURRENT_USER } from "@/lib/user";
import { CommentThread } from "./CommentThread";
import { CommentIcon, MapPinIcon, ThumbsUpIcon } from "./icons";
import { EditReportSheet, ReportDetail } from "./ReportDetail";
import { ConfirmDeleteDialog } from "./Sheet";
import { Avatar, OwnerActions, SensorBar, StatusPill } from "./ui";

export function ReportCard({
  report,
  distanceM,
}: {
  report: Report;
  distanceM?: number;
}) {
  const { comments, removeReport } = useStore();
  const commentCount = comments.filter((c) => c.reportId === report.id).length;
  const isMine =
    report.source === "community" && report.author === CURRENT_USER.handle;

  const [confirms, setConfirms] = useState(report.confirms ?? 0);
  const [confirmed, setConfirmed] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const title = report.headline ?? report.streetName;
  const body = report.description ?? report.note;

  function toggleConfirm() {
    setConfirms((c) => c + (confirmed ? -1 : 1));
    setConfirmed((v) => !v);
  }

  function deleteReport() {
    setConfirmingDelete(false);
    setDetailOpen(false);
    removeReport(report.id);
  }

  const ownerActions = isMine ? (
    <OwnerActions
      onEdit={() => setEditing(true)}
      onDelete={() => setConfirmingDelete(true)}
    />
  ) : null;

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
              {report.editedAt ? " · Edited" : ""}
            </span>
          </p>
          <p className="flex items-center gap-1 text-xs text-navy/50">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{report.streetName}</span>
          </p>
        </div>
        {ownerActions}
      </div>

      {/* Tapping anywhere in this block opens the details page. The title
          button's ::after stretches over the whole block, so there is one
          real button (good for screen readers) but a big tap target. */}
      <div className="relative mt-3">
        <div className="flex gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 font-display text-base font-extrabold leading-snug text-navy">
              <button
                type="button"
                onClick={() => setDetailOpen(true)}
                className="text-left after:absolute after:-inset-1.5 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-signal active:after:bg-navy/5"
              >
                {title}
              </button>
            </h3>
            {body ? (
              <p className="mt-1 line-clamp-2 text-sm text-navy/60">{body}</p>
            ) : null}
          </div>
          {report.photoUrl ? (
            <img
              src={report.photoUrl}
              alt={`Flood at ${report.streetName}`}
              className="h-20 w-24 shrink-0 rounded-xl object-cover"
            />
          ) : null}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <StatusPill severity={report.severity} />
          <span aria-hidden="true" className="text-xs font-semibold text-signal">
            View details ›
          </span>
        </div>
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
          onClick={() => setCommentsOpen((v) => !v)}
          aria-expanded={commentsOpen}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-navy/5 py-2 text-sm font-semibold text-navy/70"
        >
          <CommentIcon className="h-4 w-4" /> Comments ({commentCount})
        </button>
      </div>

      {commentsOpen ? (
        <div className="mt-3 border-t border-navy/10 pt-3">
          <CommentThread reportId={report.id} />
        </div>
      ) : null}

      {/* Overlays render into <body>; listed in stacking order. */}
      {detailOpen ? (
        <ReportDetail
          report={report}
          distanceM={distanceM}
          confirms={confirms}
          confirmed={confirmed}
          onToggleConfirm={toggleConfirm}
          isMine={isMine}
          onEdit={() => setEditing(true)}
          onDelete={() => setConfirmingDelete(true)}
          onClose={() => setDetailOpen(false)}
        />
      ) : null}
      {editing ? (
        <EditReportSheet report={report} onClose={() => setEditing(false)} />
      ) : null}
      {confirmingDelete ? (
        <ConfirmDeleteDialog
          title="Delete this report?"
          message="It will be removed from the feed and from My reports. This can't be undone."
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={deleteReport}
        />
      ) : null}
    </article>
  );
}
