# Agent Operations Console

A Vercel-ready, simulation-first foundation for the `ebk1996/ai-agent-management` project. This is a deployable starter—not a live trading or mining bot.

## What is included

- Next.js + TypeScript application suitable for Vercel and Node 20+.
- Read-only catalog of 35 configured agent roles across six departments.
- Auth-protected trade/mining **simulation** endpoint; it cannot reach exchanges, pools, or wallets.
- Structured, secret-free audit logs.
- Optional Stripe Checkout using a server-side fixed Price ID and a signature-verified webhook endpoint.
- Unit tests for roster size and the no-side-effects simulation invariant.

## Deliberate safety boundary

Live trading, mining, exchange connectivity, wallet custody/signing, and withdrawals are **not implemented**. There is no code path that executes a financial transaction. Do not add seed phrases, private keys, or exchange credentials to this app or to agent prompts. For any future live financial feature, start with a separate threat model, independent review, least-privilege credentials, explicit human approval, and hard spending/withdrawal controls.

## Run locally

Requires Node.js 20 or newer.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Set a long random `ADMIN_API_TOKEN` to use the simulator. The remaining Stripe values are optional until checkout is needed. Use Stripe test-mode credentials and a test Price ID during development; never put secrets in `NEXT_PUBLIC_*` variables.

## API

- `GET /api/health` — health and safe capability status.
- `GET /api/agents` — configured roster.
- `POST /api/operations/simulate` — accepts `{ "kind": "trade" }` or `{ "kind": "mine" }`; requires `Authorization: Bearer <ADMIN_API_TOKEN>`. Returns a simulation record only.
- `POST /api/checkout` — creates a Stripe Checkout session for the configured `STRIPE_PRICE_ID`; no client amount is accepted.
- `POST /api/stripe/webhook` — validates Stripe signatures and records event metadata. It intentionally does not fulfill orders yet.

## Vercel deployment

1. Import the GitHub repository/branch into Vercel and select the Next.js framework preset.
2. Add `APP_URL` (the production `https://` URL) and a randomly generated `ADMIN_API_TOKEN` in Vercel Project Settings → Environment Variables.
3. For payments, add `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, and `STRIPE_WEBHOOK_SECRET` as encrypted server-side variables. Start with Stripe test-mode values. Configure a Stripe webhook to `https://<your-domain>/api/stripe/webhook`.
4. Deploy the branch and verify `GET /api/health`. Run the tests and type checks locally or in CI before promoting a production deployment.

This change prepares the repository for Vercel; it does not deploy it. A deploy requires access to the owner's Vercel project and its environment configuration. Never send credentials in chat or commit them to Git.

## Checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```
