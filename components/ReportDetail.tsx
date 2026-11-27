"use client";

/* eslint-disable @next/next/no-img-element */
import { severityLabel, waterLevelLabel } from "@/lib/severity";
import { formatDateTime, relativeTime } from "@/lib/time";
import type { Report } from "@/lib/types";
import { useStore } from "@/lib/store";
import { CommentThread } from "./CommentThread";
import { FloodScene } from "./FloodScene";
import { ThumbsUpIcon } from "./icons";
import { headlineFor, ReportForm, type ReportFormValues } from "./ReportForm";
import { Sheet } from "./Sheet";
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
  confirms,
  confirmed,
  onToggleConfirm,
  isMine,
  onEdit,
  onDelete,
  onClose,
}: {
  report: Report;
  distanceM?: number;
  confirms: number;
  confirmed: boolean;
  onToggleConfirm: () => void;
  isMine: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const { comments } = useStore();
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
        <FloodScene level={report.waterLevel} severity={report.severity} />

        {report.photoUrl ? (
          <img
            src={report.photoUrl}
            alt={`Flood at ${report.streetName}`}
            className="max-h-72 w-full rounded-3xl object-cover"
          />
        ) : null}

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar name={report.author ?? report.streetName} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy">
                {report.author ?? "Anonymous"}
              </p>
              <p className="text-xs text-navy/50">
                <time dateTime={report.timestamp}>
                  {formatDateTime(report.timestamp)}
                </time>{" "}
                · {relativeTime(report.timestamp)}
                {report.editedAt ? " · Edited" : ""}
              </p>
            </div>
          </div>

          <h3 className="mt-3 font-display text-xl font-extrabold leading-snug text-navy">
            {title}
          </h3>
          <div className="mt-2">
            <StatusPill severity={report.severity} />
          </div>
          {body ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-navy/70">
              {body}
            </p>
          ) : (
            <p className="mt-3 text-sm italic text-navy/40">
              No description added.
            </p>
          )}
        </section>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-navy/50">
            Flood details
          </h3>
          <dl className="mt-1 divide-y divide-navy/10 text-sm">
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
          onClick={onToggleConfirm}
          aria-pressed={confirmed}
          className={`flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 text-sm font-semibold ${
            confirmed ? "bg-signal text-white" : "bg-white text-navy/70 shadow-sm"
          }`}
        >
          <ThumbsUpIcon className="h-4 w-4" /> Confirm ({confirms})
        </button>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy/50">
            Comments ({commentCount})
          </h3>
          <CommentThread reportId={report.id} />
        </section>
      </div>
    </Sheet>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-navy/50">{label}</dt>
      <dd className="text-right font-semibold text-navy">{value}</dd>
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
