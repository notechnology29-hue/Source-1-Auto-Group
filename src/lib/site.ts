/** Canonical site origin. Set NEXT_PUBLIC_SITE_URL once a custom domain is connected. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "https://source-1-auto-group.vercel.app"
).replace(/\/+$/, "");
