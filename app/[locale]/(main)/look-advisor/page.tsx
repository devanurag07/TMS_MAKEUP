"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosClient from "@/core/network/axios-client";
import { useTranslations } from "next-intl";
import TopRow from "@/design-system/components/common/top-row";
import LookAdvisor from "@/features/makeup-advisor/components/LookAdvisor";
import LookAdvisorQuestions from "@/features/makeup-advisor/components/LookAdvisorQuestions";
import MakeupResult from "@/features/makeup-advisor/components/MakeupResult";
import { fetchLookCombos } from "@/features/makeup-advisor/api/look-advisor-api";
import type {
  LookAdvisorPreferences,
  LookCombo,
  MakeupSelection,
} from "@/features/makeup-advisor/types";
import {
  getFileFromLocalStorage,
  imageUrlToBase64,
} from "@/core/utils/common";
import { CAMERA_CAPTURE_KEY } from "@/core/constants/common-constants";
import { CHANGE_MAKEUP_URL } from "@/core/constants/url-constants";
import { useSalonServiceGuard } from "@/core/hooks/useSalonServiceGuard";
import { getSessionId } from "@/core/utils/session";

const Page = () => {
  const router = useRouter();
  const t = useTranslations();
  useSalonServiceGuard("makeup-advisor", t("selectTool.serviceDisabled"));

  const [activeTab, setActiveTab] = useState<"looks" | "results">("looks");

  const [preferences, setPreferences] =
    useState<LookAdvisorPreferences | null>(null);
  const [combos, setCombos] = useState<LookCombo[]>([]);
  const [combosLoading, setCombosLoading] = useState(false);
  const [combosError, setCombosError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultImageBase64, setResultImageBase64] = useState<string | null>(
    null
  );
  const [selectedShade, setSelectedShade] = useState("");
  const [category, setCategory] = useState("");

  const normalizeBase64 = (raw: string) => {
    let value = raw.trim();
    if (value.includes("base64,")) {
      value = value.split("base64,").pop()?.trim() ?? "";
    }
    return value;
  };

  const generateCombos = useCallback(async (
    selectedPreferences: LookAdvisorPreferences
  ) => {
    setCombosLoading(true);
    setCombosError(null);

    const image = getFileFromLocalStorage(CAMERA_CAPTURE_KEY);
    if (!image) {
      setCombosError("IMAGE_NOT_READY");
      setCombosLoading(false);
      return;
    }

    let _sessionId = sessionId ?? "";
    if (!_sessionId) {
      try {
        const sessionId_ = await getSessionId();
        if (sessionId_) {
          setSessionId(sessionId_);
          _sessionId = sessionId_;
        }
      } catch (error) {
        console.error("Error creating session:", error);
      }
    }

    try {
      const result = await fetchLookCombos(image, {
        preferences: selectedPreferences,
        sessionId: _sessionId || undefined,
        gender: "female",
      });
      setCombos(result);
      if (result.length === 0) {
        setCombosError("NO_COMBOS");
      }
    } catch (error) {
      console.error("Error generating looks:", error);
      setCombosError("GENERIC");
    } finally {
      setCombosLoading(false);
    }
  }, [sessionId]);

  const handlePreferencesSubmit = (selected: LookAdvisorPreferences) => {
    setPreferences(selected);
    generateCombos(selected);
  };

  const changePreferences = () => {
    setPreferences(null);
    setCombos([]);
    setCombosError(null);
  };

  const applyMakeup = async (
    selections: MakeupSelection[],
    sessionIdValue: string
  ) => {
    const image = getFileFromLocalStorage(CAMERA_CAPTURE_KEY);
    if (!image) {
      throw new Error("IMAGE_NOT_READY");
    }

    const prompt =
      selections.length === 1
        ? selections[0].prompt
        : `Apply all of the following makeup together in one natural, cohesive look. ${selections
            .map((s) => s.prompt)
            .join(". ")}.`;

    const makeupName = selections.map((s) => s.shadeName).join(" · ");
    const makeupType =
      selections.length === 1
        ? selections[0].category
        : selections.map((s) => s.category).join(",");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("session_id", sessionIdValue);
    formData.append("prompt", prompt);
    formData.append("makeup_name", makeupName);
    formData.append("makeup_type", makeupType);
    formData.append("gender", "female");

    const response = await axiosClient.post(CHANGE_MAKEUP_URL, formData);
    const data = response.data;

    if (!data.success) {
      throw new Error("API returned unsuccessful response");
    }

    let raw =
      typeof data.image_base64 === "string"
        ? normalizeBase64(data.image_base64)
        : "";
    if (!raw && data.output_url) {
      try {
        const dataUrl = await imageUrlToBase64(data.output_url);
        raw = normalizeBase64(dataUrl);
      } catch (e) {
        console.error("Failed to build preview from output_url:", e);
      }
    }

    return {
      outputUrl: (data.output_url as string | null) ?? null,
      imageBase64: raw || null,
    };
  };

  const handleTry = async (combo: LookCombo) => {
    const selections: MakeupSelection[] = combo.items.map((item) => ({
      category: item.category,
      shadeName: item.shadeName,
      prompt: item.prompt,
    }));

    if (!selections.length) return;

    let _sessionId = sessionId ?? "";
    setResultLoading(true);
    setSelectedShade(combo.name);
    setCategory(selections.map((s) => s.category).join(","));
    setActiveTab("results");

    if (!_sessionId) {
      try {
        const sessionId_ = await getSessionId();
        if (sessionId_) {
          setSessionId(sessionId_);
          _sessionId = sessionId_;
        }
      } catch (error) {
        console.error("Error creating session:", error);
        toast.error(t("makeupAdvisor.messages.sessionError"));
        setResultLoading(false);
        return;
      }
    }

    if (!getFileFromLocalStorage(CAMERA_CAPTURE_KEY)) {
      toast.error(t("makeupAdvisor.messages.imageNotReady"));
      setResultLoading(false);
      return;
    }

    try {
      const result = await applyMakeup(selections, _sessionId);
      setResultImage(result.outputUrl);
      setResultImageBase64(result.imageBase64);
      toast.success(t("makeupAdvisor.messages.success"));
    } catch (error) {
      console.error("Error processing makeup:", error);
      if (error instanceof Error && error.message === "IMAGE_NOT_READY") {
        toast.error(t("makeupAdvisor.messages.imageNotReady"));
      } else {
        toast.error(t("makeupAdvisor.messages.error"));
      }
    } finally {
      setResultLoading(false);
    }
  };

  const backToLooks = () => setActiveTab("looks");

  return (
    <div className="h-full w-full bg-black">
      <TopRow
        onBack={() => router.push("/select-tool")}
        title={t("lookAdvisor.title")}
      />

      <div className="flex justify-center mb-8 mt-8">
        <div className="bg-gray rounded-full p-1 flex border-2 border-gray-light">
          <button
            onClick={() => setActiveTab("looks")}
            className={`px-8 py-3 rounded-full text-4xl font-medium transition-all ${
              activeTab === "looks"
                ? "bg-white text-black"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {t("lookAdvisor.tabs.looks")}
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`px-8 py-3 rounded-full text-4xl font-medium transition-all ${
              activeTab === "results"
                ? "bg-white text-black"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {t("lookAdvisor.tabs.results")}
          </button>
        </div>
      </div>

      {activeTab === "looks" &&
        (!preferences ? (
          <LookAdvisorQuestions onSubmit={handlePreferencesSubmit} />
        ) : combosLoading ? (
          <div className="h-[85%] flex flex-col items-center justify-center gap-8 text-white">
            <Loader2 className="w-20 h-20 animate-spin" />
            <p className="text-4xl font-medium">{t("lookAdvisor.analyzing")}</p>
          </div>
        ) : combosError ? (
          <div className="h-[85%] flex flex-col items-center justify-center gap-8 text-white px-8 text-center">
            <p className="text-3xl text-white/70 max-w-3xl">
              {combosError === "IMAGE_NOT_READY"
                ? t("makeupAdvisor.messages.imageNotReady")
                : combosError === "NO_COMBOS"
                  ? t("lookAdvisor.noCombos")
                  : t("lookAdvisor.error")}
            </p>
            {combosError === "IMAGE_NOT_READY" ? (
              <Button
                onClick={() => router.push("/")}
                className="!px-16 py-10 text-3xl font-semibold rounded-2xl bg-white text-black hover:bg-white/90"
              >
                {t("common.home")}
              </Button>
            ) : (
              <Button
                onClick={() => generateCombos(preferences)}
                className="!px-16 py-10 text-3xl font-semibold rounded-2xl bg-primary hover:bg-primary/90 text-white"
              >
                {t("lookAdvisor.retry")}
              </Button>
            )}
          </div>
        ) : (
          <LookAdvisor
            combos={combos}
            onTry={handleTry}
            onReset={changePreferences}
            disabled={resultLoading}
          />
        ))}

      {activeTab === "results" && (
        <MakeupResult
          resultImage={resultImage}
          resultImageBase64={resultImageBase64}
          selectedShade={selectedShade}
          isLoading={resultLoading}
          onRegenerate={backToLooks}
          service={category}
          handleAddStyle={backToLooks}
        />
      )}
    </div>
  );
};

export default Page;
