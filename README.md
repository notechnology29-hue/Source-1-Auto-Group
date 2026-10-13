# Source 1 Auto Group

Used-car dealership storefront and staff portal. Next.js (App Router), TypeScript, Tailwind v4, Framer Motion,
Supabase (Postgres + Auth + RLS), Cloudinary (photos), Mux (video).

## Features
- Storefront: hero, inventory grid with live payment calculator, transparency hotspot inspector, Mux walkaround player, Hold My Ride modal with WhatsApp/SMS handoff.
- Admin (`/admin`): Supabase email/password sign-in, inventory list, VIN decoder (NHTSA) intake, edit/delete, photo/video uploads, hotspot studio, leads list.
- Lead notifications to Slack and/or email (Resend).

## Local development
```bash
npm install
cp .env.example .env.local   # optional: without Supabase vars the site runs on seed data (demo mode)
npm run dev
```
Open http://localhost:3000. Checks: `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## Deploying
See [DEPLOYMENT.md](./DEPLOYMENT.md) for Supabase setup, creating the admin user, environment variables and the Vercel steps.
Database schema: [supabase/schema.sql](./supabase/schema.sql).

> This project uses Next.js 16 conventions (`src/proxy.ts` instead of middleware, `cacheComponents`). See `AGENTS.md`.
