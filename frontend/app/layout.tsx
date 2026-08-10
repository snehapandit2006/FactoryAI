import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FactoryAI Copilot — Industrial Maintenance Assistant",
  description:
    "AI-powered manufacturing incident analysis and maintenance copilot. Powered by Gemini 2.5 Flash for root cause analysis, severity assessment, and predictive maintenance recommendations.",
  keywords: [
    "manufacturing AI",
    "industrial maintenance",
    "incident analysis",
    "predictive maintenance",
    "factory safety",
    "Gemini AI",
  ],
  openGraph: {
    title: "FactoryAI Copilot",
    description: "AI-powered manufacturing incident analysis & maintenance assistant.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {children}
      </body>
    </html>
  );
}
