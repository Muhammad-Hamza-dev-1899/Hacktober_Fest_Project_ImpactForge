import type { Metadata } from "next";
import { AuthGate } from "@/components/layout/AuthGate";
import { Dashboard } from "@/components/campaign/Dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  );
}
