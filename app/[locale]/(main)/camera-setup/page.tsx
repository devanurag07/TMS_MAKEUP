"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { NORMAL_CAMERA_KEY } from "@/core/constants/common-constants";

type CameraDevice = MediaDeviceInfo;

export default function CameraSetupPage() {
  const router = useRouter();

  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [normalId, setNormalId] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const loadCameras = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      setCameras(videoInputs);

      const savedNormal = localStorage.getItem(NORMAL_CAMERA_KEY) ?? "";

      setNormalId(
        savedNormal && videoInputs.some((c) => c.deviceId === savedNormal)
          ? savedNormal
          : videoInputs[0]?.deviceId ?? ""
      );
    } catch {
      console.error("Camera permission denied");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCameras();
  }, []);

  const handleSave = () => {
    localStorage.setItem(NORMAL_CAMERA_KEY, normalId);
    setSaved(true);
    setTimeout(() => router.push("/"), 1200);
  };

  return (
    <div className="flex min-h-full flex-col bg-black text-white">
      <header className="flex items-center gap-6 px-10 pt-12 pb-10 border-b border-white/15 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-20 h-20 rounded-full border-2 border-white/20 hover:border-white/50 hover:bg-white/10 transition-colors shrink-0"
        >
          <ArrowLeft size={40} />
        </button>
        <div>
          <h1 className="text-6xl font-bold tracking-tight">Camera Settings</h1>
          <p className="text-white/50 text-2xl mt-2">
            Choose the camera used for makeup try-on
          </p>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-10 px-10 py-10 max-w-4xl w-full mx-auto overflow-y-auto">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-white/50">
            <RefreshCw size={72} className="animate-spin" />
            <p className="text-4xl">Detecting cameras…</p>
          </div>
        ) : cameras.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-white/40">
            <Camera size={96} />
            <p className="text-4xl text-center leading-snug">
              No cameras detected.
              <br />
              Please connect a camera and try again.
            </p>
            <button
              onClick={loadCameras}
              className="mt-4 flex items-center gap-3 rounded-full border-2 border-white/30 hover:border-white/60 hover:bg-white/10 px-10 py-5 text-2xl font-medium text-white/70 hover:text-white transition-colors"
            >
              <RefreshCw size={32} />
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-3xl border border-white/20 bg-white/5 px-8 py-6 flex items-start justify-between gap-6">
              <p className="text-white/60 text-2xl leading-relaxed">
                Connect your camera before assigning. Refresh if a newly
                attached camera isn&apos;t showing up.
              </p>
              <button
                onClick={loadCameras}
                className="shrink-0 flex items-center gap-3 rounded-full border border-white/25 hover:border-white/50 hover:bg-white/10 px-6 py-3 text-xl font-medium text-white/60 hover:text-white transition-colors"
              >
                <RefreshCw size={24} />
                Refresh
              </button>
            </div>

            <CameraSelector
              icon={<Camera size={52} className="text-white" />}
              title="Camera"
              description="Makeup Try-On"
              cameras={cameras}
              selectedId={normalId}
              onSelect={setNormalId}
              isOpen={openDropdown}
              onToggle={() => setOpenDropdown((prev) => !prev)}
            />

            <div className="rounded-3xl border border-white/15 bg-white/[0.03] px-8 py-7">
              <p className="text-white/40 text-lg mb-5 uppercase tracking-widest font-semibold">
                Detected cameras — {cameras.length} found
              </p>
              <div className="flex flex-col gap-3">
                {cameras.map((cam, idx) => (
                  <div
                    key={cam.deviceId}
                    className="flex items-center gap-5 text-white/60"
                  >
                    <span className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-lg font-bold text-white/50 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate text-2xl">
                      {cam.label || `Camera ${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!normalId || saved}
              className={`flex items-center justify-center gap-4 rounded-3xl py-8 text-3xl font-bold tracking-wide transition-all duration-300 ${
                saved
                  ? "bg-white text-black"
                  : "bg-white text-black hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed"
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle2 size={40} />
                  Saved — returning home…
                </>
              ) : (
                "Save Camera Assignment"
              )}
            </button>
          </>
        )}
      </main>
    </div>
  );
}

interface CameraSelectorProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  cameras: CameraDevice[];
  selectedId: string;
  onSelect: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function CameraSelector({
  icon,
  title,
  description,
  cameras,
  selectedId,
  onSelect,
  isOpen,
  onToggle,
}: CameraSelectorProps) {
  const selectedCam = cameras.find((c) => c.deviceId === selectedId);
  const selectedLabel =
    selectedCam?.label ||
    (selectedCam ? `Camera ${cameras.indexOf(selectedCam) + 1}` : "Select…");

  return (
    <div className="rounded-3xl border border-white/20 bg-white/[0.04] overflow-hidden">
      <div className="flex items-center gap-6 px-8 py-7">
        <div className="w-20 h-20 rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-4xl font-bold text-white">{title}</h2>
          <p className="text-white/45 text-2xl mt-1">{description}</p>
        </div>
      </div>

      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-8 py-6 bg-white/[0.06] hover:bg-white/10 transition-colors border-t border-white/10"
      >
        <span className="text-2xl font-semibold text-white truncate">
          {selectedLabel}
        </span>
        <ChevronDown
          size={36}
          className={`shrink-0 text-white/50 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2 px-5 py-4 border-t border-white/10 bg-black/60">
          {cameras.map((cam, idx) => {
            const label = cam.label || `Camera ${idx + 1}`;
            const isSelected = cam.deviceId === selectedId;
            return (
              <button
                key={cam.deviceId}
                onClick={() => {
                  onSelect(cam.deviceId);
                  onToggle();
                }}
                className={`flex items-center gap-4 rounded-2xl px-6 py-5 text-2xl text-left font-medium transition-colors ${
                  isSelected
                    ? "bg-white text-black"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isSelected ? (
                  <CheckCircle2 size={28} className="shrink-0" />
                ) : (
                  <span className="w-7 h-7 rounded-full border border-white/25 shrink-0" />
                )}
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
