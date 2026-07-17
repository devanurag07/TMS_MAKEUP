"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { GiLipstick, GiPowder, GiEyelashes } from "react-icons/gi";
import { useTranslations } from "next-intl";
import type { LookCombo, MakeupCategory } from "../types";

interface LookAdvisorProps {
  combos: LookCombo[];
  onTry: (combo: LookCombo) => void;
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

const LookAdvisor = ({ combos, onTry, disabled = false }: LookAdvisorProps) => {
  const t = useTranslations("lookAdvisor");
  const tCommon = useTranslations("common");
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
  const isFirst = index === 0;
  const isLast = index === combos.length - 1;

  return (
    <div className="h-[85%] bg-black text-white overflow-y-auto">
      <div className="max-w-5xl mx-auto flex flex-col p-8 justify-around min-h-full">
        {/* Combo indicator dots */}
        <div className="flex justify-center gap-3 mb-10">
          {combos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-3 rounded-full transition-all ${
                i === index ? "w-12 bg-white" : "w-3 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={t("lookLabel", { index: i + 1 })}
            />
          ))}
        </div>

        {/* Combo card */}
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-4">
            <Sparkles className="w-12 h-12 shrink-0" />
            <h2 className="text-5xl font-bold text-center">{combo.name}</h2>
          </div>

          {combo.description && (
            <p className="text-3xl text-white/70 text-center max-w-3xl leading-snug mb-14">
              {combo.description}
            </p>
          )}

          <div className="grid grid-cols-3 gap-10 w-full max-w-4xl">
            {combo.items.map((item) => {
              const Icon = CATEGORY_ICONS[item.category];
              return (
                <div
                  key={`${item.category}-${item.shadeName}`}
                  className="flex flex-col items-center"
                >
                  <div
                    className="w-40 h-40 rounded-full border-2 border-white/80 mb-6"
                    style={{ backgroundColor: item.hex }}
                  />
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-8 h-8 shrink-0" size={32} />
                    <span className="text-2xl text-white/60 uppercase tracking-wide">
                      {tCategories(item.category)}
                    </span>
                  </div>
                  <span className="text-3xl font-semibold text-center leading-tight">
                    {item.shadeName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation + Try */}
        <div className="flex flex-col items-center gap-8 py-10">
          <Button
            type="button"
            onClick={() => onTry(combo)}
            disabled={disabled}
            className="!px-20 py-12 text-4xl font-semibold rounded-2xl flex items-center gap-4 bg-primary hover:bg-primary/90 text-white disabled:bg-gray-600 disabled:text-gray-400"
          >
            {t("tryThisLook")}
            <ChevronRight className="w-8 h-8" />
          </Button>

          <div className="flex items-center justify-center gap-6">
            <Button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={isFirst}
              className="!px-12 py-10 text-3xl font-semibold rounded-2xl flex items-center gap-3 bg-white text-black hover:bg-white/90 disabled:opacity-30"
            >
              <ChevronLeft className="w-7 h-7" />
              {tCommon("previous")}
            </Button>
            <Button
              type="button"
              onClick={() => setIndex((i) => Math.min(combos.length - 1, i + 1))}
              disabled={isLast}
              className="!px-12 py-10 text-3xl font-semibold rounded-2xl flex items-center gap-3 bg-white text-black hover:bg-white/90 disabled:opacity-30"
            >
              {tCommon("next")}
              <ChevronRight className="w-7 h-7" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LookAdvisor;
