/**
 * Daftar tujuan keperluan tamu yang valid.
 * HARUS selaras dengan `PURPOSES` di backend/src/lib/constants.ts.
 */
export const PURPOSES = [
  "Kunjungan",
  "Kedinasan",
  "Inspeksi",
  "Tamu Vendor",
  "Lainnya",
] as const;

export type Purpose = (typeof PURPOSES)[number];
