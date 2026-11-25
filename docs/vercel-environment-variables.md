# Vercel environment variables guide

This application is simulation-only. Environment variables configure the admin-protected simulator and optional Stripe Checkout; they do not enable live trading, mining, wallet custody, or withdrawals.

## Variables to configure

| Variable | Required? | Where to get it / value |
| --- | --- | --- |
| `APP_URL` | Required for Stripe Checkout; recommended always | The canonical URL of the deployed app, including `https://` in production (for example, `https://your-project.vercel.app`). Do not include a path or trailing slash. |
| `ADMIN_API_TOKEN` | Required to use the protected simulation endpoint | Generate a long, unique random secret. It is not a Stripe credential. Keep it private; callers send it as `Authorization: Bearer <token>`. |
| `STRIPE_SECRET_KEY` | Required only for Stripe Checkout | The server-side Stripe secret key. Start with a test-mode key (`sk_test_...`) while validating. Never use a `NEXT_PUBLIC_` prefix. |
| `STRIPE_PRICE_ID` | Required only for Stripe Checkout | A fixed Stripe Price ID (`price_...`) for a product/price you created in Stripe. The app does not accept a client-supplied amount. |
| `STRIPE_WEBHOOK_SECRET` | Required only for Stripe webhooks | The signing secret (`whsec_...`) shown for the Stripe webhook endpoint that points to your deployed app. It is distinct from the Stripe API key. |

For a basic deployment without payments, set `APP_URL` and `ADMIN_API_TOKEN`; leave the three Stripe variables unset. Checkout returns “not configured” until its settings are present. Webhook handling is likewise inactive until configured.

## Add variables in Vercel

1. Open the Vercel dashboard and select the project connected to this repository.
2. Go to **Settings → Environment Variables**.
3. Add each variable using the exact names in the table. Paste the value into the value field—do not add quotes unless quotes are part of the value.
4. Choose the appropriate environment scope. Use **Preview** for a test deployment first. Add **Production** only when you are ready to use the production domain and production configuration.
5. Save the variables, then redeploy the deployment. Vercel applies changed environment variables to new deployments; an existing deployment may not see them.
6. Verify `https://<your-deployment-domain>/api/health`. It should report `mode: "simulation-only"` and `liveFinancialOperations: false`.

## Generate the admin token

Generate a unique token locally with a cryptographically secure random-number generator, for example:

```bash
openssl rand -base64 32
```

Copy the output directly to the Vercel value field. Do not commit it, put it in a `NEXT_PUBLIC_` variable, or send it in chat. The simulation API requires the token in an `Authorization: Bearer ...` header. The public health and agent-roster endpoints do not require it.

## Configure Stripe test mode (optional)

1. Sign in to Stripe and switch to **test mode**.
2. Create the product and price you intend to use, then copy its `price_...` ID into `STRIPE_PRICE_ID`.
3. Copy the test secret API key (`sk_test_...`) into `STRIPE_SECRET_KEY`.
4. Set `APP_URL` to the exact HTTPS deployment origin (no trailing slash).
5. In Stripe, create a webhook endpoint at `https://<your-deployment-domain>/api/stripe/webhook`. Select only the event types your integration needs. Copy that endpoint's signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.
6. Save the variables in Vercel and redeploy. Test checkout with Stripe test payment details. The current webhook verifies signatures and logs event metadata; it does not fulfill orders.

Do not use a live Stripe secret key until the payment flow has been reviewed and tested. Keep test and live keys, Price IDs, and webhook secrets separate, and assign each to the matching Vercel environment scope.

## Secret handling and troubleshooting

- Never put secret values in source control, browser code, screenshots, logs, or chat. Do not prefix secrets with `NEXT_PUBLIC_`.
- If a secret is exposed, revoke or rotate it at its provider, update Vercel, and redeploy.
- If checkout returns `Checkout is not configured`, confirm both `APP_URL` and `STRIPE_PRICE_ID` are set for the deployment's environment, then redeploy.
- If checkout fails, confirm `STRIPE_SECRET_KEY` matches the same Stripe mode as the Price ID.
- If a webhook returns `Invalid webhook signature`, check that the secret belongs to the exact webhook endpoint and environment, and that Stripe is sending to the deployed HTTPS URL.
- A successful Vercel deployment does not connect any exchange, mining pool, or wallet. This codebase deliberately does not implement those integrations.
