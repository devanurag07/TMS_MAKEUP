"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosClient from "@/core/network/axios-client";
import { useTranslations } from "next-intl";
import TopRow from "@/design-system/components/common/top-row";
import CustomLookMakeup from "@/features/makeup-advisor/components/CustomLookMakeup";
import MakeupResult from "@/features/makeup-advisor/components/MakeupResult";
import type {
  MakeupCategory,
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

  const [category, setCategory] = useState<string>("lipstick");
  const [customLookKey, setCustomLookKey] = useState(0);
  const [initialCategories, setInitialCategories] = useState<MakeupCategory[]>(
    []
  );
  const [activeTab, setActiveTab] = useState<"custom" | "results">("custom");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultImageBase64, setResultImageBase64] = useState<string | null>(
    null
  );
  const [selectedShade, setSelectedShade] = useState("");

  const normalizeBase64 = (raw: string) => {
    let value = raw.trim();
    if (value.includes("base64,")) {
      value = value.split("base64,").pop()?.trim() ?? "";
    }
    return value;
  };

  const applyMakeup = async (
    selections: MakeupSelection[],
    sessionIdValue: string
  ) => {
    const image = getFileFromLocalStorage(CAMERA_CAPTURE_KEY);
    if (!image) {
      throw new Error("IMAGE_NOT_READY");
    }

    const basePrompt =
      selections.length === 1
        ? selections[0].prompt
        : `Apply all of the following makeup together in one natural, cohesive look. ${selections
            .map((s) => s.prompt)
            .join(". ")}.`;

    const prompt = `${basePrompt} Do not change any facial feature of the woman like lips, eyes or anything else.`;

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
      makeupType,
    };
  };

  const handleMakeupSubmit = async (selections: MakeupSelection[]) => {
    if (!selections.length) return;

    let _sessionId = sessionId ?? "";
    setResultLoading(true);
    setSelectedShade(selections.map((s) => s.shadeName).join(" · "));
    setCategory(selections.map((s) => s.category).join(","));
    setActiveTab("results");

    if (!sessionId) {
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

  const handleAddCategory = (nextCategory: string) => {
    const cat = nextCategory as MakeupCategory;
    setCategory(cat);
    setInitialCategories([cat]);
    setCustomLookKey((k) => k + 1);
    setActiveTab("custom");
  };

  const handleRegenerate = () => {
    setInitialCategories([]);
    setCustomLookKey((k) => k + 1);
    setActiveTab("custom");
  };

  return (
    <div className="h-full w-full bg-black">
      <TopRow
        onBack={() => router.push("/select-tool")}
        title={t("makeupAdvisor.title")}
      />

      <div className="flex justify-center mb-8 mt-8">
        <div className="bg-gray rounded-full p-1 flex border-2 border-gray-light">
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-8 py-3 rounded-full text-4xl font-medium transition-all ${activeTab === "custom"
                ? "bg-white text-black"
                : "text-gray-300 hover:text-white"
              }`}
          >
            {t("makeupAdvisor.tabs.customLook")}
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`px-8 py-3 rounded-full text-4xl font-medium transition-all ${activeTab === "results"
                ? "bg-white text-black"
                : "text-gray-300 hover:text-white"
              }`}
          >
            {t("makeupAdvisor.tabs.results")}
          </button>
        </div>
      </div>

      {activeTab === "custom" && (
        <CustomLookMakeup
          key={customLookKey}
          initialCategories={initialCategories}
          onSubmit={handleMakeupSubmit}
        />
      )}

      {activeTab === "results" && (
        <MakeupResult
          resultImage={resultImage}
          resultImageBase64={resultImageBase64}
          selectedShade={selectedShade}
          isLoading={resultLoading}
          onRegenerate={handleRegenerate}
          service={category}
          handleAddStyle={handleAddCategory}
        />
      )}
    </div>
  );
};

export default Page;
