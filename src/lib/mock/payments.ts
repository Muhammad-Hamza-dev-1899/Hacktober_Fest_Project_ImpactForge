import { nanoid } from "nanoid";
import { sleep } from "../utils";

/**
 * Payment boundary. The prototype ships a MOCK provider: no card data ever leaves
 * the browser. Swap in a Stripe / JazzCash / Easypaisa implementation of this
 * interface for production.
 */
export interface PaymentProvider {
  charge(input: {
    amountPKR: number;
    cardNumber: string;
    name: string;
  }): Promise<{ ok: true; txId: string } | { ok: false; error: string }>;
}

export const luhn = (num: string) => {
  const digits = num.replace(/\D/g, "");
  if (digits.length < 12) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
};

export const mockPaymentProvider: PaymentProvider = {
  async charge({ amountPKR, cardNumber }) {
    await sleep(1400);
    if (amountPKR < 100) return { ok: false, error: "Minimum donation is PKR 100" };
    if (!luhn(cardNumber)) return { ok: false, error: "That card number doesn't look right. Try 4242 4242 4242 4242" };
    return { ok: true, txId: `TX-${nanoid(8).toUpperCase()}` };
  },
};
