"use client";

import Image, { StaticImageData } from "next/image";
import { Lock } from "lucide-react";

interface ServiceToolCardProps {
  image: StaticImageData;
  imageAlt: string;
  label: string;
  enabled: boolean;
  onSelect: () => void;
  onLockedClick: () => void;
  className?: string;
}

export default function ServiceToolCard({
  image,
  imageAlt,
  label,
  enabled,
  onSelect,
  onLockedClick,
  className = "col-span-1",
}: ServiceToolCardProps) {
  const handleClick = () => {
    if (enabled) {
      onSelect();
      return;
    }
    onLockedClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${className} relative w-full h-[400px] bg-white flex flex-col items-center justify-center rounded-2xl transition-opacity ${
        enabled ? "cursor-pointer" : "cursor-not-allowed"
      }`}
      aria-disabled={!enabled}
    >
      <Image
        src={image}
        alt={imageAlt}
        width={200}
        height={200}
        className={`w-[200px] h-[200px] object-cover ${enabled ? "" : "opacity-40"}`}
      />
      <div
        className={`text-4xl font-medium mt-10 ${
          enabled ? "text-black" : "text-gray-400"
        }`}
      >
        {label}
      </div>
      {!enabled && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/10">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black/75 text-white shadow-lg">
            <Lock className="h-12 w-12" strokeWidth={2.2} />
          </div>
        </div>
      )}
    </button>
  );
}
