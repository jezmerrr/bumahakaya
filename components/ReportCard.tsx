"use client";

/* eslint-disable @next/next/no-img-element */
import { useId, useState } from "react";
import { severityColor, severityInk, severityShort } from "@/lib/severity";
import { relativeTime } from "@/lib/time";
import type { Report } from "@/lib/types";
import { useStore } from "@/lib/store";
import { CURRENT_USER } from "@/lib/user";
import { CommentThread } from "./CommentThread";
import { CameraIcon, CommentIcon, ThumbsUpIcon, UserIcon } from "./icons";
import { EditReportSheet, ReportDetail } from "./ReportDetail";
import { ConfirmDeleteDialog } from "./Sheet";
import { OwnerActions, SensorBar } from "./ui";

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

  const photoLabelId = useId();
  const title = report.headline ?? report.streetName;
  const body = report.description ?? report.note;
  const color = severityColor(report.severity);
  const ink = severityInk(report.severity);

  function toggleConfirm() {
    setConfirms((c) => c + (confirmed ? -1 : 1));
    setConfirmed((v) => !v);
  }

  function deleteReport() {
    setConfirmingDelete(false);
    setDetailOpen(false);
    removeReport(report.id);
  }


  return (
    <article
      data-testid="report-card"
      className="overflow-hidden rounded-3xl bg-surface shadow-sm"
    >
      {/* Tapping anywhere in this block (photo strip included) opens the
          details page. The title button's ::after stretches over the whole
          block, so there is one real button (good for screen readers) but a
          big tap target. */}
      <div className="relative">
        {report.photoUrl ? (
          <PhotoPeek src={report.photoUrl} labelId={photoLabelId} />
        ) : null}

        <div className="flex gap-3 px-3.5 pt-3.5">
          <span
            aria-hidden="true"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
            style={{ backgroundColor: `${color}1f`, color: ink }}
          >
            <UserIcon className="h-5 w-5" />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 font-display text-[15px] font-extrabold leading-snug text-ink">
              <button
                type="button"
                onClick={() => setDetailOpen(true)}
                aria-describedby={report.photoUrl ? photoLabelId : undefined}
                className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-signal active:after:bg-ink/5"
              >
                {title}
              </button>
            </h3>
            {body ? (
              <p className="line-clamp-1 text-sm text-ink/70">{body}</p>
            ) : null}
            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-ink/70">
              <span
                className="inline-flex shrink-0 items-center gap-1 font-semibold"
                style={{ color: ink }}
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {severityShort(report.severity)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{report.streetName}</span>
              <span aria-hidden="true">·</span>
              <span className="shrink-0">
                {relativeTime(report.timestamp)}
                {report.editedAt ? " · Edited" : ""}
              </span>
            </p>
          </div>
        </div>
      </div>

      {report.sensorCm != null ? (
        <div className="mt-2.5 pl-[4.375rem] pr-3.5">
          <SensorBar
            cm={report.sensorCm}
            trend={report.trend}
            severity={report.severity}
            distanceM={distanceM}
          />
        </div>
      ) : null}

      <div className="mx-3.5 mb-2.5 mt-2 flex items-center gap-1 border-t border-ink/5 pt-2">
        <button
          type="button"
          onClick={toggleConfirm}
          aria-pressed={confirmed}
          aria-label={`Confirm (${confirms})`}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            confirmed ? "bg-signal text-white" : "text-ink/70 hover:bg-ink/5"
          }`}
        >
          <ThumbsUpIcon className="h-4 w-4" /> {confirms}
        </button>
        <button
          type="button"
          onClick={() => setCommentsOpen((v) => !v)}
          aria-expanded={commentsOpen}
          aria-label={`Comments (${commentCount})`}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
            commentsOpen ? "bg-ink/5 text-ink" : "text-ink/70 hover:bg-ink/5"
          }`}
        >
          <CommentIcon className="h-4 w-4" /> {commentCount}
        </button>
        <span className="ml-auto truncate pl-2 text-xs text-ink/60">
          {report.author ? `@${report.author}` : "Anonymous"}
        </span>
        {isMine ? (
          <OwnerActions
            size="sm"
            onEdit={() => setEditing(true)}
            onDelete={() => setConfirmingDelete(true)}
          />
        ) : null}
      </div>

      {commentsOpen ? (
        <div className="mx-3.5 mb-3.5 border-t border-ink/5 pt-3">
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

// A frosted peek at the top of the post's photo. The full, sharp photo is on
// the details page; the strip itself is part of the card's tap area.
function PhotoPeek({ src, labelId }: { src: string; labelId: string }) {
  return (
    <div className="relative h-14 overflow-hidden">
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover object-top blur-[5px]"
      />
      {/* Glass: a soft tint that fades into the card */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-b from-surface/10 via-surface/30 to-surface/80"
      />
      <span
        id={labelId}
        className="absolute bottom-1.5 left-3.5 inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface/70 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur-md"
      >
        <CameraIcon aria-hidden="true" className="h-3.5 w-3.5" />
        Photo · tap to view
      </span>
    </div>
  );
}
