import type {
  AnnotationKind,
  FormalComment,
  ReadingItem,
  ReviewFlag,
} from "@/models/response/base-response";

export type Tone = "green" | "amber" | "red" | "neutral" | "blue";

export const ANNOTATION_TONE: Record<AnnotationKind, Tone> = {
  Highlight: "amber",
  Note: "blue",
  Bookmark: "neutral",
};

export const COMMENT_TONE: Record<FormalComment["status"], Tone> = {
  Open: "amber",
  Answered: "blue",
  Closed: "neutral",
};

export const FLAG_TONE: Record<ReviewFlag["status"], Tone> = {
  Open: "amber",
  Scheduled: "blue",
  Resolved: "neutral",
};

export const FLAG_COLOR: Record<ReviewFlag["kind"], string> = {
  "Requires attention": "var(--viz-critical)",
  "Requires discussion": "var(--viz-warning)",
};

/** Where a reader has got to, as a percentage of the paper. */
export function progress(item: ReadingItem): number {
  if (item.pages === 0) return 0;
  return Math.min(100, Math.round((item.pagesRead / item.pages) * 100));
}

export function readingState(item: ReadingItem): {
  label: string;
  tone: Tone;
} {
  if (item.acknowledgedAt) return { label: "Acknowledged", tone: "green" };
  if (item.pagesRead === 0) return { label: "Not opened", tone: "neutral" };
  if (item.pagesRead >= item.pages) return { label: "Read", tone: "blue" };
  return { label: "Part read", tone: "amber" };
}

/**
 * The reading-progress scale is ordinal — not opened, part read, read,
 * acknowledged — so wherever it is plotted it takes one hue in monotone steps.
 */
export const PROGRESS_STEP = {
  Acknowledged: "var(--viz-ramp-5)",
  Read: "var(--viz-ramp-4)",
  "Part read": "var(--viz-ramp-3)",
  "Not opened": "var(--viz-ramp-1)",
} as const;
