# Deploying Source 1 Auto Group to Vercel

## 1. Supabase
- [ ] Create a project. In **SQL Editor**, run all of `supabase/schema.sql`.
- [ ] **Project Settings → API**: copy the Project URL and the `anon` public key.
      Do NOT use the `service_role` key anywhere; the app doesn't need it.
- [ ] **Authentication → Providers**: keep Email enabled. Turn **off** "Allow new users to sign up"
      (Authentication → Sign In / Providers) so strangers can't create accounts.
- [ ] **Authentication → URL Configuration**: set Site URL to your production domain.

## 2. Create the admin user
Admin = a signed-in user whose `app_metadata.role` is `admin` (users can't edit this themselves).
1. **Authentication → Users → Add user → Create new user**: enter email and password, tick *Auto Confirm User*.
2. In **SQL Editor** run:
   ```sql
   update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
   where email = 'you@yourdealership.com';
   ```
3. Sign in at `/admin/login`. If you were already signed in, sign out and in again so the JWT picks up the role.

## 3. Cloudinary
- [ ] Copy Cloud name, API key and API secret from the dashboard.
- [ ] (Optional) Settings → Security: restrict allowed fetch/delivery domains.

## 4. Mux
- [ ] Settings → API Access Tokens → create a token with **Mux Video** read/write. Copy Token ID and Secret.
- [ ] Note: the CORS origin for direct uploads is set by the app to the request origin; no extra Mux config needed.

## 5. Vercel environment variables
Project → Settings → Environment Variables (Production, plus Preview if wanted):

| Variable | Source | Public? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API | yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase API | yes |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary | yes |
| `CLOUDINARY_API_KEY` | Cloudinary | no |
| `CLOUDINARY_API_SECRET` | Cloudinary | **secret** |
| `MUX_TOKEN_ID` | Mux | no |
| `MUX_TOKEN_SECRET` | Mux | **secret** |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook (optional) | **secret** |
| `RESEND_API_KEY` | Resend (optional) | **secret** |
| `LEAD_FROM_EMAIL` | A sender on a domain verified in Resend, e.g. `Source 1 <leads@yourdomain.com>` | no |
| `LEAD_NOTIFY_EMAIL` | Who gets lead emails (comma-separated) | no |

Lead notifications: Slack needs only the webhook (Slack → Apps → Incoming Webhooks). Email needs all three Resend
variables. Set either, both, or neither. Failures are logged and never block the customer's request.

`NEXT_PUBLIC_*` values are baked in at build time, so redeploy after changing them.
Without the Supabase variables the site runs on seed data (demo mode); don't ship that to production.

## 6. Deploy
- [ ] Push to GitHub (`git remote add origin <url>; git push -u origin main`), then in Vercel choose **Add New → Project**
      and import the repo. Framework preset: Next.js; defaults are fine. Add the environment variables above before the first deploy.
- [ ] Set Node.js 20+ (Project Settings → General) if it isn't already.
- [ ] Add the domain; confirm the Supabase Site URL matches.
- [ ] Every push to `main` deploys to production; other branches get preview URLs (add env vars to Preview too).

## 7. Post-deploy smoke test
- [ ] Home page lists vehicles from Supabase (seed data gone once the DB has rows).
- [ ] `/admin/intake` redirects to `/admin/login` when signed out; sign-in works.
- [ ] Decode a VIN, create a vehicle, upload a photo (Cloudinary) and a video (Mux), drop a hotspot.
- [ ] The vehicle and hotspot appear on the storefront.
- [ ] Submit a Hold My Ride request; lead shows in `/admin/leads`; WhatsApp link has the right stock number.
- [ ] Mark the lead as contacted.
- [ ] Confirm anon can't read leads: in an incognito console, a `select` on `leads` using the anon key returns nothing.

## Known limitations
No lead SMS/push notification beyond Slack and email. Deleting a vehicle removes its database rows only; the files stay in Cloudinary/Mux
(delete them from those dashboards if needed). A vehicle with leads can't be deleted; mark it Sold instead.
