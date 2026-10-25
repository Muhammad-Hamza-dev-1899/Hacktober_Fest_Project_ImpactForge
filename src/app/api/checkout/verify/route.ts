import { NextResponse } from "next/server";
import { retrieveSession, stripeEnabled } from "@/lib/payments/stripe";

/** Confirms a Stripe Checkout session was paid before the client records it. */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("session_id");
  if (!id || !/^cs_[A-Za-z0-9_]+$/.test(id)) return NextResponse.json({ paid: false, error: "Missing session" }, { status: 400 });
  if (!stripeEnabled()) return NextResponse.json({ paid: false, error: "Stripe not configured" }, { status: 400 });
  try {
    const s = await retrieveSession(id);
    return NextResponse.json({ paid: s.payment_status === "paid" || s.status === "complete", txId: s.id, metadata: s.metadata });
  } catch (e) {
    return NextResponse.json({ paid: false, error: e instanceof Error ? e.message : "Lookup failed" }, { status: 502 });
  }
}
