import { useState, useCallback } from "react";
import Header from "@/components/Header";
import StatsPanel from "@/components/StatsPanel";
import CameraFeed from "@/components/CameraFeed";
import DetectionLog from "@/components/DetectionLog";
import ModelSelector from "@/components/ModelSelector";
import SettingsDialog from "@/components/SettingsDialog";
import type { Detection, PredictResponse } from "@/lib/api";
import { predict } from "@/lib/api";
import type { LogEntry } from "@/components/DetectionLog";

const DEFAULT_MODELS = ["yolov9m", "yolov11m"];

const CAMERAS = [
  { id: "cam1", label: "Camera 1 — Front Entrance" },
  { id: "cam2", label: "Camera 2 — Hallway" },
  { id: "cam3", label: "Camera 3 — Living Room" },
  { id: "cam4", label: "Camera 4 — Staircase" },
];

const Index = () => {
  const [apiConnected, setApiConnected] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS[0]);
  const [cameraImages, setCameraImages] = useState<Record<string, string | null>>({});
  const [cameraDetections, setCameraDetections] = useState<Record<string, Detection[]>>({});
  const [processingCameras, setProcessingCameras] = useState<Record<string, boolean>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lastResult, setLastResult] = useState<PredictResponse | null>(null);

  const handleImageUpload = useCallback(
    async (camId: string, file: File) => {
      const url = URL.createObjectURL(file);
      setCameraImages((prev) => ({ ...prev, [camId]: url }));
      setCameraDetections((prev) => ({ ...prev, [camId]: [] }));
      setProcessingCameras((prev) => ({ ...prev, [camId]: true }));

      try {
        const result = await predict(file, selectedModel);
        setCameraDetections((prev) => ({ ...prev, [camId]: result.detections }));
        setLastResult(result);

        const logEntry = {
          timestamp: new Date(),
          model: result.model,
          inferenceTime: result.inference_time_sec,
          detections: result.detections,
        };
        setLogs((prev) => [logEntry, ...prev].slice(0, 50));

        // Save inference data for GPU Monitor page
        const inferenceRecord = {
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          model: result.model,
          inferenceMs: Math.round(result.inference_time_sec * 1000),
          detections: result.num_detections,
        };
        const stored = JSON.parse(localStorage.getItem("fallguard_inference_log") || "[]");
        const updated = [...stored, inferenceRecord].slice(-100);
        localStorage.setItem("fallguard_inference_log", JSON.stringify(updated));
        window.dispatchEvent(new Event("inference-logged"));
        setApiConnected(true);
      } catch (err) {
        console.error("Prediction error:", err);
      } finally {
        setProcessingCameras((prev) => ({ ...prev, [camId]: false }));
      }
    },
    [selectedModel]
  );

  const totalDetections = lastResult?.num_detections ?? 0;
  const fallDetections = lastResult?.detections.filter(
    (d) => d.label.toLowerCase().includes("fall")
  ).length ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header apiConnected={apiConnected} onSettingsClick={() => setSettingsOpen(true)} />

      <main className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ModelSelector
            models={DEFAULT_MODELS}
            selected={selectedModel}
            onChange={setSelectedModel}
          />
          <div className="text-xs text-muted-foreground font-mono">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Stats */}
        <StatsPanel
          inferenceTime={lastResult?.inference_time_sec ?? null}
          totalDetections={totalDetections}
          fallDetections={fallDetections}
          modelName={lastResult?.model ?? selectedModel}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Camera Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            {CAMERAS.map((cam) => (
              <CameraFeed
                key={cam.id}
                id={cam.id}
                label={cam.label}
                onImageUpload={(file) => handleImageUpload(cam.id, file)}
                detections={cameraDetections[cam.id] || []}
                isProcessing={processingCameras[cam.id] || false}
                imageUrl={cameraImages[cam.id] || null}
              />
            ))}
          </div>

          {/* Detection Log */}
          <div className="lg:col-span-1">
            <DetectionLog logs={logs} />
          </div>
        </div>
      </main>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onConnectionChange={setApiConnected}
      />
    </div>
  );
};

export default Index;
