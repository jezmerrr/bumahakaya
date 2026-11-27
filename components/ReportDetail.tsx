"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { severityLabel, waterLevelLabel } from "@/lib/severity";
import { formatDateTime, relativeTime } from "@/lib/time";
import type { Report } from "@/lib/types";
import { useStore } from "@/lib/store";
import { CURRENT_USER } from "@/lib/user";
import { CommentThread } from "./CommentThread";
import { DemoDataBadge } from "./DemoDataBadge";
import { FloodScene } from "./FloodScene";
import { DisputedNotice, FlagSheet } from "./FlagReport";
import { FlagIcon, MapPinIcon, ThumbsUpIcon } from "./icons";
import { headlineFor, ReportForm, type ReportFormValues } from "./ReportForm";
import { ConfirmDeleteDialog, Sheet } from "./Sheet";
import {
  Avatar,
  formatDistance,
  OwnerActions,
  SensorBar,
  StatusPill,
} from "./ui";

// Everything about one report on its own page: full text, photo, flood
// details, confirm, and the whole comment thread.
export function ReportDetail({
  report,
  distanceM,
  isMine,
  onEdit,
  onDelete,
  onClose,
  onShowOnMap,
}: {
  report: Report;
  distanceM?: number;
  isMine: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  // Open the Maps tab with this report selected.
  onShowOnMap?: () => void;
}) {
  const { comments, confirmCount, isConfirmed, toggleConfirm, myFlag, isDisputed } =
    useStore();
  const [flagging, setFlagging] = useState(false);
  const flagged = myFlag(report.id) !== null;
  const confirms = confirmCount(report);
  const confirmed = isConfirmed(report.id);
  const commentCount = comments.filter((c) => c.reportId === report.id).length;
  const title = report.headline ?? report.streetName;
  const body = report.description ?? report.note;

  return (
    <Sheet
      title="Report details"
      onClose={onClose}
      actions={
        isMine ? <OwnerActions onEdit={onEdit} onDelete={onDelete} /> : null
      }
    >
      <div className="space-y-3">
        {/* The real photo comes first and is shown whole (not cropped). */}
        {report.photoUrl ? (
          <figure className="overflow-hidden rounded-3xl bg-surface shadow-sm">
            <img
              src={report.photoUrl}
              alt={`Flood at ${report.streetName}`}
              className="block h-auto w-full"
            />
            {report.photoCredit || report.photoUrl.startsWith("/demo/") ? (
              <figcaption className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2.5 text-xs text-ink/70">
                {report.photoCredit ? (
                  <span>Photo: {report.photoCredit}</span>
                ) : null}
                {report.photoUrl.startsWith("/demo/") ? <DemoDataBadge /> : null}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        <FloodScene level={report.waterLevel} severity={report.severity} />

        {isDisputed(report) ? <DisputedNotice report={report} /> : null}

        <section className="rounded-3xl bg-surface p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar name={report.author ?? report.streetName} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                {report.author ??
                  (report.source === "sensor" ? "FloodWatch sensor" : "Anonymous")}
              </p>
              <p className="text-xs text-ink/65">
                <time dateTime={report.timestamp}>
                  {formatDateTime(report.timestamp)}
                </time>{" "}
                · {relativeTime(report.timestamp)}
                {report.editedAt ? " · Edited" : ""}
              </p>
            </div>
          </div>

          <h3 className="mt-3 font-display text-xl font-extrabold leading-snug text-ink">
            {title}
          </h3>
          <div className="mt-2">
            <StatusPill severity={report.severity} />
          </div>
          {body ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/70">
              {body}
            </p>
          ) : (
            <p className="mt-3 text-sm italic text-ink/60">
              No description added.
            </p>
          )}
        </section>

        <section className="rounded-3xl bg-surface p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink/65">
              Flood details
            </h3>
            {onShowOnMap ? (
              <button
                type="button"
                onClick={onShowOnMap}
                className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-ink/10"
              >
                <MapPinIcon className="h-3.5 w-3.5" />
                Show on map
              </button>
            ) : null}
          </div>
          <dl className="mt-1 divide-y divide-ink/10 text-sm">
            <Fact label="Location" value={report.streetName} />
            <Fact
              label="Water level"
              value={waterLevelLabel(report.waterLevel)}
            />
            <Fact label="Road condition" value={severityLabel(report.severity)} />
            {distanceM != null ? (
              <Fact
                label="Distance"
                value={`${formatDistance(distanceM)} from DLSU`}
              />
            ) : null}
          </dl>
          {report.sensorCm != null ? (
            <div className="mt-3">
              <SensorBar
                cm={report.sensorCm}
                trend={report.trend}
                severity={report.severity}
              />
            </div>
          ) : null}
        </section>

        <button
          type="button"
          onClick={() => toggleConfirm(report.id)}
          aria-pressed={confirmed}
          // One vote per person, and not on your own report.
          disabled={isMine}
          className={`flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 text-sm font-semibold disabled:cursor-not-allowed ${
            confirmed ? "bg-signal text-white" : "bg-surface text-ink/70 shadow-sm"
          }`}
        >
          <ThumbsUpIcon className="h-4 w-4" /> Confirm ({confirms})
        </button>
        {isMine ? (
          <p className="-mt-1 text-center text-xs text-ink/60">
            Others confirm your report when they see the same flooding.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setFlagging(true)}
            aria-haspopup="dialog"
            className="-mt-1 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-ink/65 hover:text-[color:var(--sev-ink-impass)]"
          >
            <FlagIcon className="h-3.5 w-3.5" />
            {flagged ? "You flagged this post · change" : "Flag as fake or wrong"}
          </button>
        )}
        {flagging ? (
          <FlagSheet report={report} onClose={() => setFlagging(false)} />
        ) : null}

        <section className="rounded-3xl bg-surface p-4 shadow-sm">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/65">
            Comments ({commentCount})
          </h3>
          <CommentThread reportId={report.id} />
        </section>
      </div>
    </Sheet>
  );
}

// The details page on its own (opened from the map), with the same confirm,
// edit, and delete behavior as opening it from a feed card.
export function ReportDetailPage({
  report,
  distanceM,
  onClose,
  onShowOnMap,
}: {
  report: Report;
  distanceM?: number;
  onClose: () => void;
  onShowOnMap?: () => void;
}) {
  const { removeReport } = useStore();
  const isMine =
    report.source === "community" && report.author === CURRENT_USER.handle;
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <>
      <ReportDetail
        report={report}
        distanceM={distanceM}
        isMine={isMine}
        onShowOnMap={onShowOnMap}
        onEdit={() => setEditing(true)}
        onDelete={() => setConfirmingDelete(true)}
        onClose={onClose}
      />
      {editing ? (
        <EditReportSheet report={report} onClose={() => setEditing(false)} />
      ) : null}
      {confirmingDelete ? (
        <ConfirmDeleteDialog
          title="Delete this report?"
          message="It will be removed from the feed and from My reports. This can't be undone."
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            setConfirmingDelete(false);
            removeReport(report.id);
            onClose();
          }}
        />
      ) : null}
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-ink/65">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}

