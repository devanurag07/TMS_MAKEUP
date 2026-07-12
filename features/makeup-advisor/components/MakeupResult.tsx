"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";
import { FaQrcode } from "react-icons/fa";
import { IoMdRefreshCircle } from "react-icons/io";
import { Loader2 } from "lucide-react";
import { CgArrowsExchange } from "react-icons/cg";
import {
  fetchResultsApi,
  SessionResultItem,
} from "@/features/makeup-advisor/api/session-results-api";
import { getSessionId } from "@/core/utils/session";
import {
  getFileFromLocalStorage,
  imageUrlToBase64,
  setBase64AsInput,
  capitalizeText,
} from "@/core/utils/common";
import {
  CAMERA_CAPTURE_KEY,
  SESSION_INPUT_IMG_KEY,
} from "@/core/constants/common-constants";
import { useTranslations } from "next-intl";
import { AiOutlinePlusCircle } from "react-icons/ai";
import AIWatermarkImg from "@/assets/watermark/AI Watermark.png";

type ViewMode =
  | "session-input"
  | "input"
  | "current-result"
  | "previous-result"
  | "no-result";

interface MakeupResultProps {
  resultImage: string | null;
  resultImageBase64: string | null;
  selectedShade: string;
  isLoading?: boolean;
  onRegenerate?: () => void;
  onRatingChange?: (rating: number) => void;
  onSubmitRating?: () => void;
  handleAddStyle: (service: string) => void;
  service: string;
}

const MAKEUP_CATEGORIES = ["lipstick", "blush", "eyeshadow"] as const;

