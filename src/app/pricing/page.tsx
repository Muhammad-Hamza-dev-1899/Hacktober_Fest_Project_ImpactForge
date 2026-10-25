import type { Metadata } from "next";
import { Pricing } from "@/components/pages/Pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free for students. Society Pro for teams that fundraise every semester.",
};

export default function PricingPage() {
  return <Pricing />;
}
