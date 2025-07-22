// src/app/layout.tsx
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Harsh | BMW Dev Portfolio",
  description: "BMW-inspired interactive developer portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="relative bg-black text-white font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
