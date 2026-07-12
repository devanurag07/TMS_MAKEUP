"use client";
import {
  INPUT_AVAILABLE_KEY,
  SALON_LOGO_KEY,
  SHOW_QUESTIONS_KEY,
} from "@/core/constants/common-constants";
import { persistCurrentSalon } from "@/core/utils/salon-storage";
import { CURRENT_SALON_URL } from "@/core/constants/url-constants";
import axiosClient from "@/core/network/axios-client";
import Login from "@/features/auth/forms/login-form";
import { LoaderCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
interface MirrorFrameProps {
  children: React.ReactNode;
}

const MirrorFrame = ({ children }: MirrorFrameProps) => {
  const [scale, setScale] = useState(1);
  const [isLocked, setIsLocked] = useState(true);
  const [isCheckingAccessCode, setIsCheckingAccessCode] = useState(false);

  const getCurrentSalon = async () => {
    setIsCheckingAccessCode(true);
    try {
      const response = await axiosClient.get(CURRENT_SALON_URL);
      if (response.status == 200) {
        console.log("CURRENT SALON RESPONSE ", response.data);
        const data = response.data;
        if (data?.data && typeof data.data === "object") {
          persistCurrentSalon(data.data);
        }
        const inputAvailable = data.data.input_box_available;
        const showQuestions = data.data.show_questions;
        localStorage.setItem(SALON_LOGO_KEY, data.data.logo_image);
        localStorage.setItem(SHOW_QUESTIONS_KEY, showQuestions);

        if (inputAvailable) {
          // setInputBoxAvailable(inputAvailable);
          localStorage.setItem(INPUT_AVAILABLE_KEY, inputAvailable);
        }
        setIsLocked(false);
      } else {
        setIsLocked(true);
      }
    } catch (error) {
      console.error("Error verifying access code:", error);
      setIsLocked(true);
    } finally {
      setIsCheckingAccessCode(false);
    }
  };

  useEffect(() => {
    const updateScale = () => {
      const targetAspectRatio = 1080 / 1920;
      const currentAspectRatio = window.innerWidth / window.innerHeight;

      if (currentAspectRatio > targetAspectRatio) {
        // Window is wider than target ratio, scale based on height
        console.log(
          "setting scale height ",
          document.documentElement.clientHeight,
          document.documentElement.clientHeight / 1920
        );
        setScale(document.documentElement.clientHeight / 1920);
      } else {
        // Window is taller than target ratio, scale based on width
        console.log(
          "setting scale width ",
          document.documentElement.clientWidth,
          document.documentElement.clientWidth / 1080
        );

        setScale(document.documentElement.clientWidth / 1080);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    getCurrentSalon();
  }, []);

  return (
    <div
      className="bg-black text-white w-[1000px] md:w-[1080px] absolute top-0 left-1/2 overflow-scroll"
      style={{
        transform: `translateX(-50%) scale(${scale})`,
        transformOrigin: "top center",
        height: "1920px",
      }}
    >
      {isLocked && <Login onLogin={() => getCurrentSalon()} />}
      {!isLocked && <>{children}</>}
      <ToastContainer />
    </div>
  );
};

export default MirrorFrame;
