import { Clock, AlertTriangle, Cpu, Film, Activity, PersonStanding } from "lucide-react";
import type { VideoStats } from "@/lib/api";

interface StatsPanelProps {
  stats: VideoStats | null;
  modelName: string;
}

const StatsPanel = ({ stats, modelName }: StatsPanelProps) => {
  const items = [
    {
      icon: Clock,
      label: "Avg Frame Time",
      value: stats ? `${stats.avg_total_frame_ms}ms` : "—",
      color: "text-info",
    },
    {
      icon: Cpu,
      label: "Avg YOLO",
      value: stats ? `${stats.avg_yolo_ms}ms` : "—",
      color: "text-primary",
    },
    {
      icon: Activity,
      label: "Avg Pose",
      value: stats ? `${stats.avg_pose_ms}ms` : "—",
      color: "text-warning",
    },
    {
      icon: Film,
      label: "Processing FPS",
      value: stats ? `${stats.processing_fps}` : "—",
      color: "text-info",
    },
    {
      icon: AlertTriangle,
      label: "Fall Events",
      value: stats ? stats.total_fall_events.toString() : "—",
      color: stats && stats.total_fall_events > 0 ? "text-destructive" : "text-success",
    },
    {
      icon: PersonStanding,
      label: "Max Falls",
      value: stats ? stats.max_fall_count.toString() : "—",
      color: stats && stats.max_fall_count > 0 ? "text-destructive" : "text-success",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      {items.map((stat) => (
        <div key={stat.label} className="stat-card flex items-center gap-3">
          <div className={`p-2 rounded-md bg-muted ${stat.color}`}>
            <stat.icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-sm font-semibold font-mono">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsPanel;
