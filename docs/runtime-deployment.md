# Runtime deployment notes: Docker, Minikube, Cloudflare, Vercel, MongoDB

This repository now includes a Dockerized Next.js web app, a Dockerized read-only Python edge telemetry bridge, local Docker Compose, and a Kubernetes manifest for the edge bridge. This is infrastructure scaffolding, not a completed deployment or a hardware-specific driver. Live trading, mining control, wallet signing, and withdrawals are not implemented.

## Docker Compose (local smoke setup)

1. Copy `.env.example` to `.env.local` only if you need Next local development; Compose reads a `.env` file, so create a local `.env` (ignored by Git) with at least:

   ```dotenv
   ADMIN_API_TOKEN=replace-with-a-long-random-secret
   APP_URL=http://localhost:3000
   ```

2. Start the stack: `docker compose up --build`.
3. Open `http://localhost:3000/api/health`. MongoDB has a persistent named volume; don't treat local Compose Mongo as production storage.
4. The edge bridge exposes no host port. It is reachable only by the Compose network. By default, hardware polling is not configured and returns `not_configured`.

To connect a device, configure `HARDWARE_STATUS_URL` to that device's documented **read-only status/metrics** endpoint. If its API requires a bearer credential, set `HARDWARE_BEARER_TOKEN` in the local environment. This adapter makes HTTP GET requests only, times out after five seconds, and limits response size. Do not expose its `/status` endpoint publicly.

## Minikube

The edge service manifest is `infra/k8s/edge-agent.yaml`; it uses an internal ClusterIP service, runs as non-root, drops Linux capabilities, and has no Kubernetes API token mounted.

1. Start Minikube: `minikube start`.
2. Build the image into Minikube's Docker daemon: `minikube image build -t ai-agent-edge:local ./services/edge-agent`.
3. Apply the manifest: `kubectl apply -f infra/k8s/edge-agent.yaml`.
4. If the device endpoint is reachable from the Minikube node, edit the ConfigMap value `hardware-status-url` to its read-only URL and apply again. For an authenticated API, create the `agent-edge-secret` Secret using a secure local method; do not commit a Secret manifest or token.
5. Check `kubectl get pods` and `kubectl logs deploy/agent-edge`. The service is internal; do not expose it through `LoadBalancer`, Ingress, or a public Cloudflare hostname.

Minikube's network may not be able to reach host LAN hardware directly. Confirm routing from the cluster before configuring the actual device. A dedicated machine-local edge deployment is often preferable for hardware on the same LAN.

## Cloudflare

Use Cloudflare Tunnel only for the public web frontend, not the hardware telemetry bridge, MongoDB, or its credentials. Point the tunnel to the web service on a private Docker/Kubernetes network. Keep the edge service as ClusterIP/internal-only. Restrict administrative endpoints at the application/access layer as well as at the network layer. Do not publish MongoDB port 27017.

## Vercel and MongoDB Atlas

Vercel hosts the Next.js app; it does not run persistent hardware polling. Deploy the web app to Vercel through the Git integration. Create a MongoDB Atlas database, restrict Atlas network access to the deployment's supported egress strategy, create a least-privilege database user, and set `MONGODB_URI` as a server-only Vercel environment variable. Never use a `NEXT_PUBLIC_` prefix. Set `APP_URL` to the canonical HTTPS deployment origin. Vercel functions can reach Atlas, but they cannot directly access LAN hardware; use a private edge bridge / outbound connectivity design for that.

The edge bridge in this starter is not yet enrolled or authenticated to the Vercel app. Do not make its HTTP endpoint public. A production rollout needs a chosen hardware model/API and a mutually authenticated, outbound-only bridge protocol before cloud-to-edge communication is enabled.

## Hardware details still required

Before adding a device-specific driver, provide hardware make/model, firmware/API documentation, whether its status API is read-only and reachable from the deployment host, and the intended polling rate. Credentials belong in local secret storage or Vercel/Kubernetes secret stores, never in chat or Git.

Trading, mining-pool submissions, wallet custody/signing, and withdrawals remain outside this starter. Do not use this telemetry bridge as an actuator.
