import { nanoid } from "nanoid";
import { connection, NextResponse } from "next/server";
import { z } from "zod";
import { computeCheckout, getPlan, TIP_OPTIONS } from "@/lib/monetization";
import { createCheckoutSession, stripeEnabled } from "@/lib/payments/stripe";

const DonationSchema = z.object({
  kind: z.literal("donation"),
  campaignId: z.string().min(1).max(64),
  campaignSlug: z.string().regex(/^[a-z0-9-]+$/),
  campaignTitle: z.string().max(80),
  amountPKR: z.number().int().min(100).max(10_000_000),
  tipRate: z.number().refine((r) => (TIP_OPTIONS as readonly number[]).includes(r), "invalid tip"),
  coverFees: z.boolean(),
  recurring: z.boolean(),
});

const SubscriptionSchema = z.object({
  kind: z.literal("subscription"),
  plan: z.enum(["pro"]),
  cycle: z.enum(["monthly", "yearly"]),
});

const BodySchema = z.discriminatedUnion("kind", [DonationSchema, SubscriptionSchema]);

/** Lets the client know whether to show the demo card form or hand off to Stripe. */
export async function GET() {
  await connection(); // read env at request time, not build time
  return NextResponse.json({ mode: stripeEnabled() ? "stripe" : "mock" });
}

/**
 * Creates a checkout. Amounts are always recomputed on the server from the inputs;
 * client-side totals are never trusted.
 *  - With STRIPE_SECRET_KEY: returns a hosted Stripe Checkout URL.
 *  - Without: returns a mock receipt so the demo flow completes instantly.
 */
export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid checkout" }, { status: 400 });
  const body = parsed.data;
  const origin = req.headers.get("origin") || new URL(req.url).origin;

  if (body.kind === "donation") {
    const b = computeCheckout(body);
    if (!stripeEnabled()) return NextResponse.json({ mode: "mock", txId: `TX-${nanoid(8).toUpperCase()}`, breakdown: b });
    const interval = body.recurring ? ("month" as const) : undefined;
    const session = await createCheckoutSession({
      mode: body.recurring ? "subscription" : "payment",
      items: [
        { name: `Donation · ${body.campaignTitle}`, amountPKR: b.donationPKR, recurring: interval },
        { name: "Tip to ImpactForge (keeps it free for students)", amountPKR: b.tipPKR, recurring: interval },
        { name: "Processing fee cover", amountPKR: b.feeCoveredPKR, recurring: interval },
      ],
      successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/c/${body.campaignSlug}`,
      metadata: { kind: "donation", campaignId: body.campaignId, amountPKR: String(b.donationPKR), tipPKR: String(b.tipPKR) },
    });
    return NextResponse.json({ mode: "stripe", url: session.url, breakdown: b });
  }

  const plan = getPlan(body.plan);
  const price = plan.pricePKR?.[body.cycle] ?? 0;
  if (!stripeEnabled()) return NextResponse.json({ mode: "mock", txId: `SUB-${nanoid(8).toUpperCase()}`, amountPKR: price });
  const session = await createCheckoutSession({
    mode: "subscription",
    items: [{ name: `ImpactForge ${plan.name} (${body.cycle})`, amountPKR: price, recurring: body.cycle === "monthly" ? "month" : "year" }],
    successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/pricing`,
    metadata: { kind: "subscription", plan: plan.id, cycle: body.cycle },
  });
  return NextResponse.json({ mode: "stripe", url: session.url, amountPKR: price });
}
