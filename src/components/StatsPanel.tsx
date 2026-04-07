import { Clock, AlertTriangle, Cpu, Film, Activity, PersonStanding, Timer, Layers } from "lucide-react";
import type { VideoStats } from "@/lib/api";

interface StatsPanelProps {
  stats: VideoStats | null;
  modelName: string;
}

const StatsPanel = ({ stats, modelName }: StatsPanelProps) => {
  const totalPipelineMs = stats
    ? (stats.avg_yolo_ms + stats.avg_pose_ms).toFixed(2)
    : null;

  const items = [
    {
      icon: Cpu,
      label: "YOLO Inference",
      value: stats ? `${stats.avg_yolo_ms}ms` : "—",
      sub: "Object Detection",
      color: "text-primary",
    },
    {
      icon: Activity,
      label: "Pose Estimation",
      value: stats ? `${stats.avg_pose_ms}ms` : "—",
      sub: "MediaPipe Pose",
      color: "text-warning",
    },
    {
      icon: Timer,
      label: "Pipeline Total",
      value: totalPipelineMs ? `${totalPipelineMs}ms` : "—",
      sub: "YOLO + Pose",
      color: "text-info",
    },
    {
      icon: Clock,
      label: "Avg Frame Time",
      value: stats ? `${stats.avg_total_frame_ms}ms` : "—",
      sub: "End-to-end",
      color: "text-muted-foreground",
    },
    {
      icon: Film,
      label: "Processing FPS",
      value: stats ? `${stats.processing_fps}` : "—",
      sub: `${stats ? stats.processed_frames : 0}/${stats ? stats.total_frames : 0} frames`,
      color: "text-info",
    },
    {
      icon: Layers,
      label: "Model",
      value: modelName,
      sub: "Active model",
      color: "text-primary",
    },
    {
      icon: AlertTriangle,
      label: "Fall Events",
      value: stats ? stats.total_fall_events.toString() : "—",
      sub: "Total detected",
      color: stats && stats.total_fall_events > 0 ? "text-destructive" : "text-success",
    },
    {
      icon: PersonStanding,
      label: "Max Simultaneous",
      value: stats ? stats.max_fall_count.toString() : "—",
      sub: "Peak falls/frame",
      color: stats && stats.max_fall_count > 0 ? "text-destructive" : "text-success",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Pipeline breakdown header */}
      {stats && (
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Inference Pipeline Breakdown</p>
          <div className="flex items-center gap-1 h-5 rounded overflow-hidden">
            <div
              className="h-full bg-primary rounded-l flex items-center justify-center"
              style={{ width: `${(stats.avg_yolo_ms / stats.avg_total_frame_ms) * 100}%`, minWidth: 40 }}
            >
              <span className="text-[9px] font-mono text-primary-foreground font-bold">YOLO</span>
            </div>
            <div
              className="h-full bg-warning flex items-center justify-center"
              style={{ width: `${(stats.avg_pose_ms / stats.avg_total_frame_ms) * 100}%`, minWidth: 40 }}
            >
              <span className="text-[9px] font-mono text-warning-foreground font-bold">Pose</span>
            </div>
            <div
              className="h-full bg-muted rounded-r flex items-center justify-center flex-1"
            >
              <span className="text-[9px] font-mono text-muted-foreground font-bold">Other</span>
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground font-mono">
            <span>YOLO: <span className="text-primary font-semibold">{stats.avg_yolo_ms}ms</span> ({((stats.avg_yolo_ms / stats.avg_total_frame_ms) * 100).toFixed(1)}%)</span>
            <span>Pose: <span className="text-warning font-semibold">{stats.avg_pose_ms}ms</span> ({((stats.avg_pose_ms / stats.avg_total_frame_ms) * 100).toFixed(1)}%)</span>
            <span>Other: <span className="font-semibold">{(stats.avg_total_frame_ms - stats.avg_yolo_ms - stats.avg_pose_ms).toFixed(2)}ms</span></span>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((stat) => (
          <div key={stat.label} className="stat-card flex items-center gap-3">
            <div className={`p-2 rounded-md bg-muted ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              <p className="text-sm font-semibold font-mono">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsPanel;
