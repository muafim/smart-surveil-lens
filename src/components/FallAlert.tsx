import { useEffect, useState } from "react";
import { AlertTriangle, X, Volume2 } from "lucide-react";

interface FallAlertProps {
  fallEvents: number;
  cameraLabel: string;
  onDismiss: () => void;
}

const FallAlert = ({ fallEvents, cameraLabel, onDismiss }: FallAlertProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Play alert sound
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "square";
      gain.gain.value = 0.15;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1100;
        osc2.type = "square";
        gain2.gain.value = 0.15;
        osc2.start();
        osc2.stop(ctx.currentTime + 0.4);
      }, 350);
    } catch {
      // Audio not supported
    }

    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div className="fixed top-16 right-4 z-50 animate-in slide-in-from-right-5 fade-in duration-300">
      <div className="bg-destructive text-destructive-foreground rounded-lg shadow-2xl border border-destructive/50 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-destructive-foreground/20 rounded-full animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm">⚠ FALL DETECTED</h4>
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <p className="text-xs mt-1 opacity-90">
              {fallEvents} fall event{fallEvents > 1 ? "s" : ""} terdeteksi pada <span className="font-semibold">{cameraLabel}</span>
            </p>
            <p className="text-[10px] mt-1 opacity-70">
              {new Date().toLocaleTimeString("id-ID")}
            </p>
          </div>
          <button
            onClick={() => { setVisible(false); onDismiss(); }}
            className="p-1 rounded hover:bg-destructive-foreground/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FallAlert;
