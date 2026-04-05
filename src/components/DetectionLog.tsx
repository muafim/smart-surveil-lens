import { AlertTriangle, User, Eye } from "lucide-react";
import type { Detection } from "@/lib/api";

interface LogEntry {
  timestamp: Date;
  model: string;
  inferenceTime: number;
  detections: Detection[];
}

interface DetectionLogProps {
  logs: LogEntry[];
}

function getIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("fall")) return AlertTriangle;
  if (l === "person") return User;
  return Eye;
}

const DetectionLog = ({ logs }: DetectionLogProps) => {
  return (
    <div className="bg-card border border-border rounded-lg flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          Detection Log
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[400px]">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No detections yet
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log, i) => (
              <div key={i} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-muted-foreground">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {log.model} · {(log.inferenceTime * 1000).toFixed(0)}ms
                  </span>
                </div>
                <div className="space-y-1">
                  {log.detections.map((det, j) => {
                    const Icon = getIcon(det.label);
                    const isFall = det.label.toLowerCase().includes("fall");
                    return (
                      <div
                        key={j}
                        className={`flex items-center gap-2 text-xs rounded px-2 py-1 ${
                          isFall ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-foreground"
                        }`}
                      >
                        <Icon className="w-3 h-3 flex-shrink-0" />
                        <span className="font-medium">{det.label}</span>
                        <span className="font-mono ml-auto">{(det.confidence * 100).toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectionLog;
export type { LogEntry };
