import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Footer, Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/components/layout/Providers";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const display = Space_Grotesk({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "ImpactForge · AI-Powered Student Philanthropy", template: "%s · ImpactForge" },
  description:
    "Turn one sentence into a fully designed fundraising campaign, then show every donor exactly where their money went. Open source, built for Hacktoberfest NUST × NSTP.",
  openGraph: {
    title: "ImpactForge",
    description: "One sentence in. A movement out.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
