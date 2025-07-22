import "./globals.css";
import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
