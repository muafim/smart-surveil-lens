import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Cpu, Thermometer, HardDrive, Clock, BarChart3, RefreshCw, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getApiUrl } from "@/lib/api";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface GpuStats {
  gpu_name: string;
  gpu_utilization: number;
  memory_used_mb: number;
  memory_total_mb: number;
  memory_utilization: number;
  temperature_c: number;
  power_draw_w: number;
  power_limit_w: number;
}

interface GpuHistoryPoint {
  time: string;
  gpu: number;
  vram: number;
  temp: number;
  power: number;
}

interface InferenceRecord {
  time: string;
  model: string;
  inferenceMs: number;
  detections: number;
}

const GpuMonitor = () => {
  const navigate = useNavigate();
  const [gpuStats, setGpuStats] = useState<GpuStats | null>(null);
  const [gpuHistory, setGpuHistory] = useState<GpuHistoryPoint[]>([]);
  const [inferenceHistory, setInferenceHistory] = useState<InferenceRecord[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchGpuStats = useCallback(async () => {
    try {
      const res = await fetch(`${getApiUrl()}/gpu-stats`);
      if (!res.ok) throw new Error("Failed");
      const data: GpuStats = await res.json();
      setGpuStats(data);
      setIsConnected(true);
      setLastUpdated(new Date());

      const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setGpuHistory((prev) =>
        [
          ...prev,
          {
            time: now,
            gpu: data.gpu_utilization,
            vram: data.memory_utilization,
            temp: data.temperature_c,
            power: data.power_draw_w,
          },
        ].slice(-30)
      );
    } catch {
      setIsConnected(false);
    }
  }, []);

  // Load inference history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("fallguard_inference_log");
    if (stored) {
      try {
        setInferenceHistory(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  // Listen for new inference results via storage event + custom event
  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem("fallguard_inference_log");
      if (stored) {
        try {
          setInferenceHistory(JSON.parse(stored));
        } catch { /* ignore */ }
      }
    };
    window.addEventListener("storage", handler);
    window.addEventListener("inference-logged", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("inference-logged", handler);
    };
  }, []);

  useEffect(() => {
    fetchGpuStats();
    if (!autoRefresh) return;
    const interval = setInterval(fetchGpuStats, 3000);
    return () => clearInterval(interval);
  }, [fetchGpuStats, autoRefresh]);

  const avgInferenceMs =
    inferenceHistory.length > 0
      ? inferenceHistory.reduce((s, r) => s + r.inferenceMs, 0) / inferenceHistory.length
      : 0;

  const totalDetections = inferenceHistory.reduce((s, r) => s + r.detections, 0);

  const getTemperatureColor = (temp: number) => {
    if (temp < 50) return "text-success";
    if (temp < 75) return "text-warning";
    return "text-destructive";
  };

  const getUtilizationColor = (util: number) => {
    if (util < 50) return "text-success";
    if (util < 80) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight">
              <span className="text-primary">GPU</span>
              <span className="text-foreground"> Monitor</span>
            </h1>
          </div>
          <span className={`status-badge ${isConnected ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-success animate-pulse-dot" : "bg-destructive"}`} />
            {isConnected ? "GPU Connected" : "No GPU Data"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground font-mono">
              Update: {lastUpdated.toLocaleTimeString("id-ID")}
            </span>
          )}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-md transition-colors ${autoRefresh ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            title={autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`} style={autoRefresh ? { animationDuration: "3s" } : {}} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-6 space-y-4">
        {/* GPU Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-muted text-primary">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">GPU Utilization</p>
                <p className={`text-xl font-bold font-mono ${gpuStats ? getUtilizationColor(gpuStats.gpu_utilization) : "text-muted-foreground"}`}>
                  {gpuStats ? `${gpuStats.gpu_utilization}%` : "—"}
                </p>
                {gpuStats && <Progress value={gpuStats.gpu_utilization} className="h-1.5 mt-1" />}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-muted text-info">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">VRAM Usage</p>
                <p className="text-xl font-bold font-mono text-info">
                  {gpuStats ? `${(gpuStats.memory_used_mb / 1024).toFixed(1)} GB` : "—"}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {gpuStats ? `/ ${(gpuStats.memory_total_mb / 1024).toFixed(1)} GB (${gpuStats.memory_utilization}%)` : ""}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-md bg-muted ${gpuStats ? getTemperatureColor(gpuStats.temperature_c) : "text-muted-foreground"}`}>
                <Thermometer className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Temperature</p>
                <p className={`text-xl font-bold font-mono ${gpuStats ? getTemperatureColor(gpuStats.temperature_c) : "text-muted-foreground"}`}>
                  {gpuStats ? `${gpuStats.temperature_c}°C` : "—"}
                </p>
                {gpuStats && <Progress value={(gpuStats.temperature_c / 100) * 100} className="h-1.5 mt-1" />}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-muted text-warning">
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Power Draw</p>
                <p className="text-xl font-bold font-mono text-warning">
                  {gpuStats ? `${gpuStats.power_draw_w}W` : "—"}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {gpuStats ? `/ ${gpuStats.power_limit_w}W limit` : ""}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* GPU Name */}
        {gpuStats && (
          <div className="text-xs text-muted-foreground font-mono bg-muted/50 rounded-md px-3 py-2 border border-border">
            🖥️ {gpuStats.gpu_name}
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* GPU Utilization Chart */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                GPU Utilization (%)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gpuHistory}>
                    <defs>
                      <linearGradient id="gpuGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: 12,
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Area type="monotone" dataKey="gpu" stroke="hsl(var(--primary))" fill="url(#gpuGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* VRAM Usage Chart */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-info" />
                VRAM Usage (%)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gpuHistory}>
                    <defs>
                      <linearGradient id="vramGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: 12,
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Area type="monotone" dataKey="vram" stroke="hsl(var(--info))" fill="url(#vramGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Temperature Chart */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-destructive" />
                Temperature (°C)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gpuHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: 12,
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Line type="monotone" dataKey="temp" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Inference Performance Chart */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" />
                Inference Time (ms)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inferenceHistory.slice(-20)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: 12,
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Bar dataKey="inferenceMs" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inference Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Inferensi</p>
              <p className="text-2xl font-bold font-mono text-primary">{inferenceHistory.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Rata-rata Inference</p>
              <p className="text-2xl font-bold font-mono text-warning">{avgInferenceMs.toFixed(0)}ms</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Deteksi</p>
              <p className="text-2xl font-bold font-mono text-info">{totalDetections}</p>
            </CardContent>
          </Card>
        </div>

        {/* Backend Hint */}
        {!isConnected && (
          <Card className="bg-muted/30 border-border border-dashed">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                ⚠️ <strong>GPU stats belum tersedia.</strong> Tambahkan endpoint <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-primary">/gpu-stats</code> di FastAPI backend Anda:
              </p>
              <pre className="mt-2 bg-background border border-border rounded-md p-3 text-xs font-mono text-foreground overflow-x-auto">
{`@app.get("/gpu-stats")
def gpu_stats():
    import subprocess, json
    result = subprocess.run(
        ["nvidia-smi", "--query-gpu=name,utilization.gpu,
         memory.used,memory.total,utilization.memory,
         temperature.gpu,power.draw,power.limit",
         "--format=csv,noheader,nounits"],
        capture_output=True, text=True
    )
    parts = result.stdout.strip().split(", ")
    return {
        "gpu_name": parts[0],
        "gpu_utilization": float(parts[1]),
        "memory_used_mb": float(parts[2]),
        "memory_total_mb": float(parts[3]),
        "memory_utilization": float(parts[4]),
        "temperature_c": float(parts[5]),
        "power_draw_w": float(parts[6]),
        "power_limit_w": float(parts[7]),
    }`}
              </pre>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default GpuMonitor;
