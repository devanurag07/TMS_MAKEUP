"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { UploadCloud, FlipHorizontal } from "lucide-react";
import { Camera as CameraIcon } from "lucide-react";
import { NORMAL_CAMERA_KEY } from "@/core/constants/common-constants";

interface CameraProps {
  isLocked: boolean;
  isCheckingAccessCode: boolean;
  onCapture: (file: File) => void;
  enableSwitch?: boolean;
  primaryCamera?: boolean;
  defaultCameraIdx?: number;
  /** When set to "normal", use the salon-assigned camera from NORMAL_CAMERA_KEY */
  cameraType?: "normal";
}

export const Camera = ({
  isLocked,
  isCheckingAccessCode,
  onCapture,
  enableSwitch = true,
  primaryCamera = false,
  defaultCameraIdx,
  cameraType,
}: CameraProps) => {
  const [isCameraReady, setIsCameraReady] = useState(true);
  const [inputFileValue, setInputFileValue] = useState<string>("");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [toogleCameraList, setToogleCameraList] = useState(false);
  const [isFlipped, setIsFlipped] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const storageKey =
    cameraType === "normal" ? NORMAL_CAMERA_KEY : "camera-selected-id";

  const setupCamera = async () => {
    try {
      const constraints = {
        video: {
          deviceId: selectedId !== "" ? { exact: selectedId } : undefined,
          facingMode: "user",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current!.play();
          setIsCameraReady(true);
          drawToCanvas();
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const drawToCanvas = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      const size = Math.min(video.videoWidth, video.videoHeight);
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;

      canvas.width = size;
      canvas.height = size;

      context?.save();
      context!.drawImage(video, startX, startY, size, size, 0, 0, canvas.width, canvas.height);
      context?.restore();
      requestAnimationFrame(drawToCanvas);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onCapture(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      onCapture(e.dataTransfer.files[0]);
    }
  };

  const handleCapture = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    if (!isFlipped) {
      tempContext!.translate(tempCanvas.width, 0);
      tempContext!.scale(-1, 1);
    }
    tempContext!.drawImage(canvas, 0, 0, canvas.width, canvas.height);

    fetch(tempCanvas.toDataURL("image/jpeg"))
      .then((res) => res.blob())
      .then((blob) => {
        onCapture(new File([blob], "camera_capture.jpg", { type: "image/jpeg" }));
      });
  };

  const listCameras = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(devices.filter((d) => d.kind === "videoinput"));
    } catch {
      console.error("Camera access denied");
    }
  };

  const selectCamera = (deviceId: string) => {
    setSelectedId(deviceId);
    localStorage.setItem(storageKey, deviceId);
  };

  useEffect(() => {
    if (!isLocked && !isCheckingAccessCode) {
      setupCamera();
    }
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [isLocked, isCheckingAccessCode, selectedId]);

  useEffect(() => {
    if (cameras.length === 0) listCameras();
  }, [cameras]);

  // Resolve which camera to use once camera list is available
  useEffect(() => {
    if (cameras.length === 0) return;

    // Explicit index override (no cameraType)
    if (defaultCameraIdx !== undefined && cameraType === undefined) {
      const target = cameras[defaultCameraIdx] ?? cameras[0];
      if (target) {
        setSelectedId(target.deviceId);
        localStorage.setItem(storageKey, target.deviceId);
      }
      return;
    }

    // Use saved assignment from settings page
    if (cameraType !== undefined) {
      const savedId = localStorage.getItem(storageKey);
      if (savedId && cameras.some((c) => c.deviceId === savedId)) {
        setSelectedId(savedId);
      }
      return;
    }

    // Legacy fallback: non-primary camera reads generic saved id
    if (!primaryCamera) {
      const savedId = localStorage.getItem("camera-selected-id");
      if (savedId && cameras.some((c) => c.deviceId === savedId)) {
        setSelectedId(savedId);
      }
    }
  }, [cameras]);

  return (
    <div
      className="rounded-lg text-center cursor-pointer relative flex items-center justify-center bg-black"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        onChange={handleFileInputChange}
        className="hidden"
        id="image-upload"
        accept="image/*"
        value={inputFileValue}
      />
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover rounded-lg ${isFlipped ? "scale-x-[-1]" : ""}`}
        style={{ display: isCameraReady ? "block" : "none" }}
      />
      {!isCameraReady && <div className="text-white">Loading camera...</div>}

      {/* Shutter button */}
      {isCameraReady && (
        <div className="absolute z-[1000] bottom-[5vh] left-1/2 -translate-x-1/2 w-[120px] h-[120px] bg-white/20 rounded-full flex items-center justify-center">
          <button
            onClick={handleCapture}
            className="w-[100px] h-[100px] bg-white rounded-full cursor-pointer"
          />
        </div>
      )}

      {/* Camera switch (bottom-left) */}
      <div className="absolute bottom-[2vh] left-[2vw] bg-black text-white rounded-full p-2 z-40">
        {enableSwitch && (
          <CameraIcon
            onClick={() => { listCameras(); setToogleCameraList(!toogleCameraList); }}
            className="w-[80px] h-[80px] max-w-[100px] max-h-[100px]"
          />
        )}
        <Dialog open={toogleCameraList} onOpenChange={setToogleCameraList}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Select Camera</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2 text-white">
              {cameras.length === 0 ? (
                <p>No cameras detected</p>
              ) : (
                cameras.map((c, idx) => (
                  <button
                    key={c.deviceId}
                    onClick={() => selectCamera(c.deviceId)}
                    className={`p-2 rounded ${selectedId === c.deviceId
                        ? "bg-white text-black"
                        : "bg-black text-white border-2 border-white"
                      }`}
                  >
                    {c.label || `Camera ${idx + 1}`}
                  </button>
                ))
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => { setToogleCameraList(false); setupCamera(); }}>
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upload (top-right) */}
      <div className="absolute top-[2vh] right-[2vw] bg-black text-white rounded-full p-2 z-40">
        <UploadCloud
          onClick={() => document.getElementById("image-upload")?.click()}
          className="w-[80px] h-[80px] max-w-[100px] max-h-[100px]"
        />
      </div>

      {/* Flip (bottom-right) */}
      <div
        className={`absolute bottom-[2vh] right-[2vw] text-white rounded-full p-2 z-40 transition-colors duration-200 ${isFlipped ? "bg-blue-600" : "bg-gray-800"
          }`}
      >
        <FlipHorizontal
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-[60px] h-[60px] max-w-[80px] max-h-[80px] cursor-pointer hover:opacity-80 transition-opacity"
        />
      </div>
    </div>
  );
};
