"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface MacBackgroundProps {
  backgroundImage?: string;
}

export default function MacBackground({ backgroundImage = "/mac-wallpaper-1.jpg" }: MacBackgroundProps) {
  const [currentImage, setCurrentImage] = useState(backgroundImage);

  useEffect(() => {
    setCurrentImage(backgroundImage);
  }, [backgroundImage]);

  return (
    <div className="absolute inset-0 z-0">
      <Image
        src={currentImage}
        alt="MacBook Background"
        fill
        priority
        quality={100}
        className="object-cover transition-all duration-1000"
      />
    </div>
  );
}