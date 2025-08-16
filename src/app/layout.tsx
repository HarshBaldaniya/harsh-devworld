import "./globals.css";
import type { Metadata } from "next";
import { BackgroundProvider } from "@/contexts/BackgroundContext";

export const metadata: Metadata = {
  title: "Harsh Dev World",
  description: "Portfolio inspired by macOS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <BackgroundProvider>
          {children}
        </BackgroundProvider>
      </body>
    </html>
  );
}
