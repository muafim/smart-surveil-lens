import { Activity, Settings, Wifi, WifiOff, BarChart3, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  apiConnected: boolean;
  onSettingsClick: () => void;
}

const Header = ({ apiConnected, onSettingsClick }: HeaderProps) => {
  const navigate = useNavigate();
  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Dashboard"
        >
          <Home className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold tracking-tight">
            <span className="text-primary">Fall</span>
            <span className="text-foreground">Guard</span>
          </h1>
        </div>
        <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
          YOLO + MediaPipe
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {apiConnected ? (
            <Wifi className="w-4 h-4 text-success" />
          ) : (
            <WifiOff className="w-4 h-4 text-destructive" />
          )}
          <span className={`status-badge ${apiConnected ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${apiConnected ? 'bg-success animate-pulse-dot' : 'bg-destructive'}`} />
            {apiConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <button
          onClick={() => navigate("/gpu-monitor")}
          className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="GPU Monitor"
        >
          <BarChart3 className="w-4 h-4" />
        </button>
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
