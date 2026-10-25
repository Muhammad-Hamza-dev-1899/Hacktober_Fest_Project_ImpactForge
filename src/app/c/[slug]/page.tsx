import { Suspense } from "react";
import { CampaignPage } from "@/components/campaign/CampaignView";
import { SEED_CAMPAIGNS } from "@/data/campaigns";

// Curated campaigns are prerendered; AI-generated slugs render on demand.
export function generateStaticParams() {
  return SEED_CAMPAIGNS.map((c) => ({ slug: c.slug }));
}

async function Resolve({ params }: { params: PageProps<"/c/[slug]">["params"] }) {
  const { slug } = await params;
  return <CampaignPage slug={slug} />;
}

export default function Page({ params }: PageProps<"/c/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Resolve params={params} />
    </Suspense>
  );
}
