/** Integer paise internally. Never invent earnings — callers supply ledger values. */

export const PAISE_PER_RUPEE = 100;

export function paise(rupees: number): number {
  return Math.round(rupees * PAISE_PER_RUPEE);
}

export function formatPaise(amountPaise: number, locale = "en-IN"): string {
  const sign = amountPaise < 0 ? "-" : "";
  const abs = Math.abs(amountPaise);
  const rupees = Math.floor(abs / 100);
  const frac = abs % 100;
  const grouped = rupees.toLocaleString(locale);
  return `${sign}₹${grouped}.${String(frac).padStart(2, "0")}`;
}

export function assertNonNegativePaise(amountPaise: number): void {
  if (!Number.isInteger(amountPaise) || amountPaise < 0) {
    throw new Error("Amount must be a non-negative integer (paise)");
  }
}

export function sumPaise(lines: ReadonlyArray<{ amountPaise: number }>): number {
  return lines.reduce((acc, l) => acc + l.amountPaise, 0);
}
