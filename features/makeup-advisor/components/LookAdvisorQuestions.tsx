"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import QuestionsComponent from "@/design-system/components/forms/questions-component";
import type {
  DesiredMakeupLook,
  LookAdvisorPreferences,
  OutfitColor,
} from "../types";

interface LookAdvisorQuestionsProps {
  onSubmit: (preferences: LookAdvisorPreferences) => void;
}

const DESIRED_LOOKS: DesiredMakeupLook[] = [
  "Natural",
  "Soft Glam",
  "Full Glam",
  "Office",
  "Party",
  "Bridal",
];

const OUTFIT_COLORS: {
  value: OutfitColor;
  labelKey: string;
  descKey?: string;
}[] = [
  {
    value: "Neutral (Black, White, Grey, Cream)",
    labelKey: "neutral",
    descKey: "neutralDesc",
  },
  {
    value: "Beige (Beige, Tan, Camel, Brown)",
    labelKey: "beige",
    descKey: "beigeDesc",
  },
  {
    value: "Red (Red, Burgundy, Maroon, Wine)",
    labelKey: "red",
    descKey: "redDesc",
  },
  {
    value: "Pink (Pink, Rose, Fuchsia)",
    labelKey: "pink",
    descKey: "pinkDesc",
  },
  {
    value: "Purple (Lavender, Purple, Plum)",
    labelKey: "purple",
    descKey: "purpleDesc",
  },
  {
    value: "Blue (Sky Blue, Navy, Royal Blue)",
    labelKey: "blue",
    descKey: "blueDesc",
  },
  {
    value: "Green (Olive, Emerald, Teal)",
    labelKey: "green",
    descKey: "greenDesc",
  },
  {
    value: "Warm (Yellow, Orange, Gold, Mustard)",
    labelKey: "warm",
    descKey: "warmDesc",
  },
  {
    value: "Multicolored",
    labelKey: "multicolored",
  },
];

const LookAdvisorQuestions = ({ onSubmit }: LookAdvisorQuestionsProps) => {
  const t = useTranslations("lookAdvisor.questions");
  const [answers, setAnswers] = useState<{ [key: string]: string[] }>({});

  const questions = [
    {
      key: "desiredLook",
      question: t("desiredLook.title"),
      options: DESIRED_LOOKS.map((look) => ({
        label: look,
        value: look,
      })),
    },
    {
      key: "outfitColor",
      question: t("outfitColor.title"),
      options: OUTFIT_COLORS.map((color) => ({
        label: t(`outfitColor.options.${color.labelKey}`),
        value: color.value,
        description: color.descKey
          ? t(`outfitColor.options.${color.descKey}`)
          : undefined,
      })),
    },
  ];

  const handleAnswerChange = (questionKey: string, value: string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: value,
    }));
  };

  const handleSubmit = () => {
    const desiredLook = answers.desiredLook?.[0] as DesiredMakeupLook | undefined;
    const outfitColor = answers.outfitColor?.[0] as OutfitColor | undefined;
    if (!desiredLook || !outfitColor) return;
    onSubmit({ desiredLook, outfitColor });
  };

  return (
    <div className="h-[85%] overflow-y-auto bg-black text-white px-8">
      <QuestionsComponent
        questions={questions}
        answers={answers}
        onAnswerChange={handleAnswerChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default LookAdvisorQuestions;
