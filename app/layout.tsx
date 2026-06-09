import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReleaseShield AI",
  description:
    "AI-native release safety agent for PR risk, security leaks, test readiness, communication tracking, and reviewable fixes."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="border-t border-ink/10 bg-white/90 px-5 py-4 text-center text-sm font-semibold text-ink/50 sm:px-8">
          Copyright © Tejaswini Oruganti 2026. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
