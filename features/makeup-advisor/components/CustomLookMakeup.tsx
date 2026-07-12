"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { GiLipstick, GiPowder, GiEyelashes } from "react-icons/gi";
import { Toast } from "@/design-system/components/toast/toast";
import { useTranslations } from "next-intl";
import makeupPrompts from "../data/makeup_prompts.json";
import type {
  MakeupCategory,
  MakeupPrompts,
  MakeupSelection,
} from "../types";

interface CustomLookMakeupProps {
  /** Prefer opening the page that contains this effect when returning from Results */
  initialCategories?: MakeupCategory[];
  onSubmit?: (selections: MakeupSelection[]) => void;
}

const prompts = makeupPrompts as MakeupPrompts;

const PAGE_CATEGORIES: MakeupCategory[][] = [
  ["lipstick", "blush"],
  ["eyeshadow"],
];

const CATEGORY_ORDER: MakeupCategory[] = ["lipstick", "blush", "eyeshadow"];

const CATEGORY_ICONS: Record<
  MakeupCategory,
  React.ComponentType<{ className?: string; size?: number }>
> = {
  lipstick: GiLipstick,
  blush: GiPowder,
  eyeshadow: GiEyelashes,
};

type ShadeOption = {
  id: string;
  name: string;
  rgb: number[];
  prompt: string;
};

const CustomLookMakeup = ({
  initialCategories = [],
  onSubmit,
}: CustomLookMakeupProps) => {
  const t = useTranslations("customLookMakeup");
  const tCommon = useTranslations("common");

  const startPage =
    initialCategories[0] === "eyeshadow" ? 1 : 0;

  const [page, setPage] = useState(startPage);
  const [selectedShades, setSelectedShades] = useState<
    Partial<Record<MakeupCategory, string>>
  >({});

  useEffect(() => {
    setPage(startPage);
  }, [startPage]);

  const shadesByCategory = useMemo(() => {
    return CATEGORY_ORDER.reduce(
      (acc, category) => {
        const categoryPrompts = prompts[category] ?? {};
        acc[category] = Object.entries(categoryPrompts).map(
          ([name, entry]) => ({
            id: name,
            name,
            rgb: entry.rgb,
            prompt: entry.prompt,
          })
        );
        return acc;
      },
      {} as Record<MakeupCategory, ShadeOption[]>
    );
  }, []);

  const selectShade = (category: MakeupCategory, shadeId: string) => {
    setSelectedShades((prev) => {
      if (prev[category] === shadeId) {
        const next = { ...prev };
        delete next[category];
        return next;
      }
      return { ...prev, [category]: shadeId };
    });
  };

  const selections: MakeupSelection[] = CATEGORY_ORDER.filter(
    (category) => selectedShades[category]
  ).map((category) => {
    const shade = shadesByCategory[category].find(
      (item) => item.id === selectedShades[category]
    )!;
    return {
      category,
      shadeName: shade.name,
      prompt: shade.prompt,
    };
  });

  const isComplete = selections.length > 0;
  const isLastPage = page === PAGE_CATEGORIES.length - 1;
  const categoriesOnPage = PAGE_CATEGORIES[page];

  const handleProceed = () => {
    if (!isComplete) {
      Toast.error(t("selectShade"));
      return;
    }
    onSubmit?.(selections);
  };

  const rgbToCss = (rgb: number[]) =>
    `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

  return (
    <div className="h-[85%] bg-black text-white overflow-y-auto">
      <div className="max-w-5xl mx-auto flex flex-col p-8 justify-around min-h-full">
        {/* Page indicator */}
        <div className="flex justify-center gap-3 mb-10">
          {PAGE_CATEGORIES.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPage(index)}
              className={`h-3 rounded-full transition-all ${page === index
                ? "w-12 bg-white"
                : "w-3 bg-white/30 hover:bg-white/50"
                }`}
              aria-label={t("pageLabel", { page: index + 1 })}
            />
          ))}
        </div>

        {categoriesOnPage.map((category) => {
          const Icon = CATEGORY_ICONS[category];
          const selectedId = selectedShades[category];

          return (
            <div key={category} className=" flex-1">
              <div className="relative">
                <div className="px-6 py-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-black flex items-center gap-4 whitespace-nowrap">
                  <Icon className="w-12 h-12 shrink-0" size={48} />
                  <span className="text-4xl font-bold">
                    {t("selectShadeFor", {
                      effect: t(`categories.${category}`),
                    })}
                  </span>
                </div>
                <div className="bg-white h-[2px] w-full" />
              </div>

              <div className="grid grid-cols-4 gap-6 max-w-4xl mx-auto mt-20">
                {shadesByCategory[category].map((shade) => {
                  const isSelected = selectedId === shade.id;
                  return (
                    <button
                      key={shade.id}
                      type="button"
                      onClick={() => selectShade(category, shade.id)}
                      className="flex flex-col items-center transition-opacity duration-150"
                    >
                      <div
                        className={`relative w-40 h-20 rounded-2xl mb-4 border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-white"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: rgbToCss(shade.rgb) }}
                      >
                        {isSelected && (
                          <Check
                            className="w-10 h-10 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                      <span
                        className={`text-3xl text-center leading-tight ${
                          isSelected
                            ? "font-semibold text-white"
                            : "font-medium text-white/50"
                        }`}
                      >
                        {shade.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="flex flex-col items-center gap-6 py-8">
          {selections.length > 0 && (
            <p className="text-2xl text-white/60 text-center">
              {selections
                .map(
                  (s) =>
                    `${t(`categories.${s.category}`)}: ${s.shadeName}`
                )
                .join("  ·  ")}
            </p>
          )}

          <div className="flex items-center justify-center gap-6 flex-wrap">
            {page > 0 && (
              <Button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                className="!px-16 py-12 text-4xl font-semibold rounded-2xl flex items-center gap-4 bg-white text-black hover:bg-white/90"
              >
                <ChevronLeft className="w-8 h-8" />
                {tCommon("previous")}
              </Button>
            )}

            {!isLastPage ? (
              <Button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="!px-16 py-12 text-4xl font-semibold rounded-2xl flex items-center gap-4 bg-primary hover:bg-primary/90 text-white"
              >
                {tCommon("next")}
                <ChevronRight className="w-8 h-8" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleProceed}
                disabled={!isComplete}
                className={`!px-20 py-12 text-4xl font-semibold rounded-2xl flex items-center gap-4 ${isComplete
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {t("proceed")}
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomLookMakeup;
