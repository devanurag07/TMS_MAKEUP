"use client";
import Image from "next/image";
import { Camera } from "@/design-system/components/common/camera";
import { saveFileToLocalStorage } from "@/core/utils/common";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CAMERA_CAPTURE_KEY,
  SESSION_ID_KEY,
  SESSION_INPUT_IMG_KEY,
} from "@/core/constants/common-constants";
import wrongImg1 from "@/assets/camera-page/wrong 1.png";
import wrongImg2 from "@/assets/camera-page/wrong 2.png";
import wrongImg3 from "@/assets/camera-page/wrong 3.png";
import wrongImg4 from "@/assets/camera-page/wrong 4.png";
import rightImg2 from "@/assets/camera-page/correct 2.png";
import rightImg1 from "@/assets/camera-page/correct 1.png";
import { CheckIcon, ChevronRight, CrossIcon } from "lucide-react";
import { IoMdClose } from "react-icons/io";
import { createSession } from "@/features/session/api/session-api";
import TopRow from "@/design-system/components/common/top-row";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations();
  const router = useRouter();
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isCheckingAccessCode, setIsCheckingAccessCode] =
    useState<boolean>(false);

  const handleCapture = async (file: File) => {
    await saveFileToLocalStorage(file, CAMERA_CAPTURE_KEY);
    await saveFileToLocalStorage(file, SESSION_INPUT_IMG_KEY);
    // create session of image
    createSession().then((sessionId) => {
      if (sessionId) {
        localStorage.setItem(SESSION_ID_KEY, sessionId);
      }
    });
    router.push("/select-tool");
  };

  return (
    <div>
      <TopRow onBack={() => router.push("/")} title={t("home.title")} />
      <Camera
        isLocked={isLocked}
        isCheckingAccessCode={isCheckingAccessCode}
        onCapture={handleCapture}
        enableSwitch={true}
        primaryCamera={true}
      />

      <div className="bg-[#222222] border-[#6C6C6C] border-2 rounded-lg mt-8">
        <div className="text-center text-4xl  text-white p-[30px]">
          <div className="text-center text-4xl font-bold">
            {t("home.instructions")}
          </div>

          <div className="mt-4 flex justify-center">
            <div className="horizontal-line w-[70%] h-[2px] bg-white"></div>
          </div>
        </div>

        <div className="list-items px-8">
          <div className="flex items-center justify-start">
            <div className="list-item-icon">
              <ChevronRight className="h-[40px] w-[40px] text-white" />
            </div>
            <div className="list-item-text text-white text-2xl">
              {t("home.instruction1")}
            </div>
          </div>
          <div className="flex items-center justify-start">
            <div className="list-item-icon">
              <ChevronRight className="h-[40px] w-[40px] text-white" />
            </div>
            <div className="list-item-text text-white text-2xl">
              {t("home.instruction2")}
            </div>
          </div>

          <div className="flex items-center justify-start">
            <div className="list-item-icon">
              <ChevronRight className="h-[40px] w-[40px] text-white" />
            </div>
            <div className="list-item-text text-white text-2xl">
              {t("home.instruction3")}
            </div>
          </div>
        </div>

        <div className="recommended-avoid flex flex-row justify-center items-stretch p-8">
          <div className="recommended flex-1  w-full border-r-2 border-white pr-8">
            <div className="text-start text-2xl font-bold text-green-500">
              {t("home.recommended")}
            </div>

            <div className="demo-images flex flex-row justify-between items-center gap-4 mt-4 ">
              <div className="demo-image-item relative">
                <Image
                  src={rightImg1}
                  alt="instruction_female"
                  width={200}
                  height={400}
                />
                <div className="absolute bottom-4 right-4">
                  <div className="bg-green-500 rounded-full p-2">
                    <CheckIcon className="h-[20px] w-[20px] text-white" />
                  </div>
                </div>
              </div>
              <div className="demo-image-item relative">
                <Image
                  src={rightImg2}
                  alt="instruction_male"
                  width={200}
                  height={400}
                />
                <div className="absolute bottom-4 right-4">
                  <div className="bg-green-500 rounded-full p-2">
                    <CheckIcon className="h-[20px] w-[20px] text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="avoid flex-[2] w-full pl-8 pr-8">
            <div className="text-start text-2xl font-bold text-red-500">
              {t("home.avoid")}
            </div>

            <div className="demo-images flex flex-row justify-between items-center gap-4 mt-4">
              <div className="demo-image-item relative">
                <Image
                  src={wrongImg1}
                  alt="instruction_female"
                  width={200}
                  height={400}
                />
                <div className="absolute bottom-4 right-4">
                  <div className="bg-red-500 rounded-full p-2">
                    <IoMdClose className="h-[20px] w-[20px] text-white" />
                  </div>
                </div>
              </div>

              <div className="demo-image-item relative">
                <Image
                  src={wrongImg2}
                  alt="instruction_female"
                  width={200}
                  height={400}
                />
                <div className="absolute bottom-4 right-4">
                  <div className="bg-red-500 rounded-full p-2">
                    <IoMdClose className="h-[20px] w-[20px] text-white" />
                  </div>
                </div>
              </div>
              <div className="demo-image-item relative">
                <Image
                  src={wrongImg3}
                  alt="instruction_female"
                  width={200}
                  height={400}
                />
                <div className="absolute bottom-4 right-4">
                  <div className="bg-red-500 rounded-full p-2">
                    <IoMdClose className="h-[20px] w-[20px] text-white" />
                  </div>
                </div>
              </div>
              <div className="demo-image-item relative">
                <Image
                  src={wrongImg4}
                  alt="instruction_female"
                  width={200}
                  height={400}
                />
                <div className="absolute bottom-4 right-4">
                  <div className="bg-red-500 rounded-full p-2">
                    <IoMdClose className="h-[20px] w-[20px] text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
