import { ScrollArea } from "@/components/ui/scroll-area";
import { FileVideo, AlertTriangle, Clock, Film } from "lucide-react";
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

const DetectionLog = ({ logs }: DetectionLogProps) => {
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
              <div key={i} className="px-3 py-2.5 hover:bg-muted/30 transition-colors">
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
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default DetectionLog;
