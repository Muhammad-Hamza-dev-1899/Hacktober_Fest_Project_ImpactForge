import type { Metadata } from "next";
import { Suspense } from "react";
import { Receipt } from "@/components/pages/Receipt";

export const metadata: Metadata = { title: "Receipt", robots: { index: false } };

async function Resolve({ params }: { params: PageProps<"/receipt/[donationId]">["params"] }) {
  const { donationId } = await params;
  return <Receipt donationId={donationId} />;
}

export default function ReceiptPage({ params }: PageProps<"/receipt/[donationId]">) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Resolve params={params} />
    </Suspense>
  );
}
