import { NextResponse } from "next/server";
import { verifyStripeSignature } from "@/lib/payments/stripe";

/**
 * Stripe webhook endpoint. Verifies the signature on the raw body, then acknowledges.
 * This is where a production deployment writes the donation / subscription to the
 * database (idempotently, keyed by event id) and triggers the donor's receipt email.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 501 });

  const payload = await req.text();
  if (!verifyStripeSignature(payload, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as { id: string; type: string; data: { object: { id: string; metadata?: Record<string, string> } } };
  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.paid":
    case "customer.subscription.deleted":
      console.info(`[stripe] ${event.type}`, event.data.object.id, event.data.object.metadata ?? {});
      break;
    default:
      break;
  }
  return NextResponse.json({ received: true });
}