// The Report form, pre-filled, on its own page. Saving keeps the original
// post time and marks the report as edited.
export function EditReportSheet({
  report,
  onClose,
}: {
  report: Report;
  onClose: () => void;
}) {
  const { updateReport } = useStore();

  const initial: ReportFormValues = {
    location: report.streetName,
    waterLevel: report.waterLevel,
    severity: report.severity,
    description: report.description ?? report.note ?? "",
    photoUrl: report.photoUrl,
    pin: { lat: report.lat, lng: report.lng },
  };

  function save(values: ReportFormValues) {
    // Only rewrite the headline if it was the automatic one; keep custom ones.
    const autoHeadline = report.headline === headlineFor(report.streetName);
    updateReport(report.id, {
      streetName: values.location,
      headline: autoHeadline ? headlineFor(values.location) : report.headline,
      waterLevel: values.waterLevel,
      severity: values.severity,
      passable: values.severity !== "Impassable",
      description: values.description,
      photoUrl: values.photoUrl,
      ...(values.pin ? { lat: values.pin.lat, lng: values.pin.lng } : {}),
    });
    onClose();
  }

  return (
    <Sheet title="Edit report" onClose={onClose}>
      <ReportForm
        initial={initial}
        submitLabel="Save changes"
        onSubmit={save}
        onCancel={onClose}
      />
    </Sheet>
  );
}
