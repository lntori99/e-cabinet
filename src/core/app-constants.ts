export const SITE = {
  name: "e-Cabinet",
  fullName: "National Secure e-Cabinet & Video Conferencing Platform",
  owner: "Ministry of Information & Communications Technology, Malawi",
  vendor: "Bahamus Limited",
  vendorAddress: "Atlantic Tower, Airport City, Liberation Road, Accra, Ghana",
  email: "info@bahamusghana.com",
  phone: "+265 1 770 000",
  productionSite: "Lilongwe",
  drSite: "Blantyre",
};

/**
 * The signed-in operator. Hard-coded while auth is a single demo account —
 * read this from the session once a real IdP is wired in.
 */
export const OPERATOR = {
  name: "Larry",
  email: "secretariat@cabinet.gov.mw",
  role: "Secretariat Administrator",
  shortRole: "Secretariat",
  ip: "10.20.4.11",
  /** FR-AUD-02 — the device identifier written onto every audit event. */
  device: "SEC-LT-0114 (managed laptop)",
} as const;

/**
 * FR-AUD-02 — audit timestamps come from a named synchronised source, not from
 * whichever machine happened to write the row.
 */
export const TIME_SOURCE = "NTP — Malawi Bureau of Standards, stratum 2";

export const CLASSIFICATIONS = [
  "TOP SECRET — CABINET",
  "SECRET",
  "CONFIDENTIAL",
  "RESTRICTED",
  "OFFICIAL",
] as const;

export type Classification = (typeof CLASSIFICATIONS)[number];

export const PAGE_SIZE = 6;
