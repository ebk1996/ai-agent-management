import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Webhook is not configured" }, { status: 400 });
  let event;
  try { event = getStripe().webhooks.constructEvent(await request.text(), signature, secret); }
  catch { return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 }); }
  // Add narrowly scoped fulfillment only after defining the product and idempotency policy.
  audit("stripe.webhook.received", { eventId: event.id, eventType: event.type });
  return NextResponse.json({ received: true });
}
