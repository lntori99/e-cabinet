import type {
  ArchiveKind,
  ArchiveRecord,
  SearchFilters,
} from "@/models/response/base-response";
import { OCR_CONFIDENCE_FLOOR, SEARCH_THRESHOLD_MS } from "@/data/archive";

export type Tone = "green" | "amber" | "red" | "neutral" | "blue";

/**
 * Three kinds of record, three identities — so they take categorical slots in a
 * fixed order and keep them wherever they are plotted or listed.
 */
export const KIND_COLOR: Record<ArchiveKind, string> = {
  Paper: "var(--viz-1)",
  Decision: "var(--viz-2)",
  Action: "var(--viz-3)",
};

export const KIND_TONE: Record<ArchiveKind, Tone> = {
  Paper: "blue",
  Decision: "green",
  Action: "neutral",
};

export const ALL_KINDS: ArchiveKind[] = ["Paper", "Decision", "Action"];

export interface Hit {
  record: ArchiveRecord;
  /** Where the term was found, for the snippet under the title. */
  snippet: string;
  /** True when the term appears in the body but not the title — FR-SCH-03. */
  fullTextOnly: boolean;
}

export interface SearchOutcome {
  hits: Hit[];
  /** FR-SCH-08 — measured, not asserted. */
  elapsedMs: number;
}

/**
 * FR-SCH-01 and FR-SCH-03. The query runs over the body as well as the title,
 * and the filter set is the one the requirement names: meeting, ministry,
 * keyword, date, classification and status.
 *
 * The corpus handed in has already been through the entitlement filter, so
 * nothing here can widen what the viewer sees.
 */
export function runSearch(
  corpus: ArchiveRecord[],
  query: string,
  filters: SearchFilters,
): SearchOutcome {
  const started = performance.now();
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);

  const hits: Hit[] = [];

  for (const record of corpus) {
    if (!filters.kinds.includes(record.kind)) continue;
    if (filters.ministry !== "All" && record.ministry !== filters.ministry) continue;
    if (filters.meeting !== "All" && record.meetingId !== filters.meeting) continue;
    if (
      filters.classification !== "All" &&
      record.classification !== filters.classification
    )
      continue;
    if (filters.status !== "All" && record.status !== filters.status) continue;
    if (filters.from && record.date < filters.from) continue;
    if (filters.to && record.date > filters.to) continue;

    if (terms.length === 0) {
      hits.push({ record, snippet: excerpt(record.body, null), fullTextOnly: false });
      continue;
    }

    const title = record.title.toLowerCase();
    const body = record.body.toLowerCase();
    const id = record.id.toLowerCase();

    // Every term must appear somewhere. A search for two words is a search for
    // both of them, which is what people expect and what narrows a corpus.
    const matched = terms.every(
      (t) => title.includes(t) || body.includes(t) || id.includes(t),
    );
    if (!matched) continue;

    const inTitle = terms.some((t) => title.includes(t) || id.includes(t));
    const anchor = terms.find((t) => body.includes(t)) ?? null;
    hits.push({
      record,
      snippet: excerpt(record.body, anchor),
      fullTextOnly: !inTitle,
    });
  }

  // Kept to a decimal place rather than rounded to a whole millisecond: over a
  // corpus this size the answer is usually under 1 ms, and "0 ms" reads as an
  // unmeasured value rather than a fast one.
  const elapsedMs = Math.max(0.1, Math.round((performance.now() - started) * 10) / 10);
  return { hits, elapsedMs };
}

/** A window of the body around the first matching term. */
function excerpt(body: string, term: string | null, width = 190): string {
  if (!term) return body.length > width ? `${body.slice(0, width).trimEnd()}…` : body;
  const at = body.toLowerCase().indexOf(term);
  if (at < 0) return body.slice(0, width);
  const start = Math.max(0, at - Math.floor(width / 3));
  const end = Math.min(body.length, start + width);
  return `${start > 0 ? "…" : ""}${body.slice(start, end).trim()}${end < body.length ? "…" : ""}`;
}

/** Splits a string around the search terms so the matches can be marked. */
export function highlight(text: string, query: string): (string | { hit: string })[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);
  if (terms.length === 0) return [text];

  const pattern = new RegExp(`(${terms.map(escapeRegex).join("|")})`, "ig");
  return text
    .split(pattern)
    .filter((part) => part.length > 0)
    .map((part) => (terms.includes(part.toLowerCase()) ? { hit: part } : part));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** A one-line description of what was filtered, for the query log. */
export function describeFilters(filters: SearchFilters): string {
  const parts: string[] = [];
  if (filters.kinds.length < ALL_KINDS.length) parts.push(filters.kinds.join(", "));
  if (filters.ministry !== "All") parts.push(filters.ministry);
  if (filters.meeting !== "All") parts.push(filters.meeting);
  if (filters.classification !== "All") parts.push(filters.classification);
  if (filters.status !== "All") parts.push(filters.status);
  if (filters.from || filters.to)
    parts.push(`${filters.from || "any"} to ${filters.to || "any"}`);
  return parts.length === 0 ? "All record types" : parts.join(" · ");
}

/** FR-SCH-08 — over the NFR-PER-04 threshold. */
export function overThreshold(elapsedMs: number): boolean {
  return elapsedMs > SEARCH_THRESHOLD_MS;
}

/** FR-SCH-09 — a scan the platform is not confident it read correctly. */
export function lowConfidenceScan(record: ArchiveRecord): boolean {
  return record.ocr !== undefined && record.ocr.confidence < OCR_CONFIDENCE_FLOOR;
}
