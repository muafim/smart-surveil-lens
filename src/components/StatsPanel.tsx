import { Clock, Eye, AlertTriangle, Cpu } from "lucide-react";

interface StatsPanelProps {
  inferenceTime: number | null;
  totalDetections: number;
  fallDetections: number;
  modelName: string;
}

const StatsPanel = ({ inferenceTime, totalDetections, fallDetections, modelName }: StatsPanelProps) => {
  const stats = [
    {
      icon: Clock,
      label: "Inference Time",
      value: inferenceTime !== null ? `${(inferenceTime * 1000).toFixed(0)}ms` : "—",
      color: "text-info",
    },
    {
      icon: Eye,
      label: "Detections",
      value: totalDetections.toString(),
      color: "text-primary",
    },
    {
      icon: AlertTriangle,
      label: "Fall Alerts",
      value: fallDetections.toString(),
      color: fallDetections > 0 ? "text-destructive" : "text-success",
    },
    {
      icon: Cpu,
      label: "Model",
      value: modelName || "—",
      color: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
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
