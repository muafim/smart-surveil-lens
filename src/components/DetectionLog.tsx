import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileVideo, AlertTriangle, Clock, Film, Activity, Gauge, Users, Layers } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { VideoStats } from "@/lib/api";

export interface LogEntry {
  timestamp: Date;
  model: string;
  cameraLabel: string;
  fileId: string;
  stats: VideoStats;
}

interface DetectionLogProps {
  logs: LogEntry[];
}

const StatRow = ({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: "primary" | "destructive" | "default";
}) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/30 border border-border">
    <div className="flex items-center gap-2">
      <Icon
        className={`w-3.5 h-3.5 ${
          accent === "primary"
            ? "text-primary"
            : accent === "destructive"
            ? "text-destructive"
            : "text-muted-foreground"
        }`}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <span
      className={`text-xs font-mono font-semibold ${
        accent === "destructive" ? "text-destructive" : "text-foreground"
      }`}
    >
      {value}
    </span>
  </div>
);

const DetectionLog = ({ logs }: DetectionLogProps) => {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  return (
    <div className="camera-grid-item flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <FileVideo className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium">Processing Log</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{logs.length} entries</span>
      </div>

      <ScrollArea className="flex-1 min-h-[200px] max-h-[500px]">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <FileVideo className="w-6 h-6 mb-2" />
            <p className="text-xs">Belum ada video yang diproses</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log, i) => (
              <button
                key={i}
                onClick={() => setSelectedLog(log)}
                className="w-full text-left px-3 py-2.5 hover:bg-muted/40 transition-colors focus:outline-none focus:bg-muted/40"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{log.cameraLabel}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {log.timestamp.toLocaleTimeString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                  <span className="text-primary">{log.model}</span>
                  <span className="flex items-center gap-1">
                    <Film className="w-3 h-3" />
                    {log.stats.processed_frames}/{log.stats.total_frames} frames
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {log.stats.avg_yolo_ms}ms
                  </span>
                  {log.stats.total_fall_events > 0 && (
                    <span className="flex items-center gap-1 text-destructive font-semibold">
                      <AlertTriangle className="w-3 h-3" />
                      {log.stats.total_fall_events} falls
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileVideo className="w-4 h-4 text-primary" />
              {selectedLog?.cameraLabel}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {selectedLog?.model} · {selectedLog?.timestamp.toLocaleString("id-ID")}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-2">
                Inference Pipeline
              </div>
              <StatRow
                icon={Activity}
                label="YOLO Inference"
                value={`${selectedLog.stats.avg_yolo_ms} ms`}
                accent="primary"
              />
              <StatRow
                icon={Activity}
                label="Pose Estimation"
                value={`${selectedLog.stats.avg_pose_ms} ms`}
                accent="primary"
              />
              <StatRow
                icon={Layers}
                label="Pipeline Total / Frame"
                value={`${selectedLog.stats.avg_total_frame_ms} ms`}
              />

              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-3">
                Performance
              </div>
              <StatRow
                icon={Gauge}
                label="Processing FPS"
                value={selectedLog.stats.processing_fps}
                accent="primary"
              />
              <StatRow
                icon={Film}
                label="Frames Processed"
                value={`${selectedLog.stats.processed_frames} / ${selectedLog.stats.total_frames}`}
              />

              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-3">
                Detection Results
              </div>
              <StatRow
                icon={AlertTriangle}
                label="Total Fall Events"
                value={selectedLog.stats.total_fall_events}
                accent={selectedLog.stats.total_fall_events > 0 ? "destructive" : "default"}
              />
              <StatRow
                icon={Users}
                label="Max Simultaneous Falls"
                value={selectedLog.stats.max_fall_count}
                accent={selectedLog.stats.max_fall_count > 0 ? "destructive" : "default"}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetectionLog;
