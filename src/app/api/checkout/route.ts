import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  const baseUrl = process.env.APP_URL;
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!baseUrl || !priceId) return NextResponse.json({ error: "Checkout is not configured" }, { status: 503 });
  let origin: URL;
  try { origin = new URL(baseUrl); } catch { return NextResponse.json({ error: "Invalid APP_URL configuration" }, { status: 500 }); }
  if (process.env.NODE_ENV === "production" && origin.protocol !== "https:") {
    return NextResponse.json({ error: "APP_URL must use HTTPS in production" }, { status: 500 });
  }
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: new URL("/payment/success?session_id={CHECKOUT_SESSION_ID}", origin).toString(),
      cancel_url: new URL("/", origin).toString(),
    });
    return NextResponse.json({ url: session.url }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to create checkout session" }, { status: 502 });
  }
}
