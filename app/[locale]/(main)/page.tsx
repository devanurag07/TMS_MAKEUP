"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import HomeArt from "@/assets/home-1.png";
import TmsLogo from "@/assets/TMS - LOGO.png";
import { useTranslations } from "next-intl";
import { SALON_LOGO_KEY } from "@/core/constants/common-constants";
import { getStoredSalon } from "@/core/utils/salon-storage";
import { Settings, LogOut } from "lucide-react";
import { logoutMirror } from "@/features/auth/utils/logout";

export default function HomeLanding() {
  const t = useTranslations();

  const salon = useMemo(() => getStoredSalon(), []);
  const themeBgColor = (salon?.theme_bg_color as string)?.trim() || "";
  const themePrimaryColor = (salon?.theme_primary_color as string)?.trim() || "";
  const themeAccentColor = (salon?.theme_accent_color as string)?.trim() || "";
  const customDoodleImage = (salon?.homepage_doodle_image as string)?.trim() || "";

  const getSalonLogo = () => {
    const salonLogo = localStorage.getItem(SALON_LOGO_KEY);
    if (salonLogo) {
      if (salonLogo.toLowerCase().includes("placeholder")) {
        return TmsLogo;
      } else {
        return salonLogo;
      }
    } else {
      return TmsLogo;
    }
  };

  return (
    <div
      className="h-full text-white flex flex-col items-center justify-between px-6 py-10 relative"
      style={{ backgroundColor: themeBgColor || "#000000" }}
    >
      {/* Logout */}
      <div className="absolute top-6 left-6 z-10">
        <button
          type="button"
          onClick={logoutMirror}
          className="p-4 rounded-full border border-white/15 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/10 transition-colors"
          aria-label={t("landing.logout")}
        >
          <LogOut size={72} color="white" />
        </button>
      </div>

      {/* Camera settings */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
        <Link
          href="/camera-setup"
          className="p-4 rounded-full border border-white/15 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/10 transition-colors"
          aria-label={t("landing.cameraSettings")}
        >
          <Settings size={72} color="white" />
        </Link>
      </div>

      {/* Top Logo */}
      <div className="w-full flex justify-center mt-[300px]">
        <div className="flex items-center gap-4 select-none">
          <Image
            src={getSalonLogo()}
            alt="Try My Style"
            width={300}
            height={300}
            className="h-[30vh] w-auto object-contain"

            unoptimized
          />
        </div>
      </div>

      {/* Tagline 2 */}
      <p
        className="mt-8 text-6xl sm:text-5xl md:text-6xl italic font-semibold text-center"
        style={themeAccentColor ? { color: themeAccentColor } : undefined}
      >
        {t("landing.welcome")}
      </p>

      {/* Hero Illustration / Doodle */}
      <div className="mt-10 w-full max-w-6xl flex justify-center">
        {customDoodleImage ? (
          <Image
            src={customDoodleImage}
            alt="Homepage doodle"
            width={800}
            height={500}
            className="w-full h-auto object-contain"
            priority
            unoptimized
          />
        ) : (
          <Image
            src={HomeArt}
            alt="Facial mesh scanners"
            className="w-full h-auto object-contain"
            priority
          />
        )}
      </div>

      {/* CTA Button */}
      <div className="w-full flex justify-center mt-10">
        <Link
          href="/home"
          className="inline-flex items-center justify-center rounded-2xl !px-24 sm:px-10 py-8 text-4xl sm:text-5xl font-semibold shadow-[0_0_0_2px_rgba(255,255,255,0.2)_inset] hover:opacity-90 transition"
          style={
            themePrimaryColor
              ? {
                  backgroundColor: themePrimaryColor,
                  color: themeBgColor || "#000000",
                }
              : {
                  backgroundColor: "#ffffff",
                  color: "#000000",
                }
          }
        >
          {t("landing.beginConsultation")}
        </Link>
      </div>

      {/* Footer */}
      <div className="w-full flex items-center justify-center gap-3 mt-10 mb-4 opacity-90 text-4xl">
        <span className="text-gray-300">{t("common.poweredBy")}</span>
        <div className="flex items-center gap-2">
          <Image
            src={TmsLogo}
            alt="Try My Style"
            className="h-10 w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}
