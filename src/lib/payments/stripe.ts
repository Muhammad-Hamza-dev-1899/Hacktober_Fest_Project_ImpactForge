import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Minimal Stripe Checkout client over the REST API (no SDK dependency).
 * Server-only: reads STRIPE_SECRET_KEY. When the key is absent the app runs the
 * built-in mock checkout instead, so the demo never depends on a payment account.
 *
 * Note: Stripe doesn't onboard Pakistani merchants directly. The same interface is
 * meant to be implemented for PayFast / JazzCash / Easypaisa in production; Stripe is
 * the reference implementation because its API is the easiest to test.
 */
const API = "https://api.stripe.com/v1";

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);
export const currency = () => (process.env.STRIPE_CURRENCY || "pkr").toLowerCase();

/** Stripe's form encoding: nested objects/arrays become bracketed keys. */
export function formEncode(obj: Record<string, unknown>, prefix = ""): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") parts.push(formEncode(v as Record<string, unknown>, key));
    else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
  return parts.filter(Boolean).join("&");
}

async function stripe<T>(path: string, method: "GET" | "POST", body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? formEncode(body) : undefined,
  });
  const json = (await res.json()) as T & { error?: { message: string } };
  if (!res.ok) throw new Error(json.error?.message ?? `Stripe ${res.status}`);
  return json;
}

export type LineItem = { name: string; amountPKR: number; recurring?: "month" | "year" };

export async function createCheckoutSession(opts: {
  mode: "payment" | "subscription";
  items: LineItem[];
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
  customerEmail?: string;
}) {
  const line_items = Object.fromEntries(
    opts.items
      .filter((i) => i.amountPKR > 0)
      .map((i, idx) => [
        idx,
        {
          quantity: 1,
          price_data: {
            currency: currency(),
            unit_amount: Math.round(i.amountPKR * 100),
            product_data: { name: i.name },
            recurring: i.recurring ? { interval: i.recurring } : undefined,
          },
        },
      ]),
  );
  return stripe<{ id: string; url: string }>("/checkout/sessions", "POST", {
    mode: opts.mode,
    line_items,
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    metadata: opts.metadata,
    customer_email: opts.customerEmail,
  });
}

export function retrieveSession(id: string) {
  return stripe<{ id: string; status: string; payment_status: string; amount_total: number; metadata: Record<string, string> }>(
    `/checkout/sessions/${encodeURIComponent(id)}`,
    "GET",
  );
}

/**
 * Verifies a Stripe webhook signature header (`t=…,v1=…`) against the raw body.
 * Rejects stale events (default tolerance 5 minutes) to prevent replay.
 */
export function verifyStripeSignature(payload: string, header: string | null, secret: string, toleranceSec = 300, now = Date.now()) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=") as [string, string]));
  const t = Number(parts.t);
  const sig = parts.v1;
  if (!t || !sig) return false;
  if (Math.abs(now / 1000 - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(sig, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
