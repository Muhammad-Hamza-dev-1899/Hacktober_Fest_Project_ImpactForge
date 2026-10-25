import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";
import { computeCheckout, matchFor, platformRevenue, PROCESSING, sponsorFor } from "../src/lib/monetization";
import { formEncode, verifyStripeSignature } from "../src/lib/payments/stripe";

describe("computeCheckout", () => {
  it("adds the tip on top and leaves the gift untouched", () => {
    const b = computeCheckout({ amountPKR: 5000, tipRate: 0.1, coverFees: false });
    assert.equal(b.tipPKR, 500);
    assert.equal(b.totalPKR, 5500);
    assert.equal(b.feeCoveredPKR, 0);
  });

  it("grosses up so the cause nets 100% when the donor covers fees", () => {
    for (const amountPKR of [100, 2500, 7777, 250000]) {
      const b = computeCheckout({ amountPKR, tipRate: 0.05, coverFees: true });
      const processorTakes = b.totalPKR * PROCESSING.rate + PROCESSING.fixedPKR;
      // After the processor's cut, what remains covers the gift and the tip.
      assert.ok(b.totalPKR - processorTakes >= b.donationPKR + b.tipPKR - 1, `amount ${amountPKR}`);
      assert.equal(b.netToCausePKR, amountPKR);
    }
  });

  it("deducts the processor fee from the cause when fees aren't covered", () => {
    const b = computeCheckout({ amountPKR: 1000, tipRate: 0, coverFees: false });
    assert.equal(b.netToCausePKR, 1000 - b.feePKR);
  });
});

describe("sponsor matching", () => {
  it("matches at the sponsor ratio up to the remaining cap", () => {
    const s = sponsorFor("seed-winter-coats")!;
    assert.equal(matchFor(s, 5000), 5000);
    assert.equal(matchFor(s, 10_000_000), s.capPKR - s.usedPKR);
    assert.equal(matchFor(sponsorFor("seed-clean-water"), 10_000), 5000);
    assert.equal(matchFor(null, 5000), 0);
  });
});

describe("platformRevenue", () => {
  it("rolls up tips, sponsor fees and subscription MRR", () => {
    const r = platformRevenue({
      donations: [
        { amountPKR: 5000, tipPKR: 500, matchedPKR: 5000, recurring: false },
        { amountPKR: 2000, tipPKR: 200, matchedPKR: 0, recurring: true },
      ],
      subscription: { plan: "pro", cycle: "monthly" },
    });
    assert.equal(r.tips, 700);
    assert.equal(r.sponsorFees, 250);
    assert.equal(r.mrrSubs, 2499);
    assert.equal(r.recurringMRR, 2200);
    assert.equal(r.total, 700 + 250 + 2499);
  });
});

describe("stripe helpers", () => {
  it("form-encodes nested objects the way Stripe expects", () => {
    assert.equal(formEncode({ a: 1, b: { c: "x y" }, d: undefined }), "a=1&b%5Bc%5D=x%20y");
  });

  it("verifies webhook signatures and rejects tampering or replays", () => {
    const secret = "whsec_test";
    const payload = '{"id":"evt_1"}';
    const t = 1_700_000_000;
    const sig = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
    const header = `t=${t},v1=${sig}`;
    assert.ok(verifyStripeSignature(payload, header, secret, 300, t * 1000));
    assert.ok(!verifyStripeSignature(payload + " ", header, secret, 300, t * 1000));
    assert.ok(!verifyStripeSignature(payload, header, secret, 300, (t + 3600) * 1000));
    assert.ok(!verifyStripeSignature(payload, null, secret));
  });
});
