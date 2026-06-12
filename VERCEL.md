# Deploying Rapid Shopping to Vercel

This project is a **TanStack Start** app (Vite + React 19). The included
`vercel.json` tells Vercel exactly how to build it.

---

## Step 1 — Push the code to GitHub

1. Create a new empty repository on GitHub (e.g. `rapid-shopping`).
2. From the Lovable editor, click **GitHub → Connect to GitHub** and push the project.
   (Or download the code and push it manually with `git push`.)

## Step 2 — Import the project into Vercel

1. Go to <https://vercel.com/new>.
2. Click **Import** next to your `rapid-shopping` repository.
3. **Framework Preset:** leave as **Other** (auto-detected from `vercel.json`).
4. Do **not** change the Build Command, Install Command, or Output Directory —
   they are already set by `vercel.json`:
   - Build: `bun run build`
   - Install: `bun install`
   - Output: `dist/client`

## Step 3 — Add environment variables

Open **Project Settings → Environment Variables** and add the following for
both **Production** and **Preview** environments. The values are in your local
`.env` file (Lovable Cloud created them automatically).

| Name | Where to copy from |
| ---- | ------------------ |
| `VITE_SUPABASE_URL` | `.env` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` |
| `VITE_SUPABASE_PROJECT_ID` | `.env` |
| `SUPABASE_URL` | same value as `VITE_SUPABASE_URL` |
| `SUPABASE_PUBLISHABLE_KEY` | same value as `VITE_SUPABASE_PUBLISHABLE_KEY` |

> The `VITE_*` variables are used by the browser, the non-prefixed copies are
> used during server-side rendering. Both must be set.

## Step 4 — Click Deploy

Vercel will install dependencies, build the app, and deploy it. After ~2
minutes you'll get a URL like `https://rapid-shopping.vercel.app`.

Every future `git push` to `main` auto-deploys.

## Step 5 — Allow your Vercel URL for Google sign-in

In the Lovable editor, open **Backend → Auth → URL Configuration** and add
your Vercel production URL (e.g. `https://rapid-shopping.vercel.app`) to the
**Site URL** and **Redirect URLs** list. Otherwise Google OAuth will reject
the callback.

## Step 6 — Become the admin

Visit your deployed site, click **Sign in**, and create the first account.
The first user is automatically promoted to **admin** and can manage
products, orders and categories at `/admin`.

---

## Custom domain

In Vercel → **Project → Domains**, add your domain and follow the DNS
instructions. Then add the new domain to the Lovable Auth redirect URLs too.

## Troubleshooting

- **Blank page / 404 on refresh** — verify `vercel.json` is committed and the
  build output directory is `dist/client`.
- **"Missing Supabase environment variable"** in the browser console — you
  forgot one of the `VITE_*` variables in Step 3. Re-deploy after adding it.
- **Google sign-in redirects to a Lovable URL** — repeat Step 5 with the
  correct Vercel domain.