import { useState, useCallback } from "react";
import Header from "@/components/Header";
import StatsPanel from "@/components/StatsPanel";
import CameraFeed from "@/components/CameraFeed";
import DetectionLog from "@/components/DetectionLog";
import SettingsDialog from "@/components/SettingsDialog";
import EmergencyAlert from "@/components/EmergencyAlert";
import type { VideoStats, PredictVideoResponse } from "@/lib/api";
import { predictVideo, getDownloadUrl } from "@/lib/api";
import type { LogEntry } from "@/components/DetectionLog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const MODEL_NAME = "best";
const CAMERA_ID = "main";
const CAMERA_LABEL = "Camera Feed";

interface AlertData {
  id: string;
  fallEvents: number;
  cameraLabel: string;
  timestamp: Date;
}

const Index = () => {
  const [apiConnected, setApiConnected] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeAlert, setActiveAlert] = useState<AlertData | null>(null);

  const handleVideoUpload = useCallback(
    async (file: File) => {
      const oUrl = URL.createObjectURL(file);
      setOriginalUrl(oUrl);
      setResultUrl(null);
      setStats(null);
      setIsProcessing(true);

      try {
        const result: PredictVideoResponse = await predictVideo(file, MODEL_NAME);
        const downloadUrl = getDownloadUrl(result.file_id);
        const videoBlob = await fetch(downloadUrl).then((r) => r.blob());
        const videoBlobUrl = URL.createObjectURL(videoBlob);
        setResultUrl(videoBlobUrl);
        setStats(result.stats);

        const detectedAt = new Date();

        if (result.stats.total_fall_events > 0) {
          setActiveAlert({
            id: `${CAMERA_ID}-${Date.now()}`,
            fallEvents: result.stats.total_fall_events,
            cameraLabel: CAMERA_LABEL,
            timestamp: detectedAt,
          });
        }

        const logEntry: LogEntry = {
          timestamp: detectedAt,
          model: result.model,
          cameraLabel: CAMERA_LABEL,
          fileId: result.file_id,
          stats: result.stats,
        };
        setLogs((prev) => [logEntry, ...prev].slice(0, 50));

        const inferenceRecord = {
          time: detectedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
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
        setIsProcessing(false);
      }
    },
    []
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header apiConnected={apiConnected} onSettingsClick={() => setSettingsOpen(true)} />

      {activeAlert && (
        <EmergencyAlert
          fallEvents={activeAlert.fallEvents}
          cameraLabel={activeAlert.cameraLabel}
          timestamp={activeAlert.timestamp}
          onDismiss={() => setActiveAlert(null)}
        />
      )}

      <main className="flex-1 p-4 lg:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="bbox-toggle"
              checked={useBoundingBox}
              onCheckedChange={setUseBoundingBox}
            />
            <Label htmlFor="bbox-toggle" className="text-xs font-medium cursor-pointer">
              Bounding Box
            </Label>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <StatsPanel stats={stats} modelName={MODEL_NAME} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <CameraFeed
              id={CAMERA_ID}
              label={CAMERA_LABEL}
              onVideoUpload={handleVideoUpload}
              isProcessing={isProcessing}
              resultVideoUrl={resultUrl}
              originalVideoUrl={originalUrl}
              stats={stats}
            />
          </div>
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
