import type { Metadata } from "next";
import { Explore } from "@/components/pages/Explore";

export const metadata: Metadata = { title: "Explore campaigns" };

export default function ExplorePage() {
  return <Explore />;
}
