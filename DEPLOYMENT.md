# Deployment

SwissYacht is prepared for GitHub and Cloudflare Workers using the OpenNext Cloudflare adapter.

## 1. Requirements

- Node.js 22 or newer for Cloudflare tooling.
- A GitHub account.
- A Cloudflare account.
- A Supabase project with the variables from `.env.example`.

## 2. Connect GitHub

Install and authenticate the GitHub CLI:

```bash
brew install gh
gh auth login
```

Create the repository and push the project:

```bash
git init
git add -A
git commit -m "Initial SwissYacht MVP"
gh repo create swissyacht --private --source=. --remote=origin --push
```

If you already created a GitHub repository, connect it instead:

```bash
git remote add origin git@github.com:<owner>/swissyacht.git
git branch -M main
git push -u origin main
```

## 3. Connect Cloudflare

The project includes:

- `@opennextjs/cloudflare`
- `wrangler`
- `open-next.config.ts`
- `wrangler.jsonc`
- `npm run cf:preview`
- `npm run cf:deploy`

For local deployment:

```bash
npx wrangler login
npm run cf:deploy
```

For GitHub Actions deployment, create these GitHub repository secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
CONTACT_NOTIFICATION_EMAIL
NEXT_PUBLIC_DEMO_MODE
```

The workflow in `.github/workflows/cloudflare-workers.yml` deploys automatically when code is pushed to `main`.

## 4. Cloudflare API Token

Create a Cloudflare API token with permission to deploy Workers for your account. Keep it only in GitHub secrets or your local shell session. Do not commit it.

## 5. Supabase

Add the Supabase variables to GitHub secrets and, if deploying manually, to your local `.env.local`.

Apply migrations before using production data:

```bash
supabase db push
```

## 6. Notes

- `.env`, `.env.local`, `.dev.vars`, `.wrangler`, and `.open-next` are ignored by Git.
- The demo mode can stay enabled until live Supabase data is ready.
- Stripe and paid listings are intentionally prepared architecturally but not enabled yet.
