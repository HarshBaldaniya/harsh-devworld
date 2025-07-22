"use client";
import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import Hero from "@/components/Hero";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen">{loading ? <Loader /> : <Hero />}</main>
  );
}
