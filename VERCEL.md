# Deploying Rapid Shopping to Vercel

This project is built on TanStack Start. The template targets Cloudflare Workers by default,
but `vercel.json` switches the Nitro build preset to `vercel` so the app deploys natively to
Vercel's serverless runtime.

## 1. Push to Git

Push the project to GitHub / GitLab / Bitbucket.

## 2. Import into Vercel

- New Project → Import your repo
- Framework preset: **Other** (auto-detected)
- Build command, install command, and output directory come from `vercel.json` — leave them blank.

## 3. Add environment variables

In **Project Settings → Environment Variables**, add the following for **Production**
(and **Preview** if you want preview deploys to talk to the same backend):

| Name | Value |
| ---- | ----- |
| `VITE_SUPABASE_URL` | from `.env` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | from `.env` |
| `VITE_SUPABASE_PROJECT_ID` | from `.env` |
| `SUPABASE_URL` | from `.env` |
| `SUPABASE_PUBLISHABLE_KEY` | from `.env` |
| `SUPABASE_SERVICE_ROLE_KEY` | (only if you add server-side admin code that needs it) |

## 4. Deploy

Click **Deploy**. Future pushes auto-deploy.

## 5. Configure auth redirect URLs

In the Lovable Cloud → Auth dashboard, add your Vercel production URL
(e.g. `https://your-app.vercel.app`) to the allowed redirect URLs so Google sign-in works.

## Notes

- You can keep deploying to Lovable hosting too — they're independent.
- For custom domains, add them in Vercel's Domains tab.
- The first user to sign up is automatically promoted to admin.