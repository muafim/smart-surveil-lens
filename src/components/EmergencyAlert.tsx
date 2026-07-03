import { useEffect, useState } from "react";
import { AlertTriangle, X, Phone, HeartPulse, Users, Volume2 } from "lucide-react";

interface EmergencyAlertProps {
  fallEvents: number;
  cameraLabel: string;
  timestamp: Date;
  onDismiss: () => void;
}

const EmergencyAlert = ({ fallEvents, cameraLabel, timestamp, onDismiss }: EmergencyAlertProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Repeating siren-like alert
    try {
      const ctx = new AudioContext();
      const playBeep = (freq: number, when: number, dur = 0.25) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.value = freq;
        gain.gain.value = 0.18;
        osc.start(ctx.currentTime + when);
        osc.stop(ctx.currentTime + when + dur);
      };
      for (let i = 0; i < 3; i++) {
        playBeep(880, i * 0.7);
        playBeep(1200, i * 0.7 + 0.3);
      }
    } catch {
      // ignore
    }
  }, []);

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/25 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="relative bg-card border-2 border-destructive rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Pulsing top bar */}
        <div className="h-1.5 bg-destructive animate-pulse" />

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-destructive/15 rounded-full animate-pulse">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-destructive">FALL DETECTED</h2>
                  <Volume2 className="w-4 h-4 text-destructive animate-pulse" />
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Segera lakukan penanganan darurat
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Detection Info */}
          <div className="bg-muted/40 border border-border rounded-lg p-3 mb-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Lokasi</span>
              <span className="font-semibold text-foreground">{cameraLabel}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Waktu Deteksi</span>
              <span className="font-mono font-semibold text-foreground">
                {timestamp.toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Action Steps */}
          <div className="space-y-2 mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Langkah Penanganan
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-2.5 rounded-md bg-destructive/5 border border-destructive/20">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-destructive" />
                    <p className="text-xs font-semibold">Datangi lokasi segera</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Periksa kondisi korban di {cameraLabel}. Jangan langsung memindahkan korban.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-md bg-destructive/5 border border-destructive/20">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-destructive" />
                    <p className="text-xs font-semibold">Cek kesadaran & pernapasan</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Tanyakan respons. Jika tidak sadar, periksa nadi & napas — siapkan CPR jika perlu.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-md bg-destructive/5 border border-destructive/20">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-destructive" />
                    <p className="text-xs font-semibold">Hubungi bantuan medis</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Telepon ambulans <span className="font-mono font-bold">119</span> atau layanan darurat setempat.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick call buttons */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:119"
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-md bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Phone className="w-4 h-4" />
              Tangani
            </a>
            <button
              onClick={handleClose}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-md bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 transition-colors"
            >
              Tutup Peringatan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlert;
