import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Camera, ClipboardList, ExternalLink, ShieldAlert, Sparkles, Cpu } from "lucide-react";
import logo from "@/assets/fallguard-logo.png";

const FEEDBACK_URL = "https://bit.ly/KuesionerFallGuard";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background scan lines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, hsl(var(--primary)) 0px, hsl(var(--primary)) 1px, transparent 1px, transparent 4px)",
        }}
      />

      <main className="relative max-w-6xl mx-auto px-6 py-10 lg:py-14">
        {/* Hero */}
        <section className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-primary/30 rounded-full" />
            <img
              src={logo}
              alt="FallGuard CCTV logo"
              className="relative w-40 h-40 lg:w-52 lg:h-52 object-contain drop-shadow-2xl"
            />
          </div>

          <h1 className="mt-6 text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="text-primary">Fall</span>
            <span className="text-foreground">Guard</span>
          </h1>
          <p className="mt-3 text-sm lg:text-base text-muted-foreground font-mono tracking-wider uppercase">
            Real-time Fall Detection for CCTV Surveillance
          </p>

          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">YOLO + MediaPipe Pipeline</span>
          </div>
        </section>

        {/* Description */}
        <section className="mt-10 space-y-4 max-w-3xl mx-auto text-sm lg:text-base text-foreground/90 leading-relaxed">
          <p>
            <span className="font-semibold text-primary">FallGuard</span> merupakan prototipe sistem pemantauan CCTV berbasis{" "}
            <em>computer vision</em> yang dirancang untuk mendeteksi kejadian jatuh secara otomatis dari rekaman video kamera pengawas.
          </p>
          <p>
            Aplikasi ini memanfaatkan model <em>deep learning</em> <span className="font-semibold">YOLOv9 / YOLOv11</span> yang
            dikombinasikan dengan <span className="font-semibold">MediaPipe Pose</span> untuk mengidentifikasi postur tubuh manusia,
            sehingga sistem dapat membedakan kondisi normal dengan kejadian jatuh secara lebih akurat. Hasil deteksi divisualisasikan
            melalui <em>bounding box</em>, <em>skeleton</em>, dan label peringatan secara <em>real-time</em>.
          </p>
          <p>
            Pengembangan aplikasi ini bertujuan untuk menyediakan antarmuka pemantauan multi-kamera yang ringkas dan informatif,
            sekaligus mendukung penelitian serta evaluasi performa model deteksi jatuh berbasis citra digital, khususnya bagi
            pengawasan lansia maupun area publik.
          </p>
        </section>

        {/* Feedback */}
        <section className="mt-8 max-w-3xl mx-auto">
          <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            Formulir Evaluasi
          </h2>
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 underline underline-offset-4 break-all"
          >
            {FEEDBACK_URL}
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          </a>
        </section>

        {/* How to use */}
        <section className="mt-10 max-w-3xl mx-auto">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Cara Menggunakan Aplikasi
          </h2>
          <ol className="space-y-4">
            <li className="flex gap-4 p-4 rounded-lg bg-card/50 border border-border">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary">
                1
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">Live Monitoring</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Pengguna dapat mengunggah video pada salah satu dari empat slot kamera CCTV. Sistem akan memproses
                  video dan menampilkan hasil deteksi jatuh beserta statistik inferensi (YOLO &amp; Pose).
                </p>
              </div>
            </li>
            <li className="flex gap-4 p-4 rounded-lg bg-card/50 border border-border">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary">
                2
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">GPU Monitor</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Halaman pemantauan penggunaan GPU dan memori untuk melihat performa hardware selama proses inferensi
                  model deteksi jatuh berlangsung.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Navigation buttons */}
        <section className="mt-10 flex flex-col sm:flex-row items-stretch justify-between gap-3 max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/gpu-monitor")}
            className="group flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-card/80 transition-all"
          >
            <Cpu className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">GPU Monitor</span>
          </button>

          <button
            onClick={() => navigate("/monitoring")}
            className="group flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Camera className="w-4 h-4" />
            <span className="text-sm font-semibold">Live Monitoring</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </section>

        <footer className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-[10px] font-mono text-muted-foreground/60 tracking-wider uppercase flex items-center justify-center gap-2">
            <ShieldAlert className="w-3 h-3" />
            FallGuard Surveillance System · Skripsi Prototype
            <BarChart3 className="w-3 h-3" />
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
