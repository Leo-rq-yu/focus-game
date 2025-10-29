import type { Metadata } from "next";
import { InsforgeProvider } from '@insforge/nextjs';
import "./globals.css";

export const metadata: Metadata = {
  title: "Focus Game - Test Your Timing Skills",
  description: "A timing-based game where precision matters",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <InsforgeProvider baseUrl={process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!}>
          {children}
        </InsforgeProvider>
      </body>
    </html>
  );
}
