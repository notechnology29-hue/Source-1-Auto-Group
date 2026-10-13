import { DEFAULT_APR, LOAN_TERM_MONTHS } from "./constants";

/** Standard amortized monthly payment. Returns 0 when nothing is financed. */
export function monthlyPayment(
  price: number,
  down: number,
  aprPercent: number = DEFAULT_APR,
  months: number = LOAN_TERM_MONTHS,
): number {
  const principal = Math.max(price - Math.max(down, 0), 0);
  if (principal === 0) return 0;
  const r = aprPercent / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}