const MakeupResult = ({
  resultImage,
  resultImageBase64,
  selectedShade,
  isLoading = false,
  onRegenerate,
  onRatingChange,
  onSubmitRating,
  handleAddStyle,
  service,
}: MakeupResultProps) => {
  const t = useTranslations();
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [warning, setWarning] = useState(false);

  const [currentViewMode, setCurrentViewMode] =
    useState<ViewMode>("current-result");

  const [previousResults, setPreviousResults] = useState<SessionResultItem[]>(
    []
  );
  const [loadingPreviousResults, setLoadingPreviousResults] = useState(false);
  const [previousResultsError, setPreviousResultsError] = useState<
    string | null
  >(null);
  const [selectedPreviousResult, setSelectedPreviousResult] =
    useState<SessionResultItem | null>(null);
  const [inputImage, setInputImage] = useState<string | null>("");
  const [sessionInputImg, setSessionInputImg] = useState<string | null>("");

  void selectedShade;

  const addOnTargets = useMemo(() => {
    const applied = new Set(
      (service || "")
        .toLowerCase()
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    );
    return MAKEUP_CATEGORIES.filter((item) => !applied.has(item)).map(
      (target) => ({
        target,
        ariaKey:
          target === "lipstick"
            ? ("makeupResult.addOnLipstick" as const)
            : target === "blush"
              ? ("makeupResult.addOnBlush" as const)
              : ("makeupResult.addOnEyeshadow" as const),
      })
    );
  }, [service]);

  /**
   * Handles rating change and updates local state
   * @param newRating - New rating value (1-5)
   */
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setWarning(false); // Clear warning when user starts rating
    onRatingChange?.(newRating);
  };

  /**
   * Handles rating submission with validation
   */
  const handleSubmitRating = () => {
    if (rating === 0) {
      setWarning(true);
      return;
    }
    setRatingSubmitted(true);
    onSubmitRating?.();
  };

  /**
   * Handles regenerate button click
   */
  const handleRegenerate = () => {
    onRegenerate?.();
  };

  /**
   * Handles clicking on a previous result thumbnail
   * @param result - The previous result to display
   */
  const handlePreviousResultClick = (result: SessionResultItem) => {
    if (isLoading == false) {
      if (previousResults[previousResults.length - 1] === result) {
        if (resultImageBase64 !== null) {
          setCurrentViewMode("current-result");
        }
        setCurrentViewMode("previous-result");
        setSelectedPreviousResult(result);
        return;
      }
    }
    setSelectedPreviousResult(result);
    setCurrentViewMode("previous-result");
  };

  /**
   * Handles switching to input view
   */
  const handleShowInput = () => {
    setCurrentViewMode("input");
  };

  /**
   * Handles switching to current result view
   */
  const handleShowCurrentResult = () => {
    setCurrentViewMode("current-result");
  };

  /**
   * Handles toggling between input and current result
   */
  const handleToggleView = () => {
    if (currentViewMode === "input") {
      setCurrentViewMode("current-result");
    } else {
      setCurrentViewMode("input");
    }
  };

  const getSessionInputImg = () => {
    const image = getFileFromLocalStorage(SESSION_INPUT_IMG_KEY);
    const reader = new FileReader();
    reader.readAsDataURL(image || new Blob());
    reader.onload = () => {
      setSessionInputImg(reader.result as string);
    };
  };

  useEffect(() => {
    getSessionInputImg();
  }, []);

  useEffect(() => {
    const image = getFileFromLocalStorage(CAMERA_CAPTURE_KEY);
    if (image) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInputImage(e.target?.result as string);
      };
      reader.readAsDataURL(image);
    }
  }, []);

  useEffect(() => {
    const loadPreviousResults = async () => {
      const sessionId = await getSessionId();
      if (!sessionId) return;

      setLoadingPreviousResults(true);
      setPreviousResultsError(null);

      try {
        const response = await fetchResultsApi(sessionId);

        if (response.success && response.data) {
          // Filter out the current result if it exists and get previous results
          const filteredResults = response.data.filter(
            (result) => result.is_ready && result.output_url
          );
          setPreviousResults(filteredResults);
          setSelectedPreviousResult(filteredResults[0]);
        } else {
          setPreviousResults([]);
        }
      } catch (error) {
        console.error("Error fetching previous results:", error);
        setPreviousResultsError("Failed to load previous results");
        setPreviousResults([]);
      } finally {
        setLoadingPreviousResults(false);
      }
    };

    loadPreviousResults();
  }, [isLoading, resultImageBase64]);

  // Effect to automatically set the correct view mode based on available data
  useEffect(() => {
    if (isLoading) {
      setCurrentViewMode("current-result");
    } else if (resultImageBase64) {
      console.log("resultImageBase64", resultImageBase64);
      setCurrentViewMode("current-result");
    } else if (previousResults.length > 0) {
      setCurrentViewMode("previous-result");
    } else {
      setCurrentViewMode("no-result");
    }
  }, [resultImageBase64, previousResults]);

  // Loading state - show spinner while processing
  return (
    <div className="h-full bg-black text-white">
      {/* Main comparison area with before/after slider */}
      <div className="relative w-full h-full">
        <div className="relative">
          {/* Render content based on current view mode */}
          {currentViewMode === "current-result" && (
            <>
              {isLoading ? (
                <div className="w-full h-full border-2 border-white rounded-lg flex items-center justify-center min-h-[100vh] relative">
                  <Image
                    src={inputImage as string}
                    alt="Input image"
                    className="rounded-lg object-cover w-full h-[1080px] blur-sm"
                    width={1080}
                    height={1920}
                    loading="eager"
                  />
                  <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 animate-spin text-white" />
                </div>
              ) : (
                <Image
                  src={
                    resultImageBase64
                      ? `data:image/png;base64,${resultImageBase64}`
                      : resultImage || ""
                  }
                  alt="Current result"
                  className="rounded-lg object-cover w-full h-[1080px]"
                  width={1080}
                  height={1920}
                  loading="eager"
                />
              )}
              {/* Regenerate Button - positioned at bottom center */}
              {!isLoading && (
                <Button
                  onClick={handleRegenerate}
                  className="absolute bottom-[2vh] left-1/2 transform -translate-x-1/2 bg-black text-white rounded-full p-2 z-40 w-[100px] h-[100px] max-w-[120px] max-h-[120px] disabled:opacity-50"
                  disabled={isLoading}
                  aria-label={
                    isLoading ? "Processing..." : "Try a different hairstyle"
                  }
                >
                  {isLoading ? (
                    <></>
                  ) : (
                    <IoMdRefreshCircle
                      className="!w-[80px] !h-[80px]"
                      size={80}
                      color="white"
                    />
                  )}
                </Button>
              )}
            </>
          )}

          {currentViewMode === "session-input" && sessionInputImg && (
            <Image
              src={sessionInputImg}
              alt="Session Input image"
              className="rounded-lg object-cover w-full h-[1080px]"
              width={1080}
              height={1920}
              loading="eager"
            />
          )}

          {currentViewMode === "input" && inputImage && (
            <Image
              src={inputImage}
              alt="Input image"
              className="rounded-lg object-cover w-full h-[1080px]"
              width={1080}
              height={1920}
              loading="eager"
            />
          )}

          {currentViewMode === "previous-result" && selectedPreviousResult && (
            <div className="w-full h-full rounded-lg flex items-center justify-center min-h-[100vh]">
              <Image
                src={selectedPreviousResult.output_url}
                alt="Previous result"
                width={1080}
                height={1920}
                className="rounded-lg object-cover w-full h-[1080px]"
              />
            </div>
          )}

          {currentViewMode === "no-result" && (
            <div className="w-full h-full border-2 border-white rounded-lg flex items-center justify-center min-h-[100vh]">
              <p className="text-white text-2xl">
                {t("makeupResult.noPreviousResult")}
              </p>
            </div>
          )}

          {(currentViewMode == "current-result" ||
            currentViewMode == "session-input" ||
            currentViewMode == "input" ||
            currentViewMode == "previous-result") &&
            addOnTargets.length > 0 && (
              <div className="absolute bottom-[2vh] left-[2vw] z-40 flex flex-col gap-3">
                {addOnTargets.map(({ target, ariaKey }) => (
                  <Button
                    key={target}
                    onClick={async () => {
                      try {
                        if (currentViewMode == "current-result") {
                          if (resultImageBase64) {
                            await setBase64AsInput(
                              `data:image/png;base64,${resultImageBase64}`
                            );
                          }
                        } else if (currentViewMode == "session-input") {
                          if (sessionInputImg) {
                            await setBase64AsInput(sessionInputImg);
                          }
                        } else if (currentViewMode == "input") {
                          if (inputImage) {
                            await setBase64AsInput(inputImage);
                          }
                        } else if (currentViewMode == "previous-result") {
                          if (selectedPreviousResult) {
                            const prevImgUrl = selectedPreviousResult?.output_url;
                            const prevImgBase64 = await imageUrlToBase64(
                              prevImgUrl
                            );
                            await setBase64AsInput(prevImgBase64);
                          }
                        }
                      } catch (e) {
                        console.error("Failed to set result as input:", e);
                        return;
                      }
                      handleAddStyle(target);
                    }}
                    className="bg-black text-white rounded-full p-2 w-[100px] h-[100px] max-w-[120px] max-h-[120px]"
                    aria-label={t(ariaKey)}
                  >
                    <AiOutlinePlusCircle
                      className="!w-[40px] !h-[40px]"
                      size={40}
                      color="white"
                      aria-hidden
                    />
                  </Button>
                ))}
              </div>
            )}
          {(currentViewMode === "current-result" ||
            currentViewMode === "previous-result") && (
            <div
              className="absolute flex items-center justify-center top-[2vh] left-[2vw] text-white rounded-full p-2 z-40 w-[100px] h-[100px] max-w-[120px] max-h-[120px]"
              aria-label="QR Code"
            >
              <div className="flex items-center justify-center text-4xl font-bold">
                <Image
                  src={AIWatermarkImg}
                  alt="AI Watermark"
                  className="w-[100px] "
                />
              </div>
            </div>
          )}

          <Button
            onClick={() => setQrCodeOpen(true)}
            className="absolute bottom-[2vh] right-[2vw] bg-black text-white rounded-full p-2 z-40 w-[100px] h-[100px] max-w-[120px] max-h-[120px]"
            aria-label="QR Code"
          >
            <FaQrcode className="!w-[40px] !h-[40px]" size={40} color="white" />
          </Button>
        </div>

        <div className="flex mt-5 gap-4">
          <div className="box w-[200px] h-[200px] border-black border mt-4">
            {sessionInputImg !== "" && (
              <>
                <Image
                  src={sessionInputImg as string}
                  alt="Session Input image"
                  width={200}
                  height={200}
                  className={`w-full h-[180px] object-cover min-w-[180px] rounded-3xl cursor-pointer ${
                    currentViewMode === "session-input"
                      ? "outline-5 outline-white rounded-3xl"
                      : ""
                  }`}
                  onClick={() => {
                    setCurrentViewMode("session-input");
                  }}
                />
                <div className="label text-white text-center text-2xl mt-4">
                  Original Image
                </div>
              </>
            )}
          </div>
          <div className="box w-[200px] h-[200px] border-black border mt-4">
            {inputImage !== "" && (
              <>
                <Image
                  src={inputImage as string}
                  alt="Input image"
                  width={200}
                  height={200}
                  className={`w-full h-[180px] object-cover min-w-[180px] rounded-3xl cursor-pointer ${
                    currentViewMode === "input"
                      ? "outline-5 outline-white rounded-3xl"
                      : ""
                  }`}
                  onClick={handleShowInput}
                />
                <div className="label text-white text-center text-2xl mt-4">
                  Input Image
                </div>
              </>
            )}
          </div>
          <div>
            {loadingPreviousResults ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <span className="ml-2 text-white">
                  {t("makeupResult.loadingPrevious")}
                </span>
              </div>
            ) : previousResultsError ? (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-red-400">
                  {t("makeupResult.errorLoadingPrevious")}
                </p>
              </div>
            ) : previousResults.length > 0 || isLoading ? (
              <div className="flex gap-4 overflow-x-scroll max-w-[800px] overflow-y-hidden pl-4 pr-4">
                {previousResults.map((result, index) => (
                  <div
                    key={result.id}
                    className={`box w-[200px] h-[240px] border-black border flex-shrink-0 cursor-pointer`}
                    onClick={() => handlePreviousResultClick(result)}
                  >
                    <div className="relative mt-4">
                      <Image
                        src={result.output_url}
                        alt={`Previous result ${index + 1}`}
                        width={200}
                        height={200}
                        className={`w-full h-[180px] object-cover rounded-3xl ${
                          selectedPreviousResult?.id === result.id &&
                          currentViewMode === "previous-result"
                            ? " outline-5 outline-white rounded-3xl"
                            : ""
                        } ${
                          isLoading == false &&
                          currentViewMode == "current-result" &&
                          index === previousResults.length - 1
                            ? "outline-5 outline-white rounded-3xl"
                            : ""
                        }`}
                        onError={(e) => {
                          console.error(
                            "Error loading previous result image:",
                            result.output_url
                          );
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="label text-white text-center text-2xl mt-4">
                        {capitalizeText(result.hairstyle_name)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Current result thumbnail */}
                <>
                  {isLoading && (
                    <div
                      className="box w-[200px] h-[200px] border-black border flex-shrink-0 cursor-pointer"
                      onClick={handleShowCurrentResult}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                      </div>
                    </div>
                  )}
                </>
                <div
                  className="box w-[200px] h-[200px] border-black border flex-shrink-0 cursor-pointer"
                  // onClick={handleShowCurrentResult}
                >
                  <div className="w-full h-full flex items-center justify-center"></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-gray-400">
                  {t("makeupResult.noPreviousFound")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* show next service btn  */}
        <div className="content ">
          {/* QR Code Dialog */}
          <Dialog open={qrCodeOpen} onOpenChange={setQrCodeOpen}>
            <DialogContent className="flex flex-col items-center justify-center border-none max-w-[300px]">
              <QRCodeCanvas
                value={resultImage as string}
                size={250}
                bgColor={"#FFFFFF"}
                fgColor={"#000000"}
                level={"Q"}
                className="!w-[250px] !h-[250px] md:!w-[250px] md:!h-[250px]"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default MakeupResult;
