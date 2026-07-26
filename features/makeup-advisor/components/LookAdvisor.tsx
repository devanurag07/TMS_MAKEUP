"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { GiLipstick, GiPowder, GiEyelashes } from "react-icons/gi";
import { useTranslations } from "next-intl";
import type { LookCombo, MakeupCategory } from "../types";

interface LookAdvisorProps {
  combos: LookCombo[];
  onTry: (combo: LookCombo) => void;
  onReset?: () => void;
  disabled?: boolean;
}

const CATEGORY_ICONS: Record<
  MakeupCategory,
  React.ComponentType<{ className?: string; size?: number }>
> = {
  lipstick: GiLipstick,
  blush: GiPowder,
  eyeshadow: GiEyelashes,
};

const LookAdvisor = ({
  combos,
  onTry,
  onReset,
  disabled = false,
}: LookAdvisorProps) => {
  const t = useTranslations("lookAdvisor");
  const tCategories = useTranslations("customLookMakeup.categories");
  const [index, setIndex] = useState(0);

  if (combos.length === 0) {
    return (
      <div className="h-[85%] bg-black text-white flex items-center justify-center">
        <p className="text-3xl text-white/70">{t("noCombos")}</p>
      </div>
    );
  }

  const combo = combos[Math.min(index, combos.length - 1)];

  const handlePrevious = () => {
    setIndex((current) =>
      current === 0 ? combos.length - 1 : current - 1
    );
  };

  const handleNext = () => {
    setIndex((current) =>
      current === combos.length - 1 ? 0 : current + 1
    );
  };

  return (
    <div className="h-[85%] bg-black text-white flex flex-col px-8">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-gray rounded-3xl relative flex-1 p-20 flex flex-col overflow-y-auto">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="absolute top-8 right-8 z-10 flex items-center gap-2 rounded-full bg-gray-700 p-4 transition-colors hover:bg-gray-600"
              title={t("changePreferences")}
            >
              <RotateCcw className="h-8 w-8 text-white" />
              <span className="text-2xl font-medium text-white">
                {t("changePreferences")}
              </span>
            </button>
          )}

          {/* White image placeholders — same pair layout as FLUX recommended looks */}
          <div className="mb-8 flex justify-center gap-8">
            <div className="h-[399px] w-[300px] rounded-2xl bg-white" />
            <div className="h-[399px] w-[300px] rounded-2xl bg-white" />
          </div>

          {combos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevious}
                className="absolute left-[-10px] top-1/3 flex h-24 w-24 -translate-y-1/2 items-center justify-center transition-colors"
                aria-label={t("lookLabel", { index: index })}
              >
                <ChevronLeft className="h-24 w-24 text-white" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-[-10px] top-1/3 flex h-24 w-24 -translate-y-1/2 items-center justify-center transition-colors"
                aria-label={t("lookLabel", { index: index + 2 })}
              >
                <ChevronRight className="h-24 w-24 text-white" />
              </button>
            </>
          )}

          <div className="mb-6 text-center">
            <h2 className="mb-4 text-6xl font-bold text-white">{combo.name}</h2>
          </div>

          {combo.description && (
            <div className="mb-10 flex-1 text-4xl leading-relaxed text-gray-300">
              <p>{combo.description}</p>
            </div>
          )}

          <div className="mb-4 grid grid-cols-3 gap-10">
            {combo.items.map((item) => {
              const Icon = CATEGORY_ICONS[item.category];
              return (
                <div
                  key={`${item.category}-${item.shadeName}`}
                  className="flex flex-col items-center"
                >
                  <div
                    className="mb-6 h-40 w-40 rounded-full border-2 border-white/80"
                    style={{ backgroundColor: item.hex }}
                  />
                  <div className="mb-2 flex items-center gap-3">
                    <Icon className="h-8 w-8 shrink-0" size={32} />
                    <span className="text-2xl uppercase tracking-wide text-white/60">
                      {tCategories(item.category)}
                    </span>
                  </div>
                  <span className="text-center text-3xl font-semibold leading-tight">
                    {item.shadeName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {combos.length > 1 && (
          <div className="flex justify-center gap-2 py-6">
            {combos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-3 w-3 rounded-full transition-colors ${
                  i === index ? "bg-white" : "bg-gray-600 hover:bg-gray-500"
                }`}
                aria-label={t("lookLabel", { index: i + 1 })}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center bg-black py-8">
        <Button
          type="button"
          onClick={() => onTry(combo)}
          disabled={disabled}
          className="flex items-center gap-4 rounded-2xl bg-primary !px-20 py-12 text-4xl font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
        >
          {t("tryThisLook")}
          <ChevronRight size={48} />
        </Button>
      </div>
    </div>
  );
};

export default LookAdvisor;
