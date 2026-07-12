"use client";
import { CAMERA_CAPTURE_KEY } from "@/core/constants/common-constants";
import {
  getFileFromLocalStorage,
  removeFileFromLocalStorage,
} from "@/core/utils/common";
import { isSalonServiceEnabled } from "@/core/utils/salon-services";
import TopRow from "@/design-system/components/common/top-row";
import ServiceToolCard from "@/features/select-tool/components/ServiceToolCard";
import { History } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MakeupAdvisorImg from "@/assets/look-advisor.png";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

const Page = () => {
  const t = useTranslations();
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const makeupEnabled = isSalonServiceEnabled("makeup-advisor");

  const getImagePreview = () => {
    const image = getFileFromLocalStorage(CAMERA_CAPTURE_KEY);
    const reader = new FileReader();
    reader.readAsDataURL(image || new Blob());
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
  };

  useEffect(() => {
    getImagePreview();
  }, []);

  const showDisabledNudge = () => {
    toast.info(t("selectTool.serviceDisabled"), { autoClose: 4000 });
  };

  return (
    <div className="h-full w-full">
      <div className="h-[40%] w-full">
        <div className="h-[400px] w-full p-4 relative">
          <TopRow
            onBack={() => {
              removeFileFromLocalStorage("camera_capture.jpg");
              router.push("/");
            }}
          />

          <button
            onClick={() => router.push("/session-results")}
            className="absolute top-10 right-24 bg-black text-white rounded-full p-4 transition-colors z-10"
            aria-label="View Session Results"
          >
            <History className="w-16 h-16" />
          </button>
          <div className="flex flex-row justify-center items-center">
            <div className="circle-container absolute bottom-0 bg-white w-[400px] h-[400px] rounded-full translate-y-1/2 translate-x-1/2 right-1/2">
              {imagePreview !== null && (
                <Image
                  src={imagePreview || ""}
                  alt="image"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover rounded-full"
                />
              )}

              <div className="mt-10 border-line w-[150%] h-[2px] mx-auto bg-white -translate-x-1/2 absolute  left-1/2"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[50%] w-full">
        <div className="select-container w-full rounded-lg">
          <div className="text-center text-white text-5xl font-semibold mt-16">
            {t("selectTool.title")}
          </div>

          <div className="grid grid-cols-1 gap-10 p-16 max-w-2xl mx-auto">
            <ServiceToolCard
              image={MakeupAdvisorImg}
              imageAlt="makeup-advisor"
              label={t("selectTool.makeupAdvisor")}
              enabled={makeupEnabled}
              onSelect={() => router.push("/makeup-advisor")}
              onLockedClick={showDisabledNudge}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
