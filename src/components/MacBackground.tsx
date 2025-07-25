"use client";

import Image from "next/image";

export default function MacBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Image
        src="/mac-wallpaper-1.jpg"
        alt="MacBook Background"
        fill
        priority
        quality={100}
        className="object-cover"
      />
    </div>
  );
}