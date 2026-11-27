import { severityShort, waterLevelLabel } from "./severity";
import type { Report, Severity, SocialPost } from "./types";

// Lowercase, strip accents, and collapse whitespace so "Parañaque  ST" and
// "paranaque st" compare equal.
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// True when every word of the query appears somewhere in the fields, so
// "taft estrada" finds a post that mentions both streets.
export function matchesQuery(
  fields: (string | undefined)[],
  query: string,
): boolean {
  const words = normalize(query).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalize(fields.filter(Boolean).join(" "));
  return words.every((w) => haystack.includes(w));
}

export interface FeedFilter {
  query: string;
  severity: Severity | null;
}

export function filterReports(
  reports: Report[],
  { query, severity }: FeedFilter,
): Report[] {
  return reports.filter(
    (r) =>
      (severity === null || r.severity === severity) &&
      matchesQuery(
        [
          r.headline,
          r.streetName,
          r.description,
          r.note,
          r.author,
          severityShort(r.severity),
          waterLevelLabel(r.waterLevel),
        ],
        query,
      ),
  );
}

export function filterSocial(posts: SocialPost[], query: string): SocialPost[] {
  return posts.filter((p) => matchesQuery([p.text, p.author], query));
}
