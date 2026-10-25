import type { Metadata } from "next";
import { AuthGate } from "@/components/layout/AuthGate";
import { PromptStudio } from "@/components/studio/PromptStudio";

export const metadata: Metadata = { title: "Create a campaign" };

export default function CreatePage() {
  return (
    <AuthGate>
      <PromptStudio />
    </AuthGate>
  );
}
