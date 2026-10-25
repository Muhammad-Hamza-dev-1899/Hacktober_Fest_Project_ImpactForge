import type { Metadata } from "next";
import { CheckoutSuccess } from "@/components/pages/CheckoutSuccess";

export const metadata: Metadata = { title: "Payment confirmed", robots: { index: false } };

export default function CheckoutSuccessPage() {
  return <CheckoutSuccess />;
}
