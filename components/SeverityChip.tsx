import { severityColor, severityLabel } from "@/lib/severity";
import type { Severity } from "@/lib/types";

export function SeverityChip({ severity }: { severity: Severity }) {
  return (
    <span
      style={{ backgroundColor: severityColor(severity), color: "#fff" }}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
    >
      {severityLabel(severity)}
    </span>
  );
}
