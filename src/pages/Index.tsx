import { useState, useCallback } from "react";
import Header from "@/components/Header";
import StatsPanel from "@/components/StatsPanel";
import CameraFeed from "@/components/CameraFeed";
import DetectionLog from "@/components/DetectionLog";
import ModelSelector from "@/components/ModelSelector";
import SettingsDialog from "@/components/SettingsDialog";
import type { VideoStats, PredictVideoResponse } from "@/lib/api";
import { predictVideo, getDownloadUrl } from "@/lib/api";
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
  const [cameraResults, setCameraResults] = useState<Record<string, string | null>>({});
  const [cameraOriginals, setCameraOriginals] = useState<Record<string, string | null>>({});
  const [cameraStats, setCameraStats] = useState<Record<string, VideoStats | null>>({});
  const [processingCameras, setProcessingCameras] = useState<Record<string, boolean>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lastStats, setLastStats] = useState<VideoStats | null>(null);

  const handleVideoUpload = useCallback(
    async (camId: string, file: File) => {
      const originalUrl = URL.createObjectURL(file);
      setCameraOriginals((prev) => ({ ...prev, [camId]: originalUrl }));
      setCameraResults((prev) => ({ ...prev, [camId]: null }));
      setCameraStats((prev) => ({ ...prev, [camId]: null }));
      setProcessingCameras((prev) => ({ ...prev, [camId]: true }));

      try {
        const result: PredictVideoResponse = await predictVideo(file, selectedModel);
        const videoUrl = getDownloadUrl(result.file_id);
        setCameraResults((prev) => ({ ...prev, [camId]: videoUrl }));
        setCameraStats((prev) => ({ ...prev, [camId]: result.stats }));
        setLastStats(result.stats);

        const camLabel = CAMERAS.find((c) => c.id === camId)?.label || camId;
        const logEntry: LogEntry = {
          timestamp: new Date(),
          model: result.model,
          cameraLabel: camLabel,
          fileId: result.file_id,
          stats: result.stats,
        };
        setLogs((prev) => [logEntry, ...prev].slice(0, 50));

        // Save for GPU Monitor page
        const inferenceRecord = {
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          model: result.model,
          inferenceMs: result.stats.avg_yolo_ms,
          detections: result.stats.total_fall_events,
        };
        const stored = JSON.parse(localStorage.getItem("fallguard_inference_log") || "[]");
        const updated = [...stored, inferenceRecord].slice(-100);
        localStorage.setItem("fallguard_inference_log", JSON.stringify(updated));
        window.dispatchEvent(new Event("inference-logged"));
        setApiConnected(true);
      } catch (err) {
        console.error("Video prediction error:", err);
      } finally {
        setProcessingCameras((prev) => ({ ...prev, [camId]: false }));
      }
    },
    [selectedModel]
  );

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
        <StatsPanel stats={lastStats} modelName={selectedModel} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Camera Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            {CAMERAS.map((cam) => (
              <CameraFeed
                key={cam.id}
                id={cam.id}
                label={cam.label}
                onVideoUpload={(file) => handleVideoUpload(cam.id, file)}
                isProcessing={processingCameras[cam.id] || false}
                resultVideoUrl={cameraResults[cam.id] || null}
                originalVideoUrl={cameraOriginals[cam.id] || null}
                stats={cameraStats[cam.id] || null}
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
