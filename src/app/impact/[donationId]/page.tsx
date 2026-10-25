import type { Metadata } from "next";
import { Suspense } from "react";
import { ImpactPage } from "@/components/wrapped/ImpactPage";

export const metadata: Metadata = { title: "Your Impact Wrapped" };

export function generateStaticParams() {
  return [{ donationId: "demo" }];
}

async function Resolve({ params }: { params: PageProps<"/impact/[donationId]">["params"] }) {
  const { donationId } = await params;
  return <ImpactPage donationId={donationId} />;
}

export default function Page({ params }: PageProps<"/impact/[donationId]">) {
  return (
    <Suspense fallback={<div className="fixed inset-0 z-[60] bg-black" />}>
      <Resolve params={params} />
    </Suspense>
  );
}
