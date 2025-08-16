import "./globals.css";
import type { Metadata } from "next";
import { BackgroundProvider } from "@/contexts/BackgroundContext";

export const metadata: Metadata = {
  title: "HarshOS - Developer Workspace",
  description: "Your Personal Operating System for Development - Portfolio inspired by macOS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body>
        <BackgroundProvider>
          {children}
        </BackgroundProvider>
      </body>
    </html>
  );
}
