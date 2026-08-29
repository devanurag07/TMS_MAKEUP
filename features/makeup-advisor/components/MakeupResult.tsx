"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";
import { FaQrcode } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { MdClose, MdCompare } from "react-icons/md";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
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
import AnalysisProgressScreen from "@/design-system/components/common/analysis-progress-screen";

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
  /** Navigate to service selection using the current image as input */
  handleAddStyle: (previousCapture?: File | null) => void;
  service: string;
}

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
  const [generationProgress, setGenerationProgress] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [compareImages, setCompareImages] = useState<string[]>([]);

  useEffect(() => {
    if (isLoading) setGenerationProgress(0);
  }, [isLoading]);

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
  const hasLoadedPreviousResults = useRef(false);

  void service;
  void onRegenerate;

  const currentResultSrc = resultImageBase64
    ? `data:image/png;base64,${resultImageBase64}`
    : resultImage || "";

  const toggleCompareImage = (url: string) => {
    if (!url) return;
    setCompareImages((prev) => {
      if (prev.includes(url)) return prev.filter((item) => item !== url);
      if (prev.length < 2) return [...prev, url];
      return [prev[prev.length - 1], url];
    });
  };

  const exitCompare = () => {
    setCompareMode(false);
    setCompareImages([]);
    setCurrentViewMode("current-result");
  };

  /** Newest → oldest after Original / Input thrumbnails */
  const orderedResults = useMemo(() => {
    return [...previousResults].sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      if (Number.isNaN(ta) || Number.isNaN(tb)) return (b.id ?? 0) - (a.id ?? 0);
      return tb - ta;
    });
  }, [previousResults]);

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
   * Handles clicking on a previous result thumbnail
   * @param result - The previous result to display
   */
  const handlePreviousResultClick = (result: SessionResultItem) => {
    const isLatest =
      orderedResults.length > 0 && orderedResults[0]?.id === result.id;
    if (!isLoading && isLatest && (resultImageBase64 || resultImage)) {
      setSelectedPreviousResult(result);
      setCurrentViewMode("current-result");
      return;
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
  }, [isLoading, resultImageBase64]);

  useEffect(() => {
    if (isLoading && hasLoadedPreviousResults.current) return;

    const loadPreviousResults = async () => {
      const sessionId = await getSessionId();
      if (!sessionId) return;

      const isInitialLoad = !hasLoadedPreviousResults.current;
      if (isInitialLoad) {
        setLoadingPreviousResults(true);
        setPreviousResultsError(null);
      }

      try {
        const response = await fetchResultsApi(sessionId);

        if (response.success && response.data) {
          const filteredResults = response.data.filter(
            (result) => result.is_ready && result.output_url
          );
          const newestFirst = [...filteredResults].sort((a, b) => {
            const ta = new Date(a.created_at).getTime();
            const tb = new Date(b.created_at).getTime();
            if (Number.isNaN(ta) || Number.isNaN(tb))
              return (b.id ?? 0) - (a.id ?? 0);
            return tb - ta;
          });
          setPreviousResults((prev) => {
            if (newestFirst.length === 0) return prev;
            const byId = new Map(prev.map((item) => [item.id, item]));
            for (const item of newestFirst) {
              byId.set(item.id, item);
            }
            return [...byId.values()].sort((a, b) => {
              const ta = new Date(a.created_at).getTime();
              const tb = new Date(b.created_at).getTime();
              if (Number.isNaN(ta) || Number.isNaN(tb))
                return (b.id ?? 0) - (a.id ?? 0);
              return tb - ta;
            });
          });
          setSelectedPreviousResult((current) => current ?? newestFirst[0] ?? null);
          hasLoadedPreviousResults.current = true;
        }
      } catch (error) {
        console.error("Error fetching previous results:", error);
        if (!hasLoadedPreviousResults.current) {
          setPreviousResultsError("Failed to load previous results");
        }
      } finally {
        setLoadingPreviousResults(false);
      }
    };

    loadPreviousResults();
  }, [isLoading, resultImageBase64]);

  // Only auto-pick when primary result/loading changes — don’t override thumbnail picks
  useEffect(() => {
    if (isLoading) {
      setCurrentViewMode("current-result");
    } else if (resultImageBase64 || resultImage) {
      setCurrentViewMode("current-result");
    } else if (previousResults.length > 0) {
      setCurrentViewMode("previous-result");
    } else {
      setCurrentViewMode("no-result");
    }
  }, [isLoading, resultImageBase64, resultImage]);

  const showCompareSlider = compareMode && compareImages.length === 2;

  const SelectMark = ({ checked }: { checked: boolean }) => (
    <div className="flex gap-4 text-white text-2xl mt-4 text-center items-center w-full justify-center">
      <input type="checkbox" checked={checked} readOnly /> Select
    </div>
  );

  // Loading state - show spinner while processing
  return (
    <div className="h-full bg-black text-white">
      {/* Main comparison area with before/after slider */}
      <div className="relative w-full h-full">
        <div className="relative">
          {/* Render content based on current view mode */}
          {!showCompareSlider && currentViewMode === "current-result" && (
            <>
              {isLoading ? (
                <AnalysisProgressScreen
                  title=""
                  variant="generation"
                  images={
                    inputImage ? [{ src: inputImage as string }] : []
                  }
                  stages={[
                    t("lookAdvisor.progress.uploading"),
                    t("lookAdvisor.progress.detecting"),
                    t("lookAdvisor.progress.generating"),
                    t("lookAdvisor.progress.finalizing"),
                  ]}
                  onProgressChange={setGenerationProgress}
                />
              ) : (
                <div className="w-full flex items-center justify-center bg-black">
                  <Image
                    src={currentResultSrc}
                    alt="Current result"
                    className="rounded-lg object-contain w-full max-h-[1080px] h-auto"
                    width={1080}
                    height={1920}
                    loading="eager"
                    unoptimized
                  />
                </div>
              )}
            </>
          )}

          {showCompareSlider && (
            <ReactCompareSlider
              className="max-h-[1080px]"
              itemOne={
                <ReactCompareSliderImage
                  src={compareImages[0]}
                  alt="Compare one"
                  style={{ objectFit: "contain", backgroundColor: "black" }}
                />
              }
              itemTwo={
                <ReactCompareSliderImage
                  src={compareImages[1]}
                  alt="Compare two"
                  style={{ objectFit: "contain", backgroundColor: "black" }}
                />
              }
            />
          )}

          {!showCompareSlider && currentViewMode === "session-input" && sessionInputImg && (
            <div className="w-full flex items-center justify-center bg-black">
              <Image
                src={sessionInputImg}
                alt="Session Input image"
                className="rounded-lg object-contain w-full max-h-[1080px] h-auto"
                width={1080}
                height={1920}
                loading="eager"
              />
            </div>
          )}

          {!showCompareSlider && currentViewMode === "input" && inputImage && (
            <div className="w-full flex items-center justify-center bg-black">
              <Image
                src={inputImage}
                alt="Input image"
                className="rounded-lg object-contain w-full max-h-[1080px] h-auto"
                width={1080}
                height={1920}
                loading="eager"
              />
            </div>
          )}

          {!showCompareSlider && currentViewMode === "previous-result" && selectedPreviousResult && (
            <div className="w-full h-full rounded-lg flex items-center justify-center min-h-[100vh] bg-black">
              <Image
                src={selectedPreviousResult.output_url}
                alt="Previous result"
                width={1080}
                height={1920}
                className="rounded-lg object-contain w-full max-h-[1080px] h-auto"
                unoptimized
              />
            </div>
          )}

          {!showCompareSlider && currentViewMode === "no-result" && (
            <div className="w-full h-full border-2 border-white rounded-lg flex items-center justify-center min-h-[100vh]">
              <p className="text-white text-2xl">
                {t("makeupResult.noPreviousResult")}
              </p>
            </div>
          )}

          {!isLoading &&
            (currentViewMode === "current-result" ||
              currentViewMode === "previous-result" ||
              compareMode) && (
              <Button
                onClick={() => {
                  if (compareMode) {
                    exitCompare();
                    return;
                  }
                  setCompareMode(true);
                }}
                className="absolute bottom-[2vh] left-1/2 -translate-x-1/2 bg-black text-white rounded-full p-2 z-40 w-[100px] h-[100px] max-w-[120px] max-h-[120px] disabled:opacity-50"
                disabled={isLoading}
                aria-label={compareMode ? "Close compare" : "Compare looks"}
              >
                {compareMode ? (
                  <MdClose className="!w-[80px] !h-[80px]" size={80} color="white" />
                ) : (
                  <MdCompare className="!w-[80px] !h-[80px]" size={80} color="white" />
                )}
              </Button>
            )}

          {!compareMode &&
            (currentViewMode == "current-result" ||
            currentViewMode == "session-input" ||
            currentViewMode == "input" ||
            currentViewMode == "previous-result") &&
            !isLoading && (
              <div className="absolute bottom-[2vh] left-[2vw] z-40">
                <Button
                  onClick={async () => {
                    const previousCapture =
                      getFileFromLocalStorage(CAMERA_CAPTURE_KEY);
                    try {
                      if (currentViewMode == "current-result") {
                        if (resultImageBase64) {
                          await setBase64AsInput(
                            `data:image/png;base64,${resultImageBase64}`,
                          );
                        } else if (resultImage) {
                          const asDataUrl = await imageUrlToBase64(resultImage);
                          await setBase64AsInput(asDataUrl);
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
                    handleAddStyle(previousCapture);
                  }}
                  className="bg-black text-white rounded-full p-2 w-[100px] h-[100px] max-w-[120px] max-h-[120px]"
                  aria-label={t("makeupResult.addOn")}
                >
                  <AiOutlinePlusCircle
                    className="!w-[40px] !h-[40px]"
                    size={40}
                    color="white"
                    aria-hidden
                  />
                </Button>
              </div>
            )}

          {isLoading && (
            <div
              className="absolute bottom-[2vh] left-[2vw] z-50 w-[100px] h-[100px] rounded-full bg-black flex items-center justify-center shadow-lg ring-2 ring-white/25"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="block w-full text-center text-white text-[28px] font-black tabular-nums leading-none">
                {Math.round(generationProgress)}%
              </span>
            </div>
          )}

          {!isLoading && !compareMode && (
            <Button
              onClick={() => setQrCodeOpen(true)}
              className="absolute bottom-[2vh] right-[2vw] bg-black text-white rounded-full p-2 z-40 w-[100px] h-[100px] max-w-[120px] max-h-[120px]"
              aria-label="QR Code"
            >
              <FaQrcode
                className="!w-[40px] !h-[40px]"
                size={40}
                color="white"
              />
            </Button>
          )}
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
                  className={`w-full h-[180px] object-cover min-w-[180px] rounded-3xl cursor-pointer ${currentViewMode === "session-input"
                    ? "outline-5 outline-white rounded-3xl"
                    : ""
                    }`}
                  onClick={
                    compareMode
                      ? () => toggleCompareImage(sessionInputImg ?? "")
                      : () => setCurrentViewMode("session-input")
                  }
                />
                {compareMode ? (
                  <SelectMark
                    checked={compareImages.includes(sessionInputImg ?? "")}
                  />
                ) : (
                  <div className="label text-white text-center text-2xl mt-4">
                    Original Image
                  </div>
                )}
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
                  className={`w-full h-[180px] object-cover min-w-[180px] rounded-3xl cursor-pointer ${currentViewMode === "input"
                    ? "outline-5 outline-white rounded-3xl"
                    : ""
                    }`}
                  onClick={
                    compareMode
                      ? () => toggleCompareImage(inputImage ?? "")
                      : handleShowInput
                  }
                />
                {compareMode ? (
                  <SelectMark checked={compareImages.includes(inputImage ?? "")} />
                ) : (
                  <div className="label text-white text-center text-2xl mt-4">
                    Input Image
                  </div>
                )}
              </>
            )}
          </div>
          <div>
            {loadingPreviousResults && previousResults.length === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <span className="ml-2 text-white">
                  {t("makeupResult.loadingPrevious")}
                </span>
              </div>
            ) : previousResultsError && previousResults.length === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-red-400">
                  {t("makeupResult.errorLoadingPrevious")}
                </p>
              </div>
            ) : previousResults.length > 0 || isLoading ? (
              <div className="flex gap-4 overflow-x-scroll max-w-[800px] overflow-y-hidden pl-4 pr-4">
                {isLoading && (
                  <div
                    className="box w-[200px] h-[240px] border-black border flex-shrink-0 cursor-pointer"
                    onClick={handleShowCurrentResult}
                  >
                    <div className="relative mt-4">
                      <div
                        className={`w-full h-[180px] min-w-[180px] rounded-3xl bg-black/60 flex items-center justify-center ${
                          currentViewMode === "current-result"
                            ? "outline-5 outline-white"
                            : ""
                        }`}
                      >
                        <Loader2 className="w-12 h-12 animate-spin text-white" />
                      </div>
                      <div className="label text-white text-center text-2xl mt-4 truncate px-1">
                        {selectedShade ? capitalizeText(selectedShade) : "…"}
                      </div>
                    </div>
                  </div>
                )}

                {!isLoading &&
                  (resultImage || resultImageBase64) &&
                  !(
                    orderedResults[0] &&
                    resultImage &&
                    orderedResults[0].output_url === resultImage
                  ) && (
                    <div
                      className="box w-[200px] h-[240px] border-black border flex-shrink-0 cursor-pointer"
                      onClick={
                        compareMode
                          ? () => toggleCompareImage(currentResultSrc)
                          : handleShowCurrentResult
                      }
                    >
                      <div className="relative mt-4">
                        <Image
                          src={currentResultSrc}
                          alt={selectedShade || "Current result"}
                          width={200}
                          height={200}
                          unoptimized
                          className={`w-full h-[180px] object-contain rounded-3xl bg-black ${
                            currentViewMode === "current-result"
                              ? "outline-5 outline-white rounded-3xl"
                              : ""
                          }`}
                        />
                        {compareMode && (
                          <SelectMark
                            checked={compareImages.includes(currentResultSrc)}
                          />
                        )}
                        <div className="label text-white text-center text-2xl mt-4 truncate px-1">
                          {selectedShade
                            ? capitalizeText(selectedShade)
                            : "Result"}
                        </div>
                      </div>
                    </div>
                  )}

                {orderedResults.map((result, index) => {
                  const isLatestThumb = index === 0 && !isLoading;
                  const isSelected =
                    (selectedPreviousResult?.id === result.id &&
                      currentViewMode === "previous-result") ||
                    (isLatestThumb &&
                      currentViewMode === "current-result" &&
                      !!resultImage);
                  const isCurrentUpload =
                    isLatestThumb &&
                    resultImage &&
                    result.output_url === resultImage;
                  const thumbSrc = isCurrentUpload
                    ? currentResultSrc
                    : result.output_url;

                  return (
                    <div
                      key={result.id}
                      className="box w-[200px] h-[240px] border-black border flex-shrink-0 cursor-pointer"
                      onClick={
                        compareMode
                          ? () => toggleCompareImage(thumbSrc)
                          : () => handlePreviousResultClick(result)
                      }
                    >
                      <div className="relative mt-4">
                        <img
                          src={thumbSrc}
                          alt={result.hairstyle_name || `Result ${index + 1}`}
                          width={200}
                          height={200}
                          className={`w-full h-[180px] object-contain rounded-3xl bg-black ${
                            isSelected
                              ? "outline-5 outline-white rounded-3xl"
                              : ""
                          }`}
                          onError={(e) => {
                            const el = e.currentTarget;
                            if (el.dataset.retried !== "1" && result.output_url) {
                              el.dataset.retried = "1";
                              const joiner = result.output_url.includes("?") ? "&" : "?";
                              el.src = `${result.output_url}${joiner}cb=${Date.now()}`;
                              return;
                            }
                            console.error(
                              "Error loading previous result image:",
                              result.output_url
                            );
                            el.src =
                              "data:image/svg+xml," +
                              encodeURIComponent(
                                `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="180"><rect fill="#222" width="100%" height="100%"/><text x="50%" y="50%" fill="#888" text-anchor="middle" dy=".3em" font-size="14">No image</text></svg>`
                              );
                          }}
                        />
                        {compareMode && (
                          <SelectMark
                            checked={compareImages.includes(thumbSrc)}
                          />
                        )}
                        <div className="label text-white text-center text-2xl mt-4 truncate px-1">
                          {capitalizeText(result.hairstyle_name)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Trailing spacer so last thrumbnail can scroll fully into view */}
                <div
                  className="box w-[200px] h-[200px] flex-shrink-0 pointer-events-none"
                  aria-hidden
                />
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
