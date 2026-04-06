import { useRef } from "react";
import { Upload, Video, Download, Play } from "lucide-react";
import type { VideoStats } from "@/lib/api";

interface CameraFeedProps {
  id: string;
  label: string;
  onVideoUpload: (file: File) => void;
  isProcessing: boolean;
  resultVideoUrl: string | null;
  stats: VideoStats | null;
  progress?: string;
}

const CameraFeed = ({ id, label, onVideoUpload, isProcessing, resultVideoUrl, stats, progress }: CameraFeedProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      onVideoUpload(file);
    }
  };

  return (
    <div className="camera-grid-item flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Video className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          {isProcessing && (
            <span className="status-badge bg-warning/10 text-warning">
              <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse-dot" />
              Processing
            </span>
          )}
          {stats && !isProcessing && (
            <span className="status-badge bg-success/10 text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Done
            </span>
          )}
        </div>
      </div>

      <div
        className="relative flex-1 min-h-[240px] bg-background/50 cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !resultVideoUrl && !isProcessing && fileInputRef.current?.click()}
      >
        {resultVideoUrl ? (
          <video
            src={resultVideoUrl}
            controls
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />
        ) : isProcessing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-primary">Menganalisis video...</span>
            {progress && <span className="text-xs text-muted-foreground font-mono">{progress}</span>}
            <p className="text-[10px] text-muted-foreground">Proses ini bisa memakan waktu beberapa menit</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Upload className="w-8 h-8" />
            <div className="text-center">
              <p className="text-sm font-medium">Drop video atau klik untuk upload</p>
              <p className="text-xs mt-1">Supports MP4, AVI, MOV, MKV</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="px-3 py-2 border-t border-border bg-muted/30 grid grid-cols-3 gap-2 text-[10px] font-mono text-muted-foreground">
          <div>
            <span className="text-foreground font-semibold">{stats.total_fall_events}</span> fall events
          </div>
          <div>
            <span className="text-foreground font-semibold">{stats.avg_yolo_ms}</span>ms YOLO
          </div>
          <div>
            <span className="text-foreground font-semibold">{stats.processing_fps}</span> FPS
          </div>
        </div>
      )}

      {/* Action buttons when result is ready */}
      {resultVideoUrl && (
        <div className="px-3 py-2 border-t border-border flex items-center gap-2">
          <a
            href={resultVideoUrl}
            download
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="w-3 h-3" />
            Download
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
          >
            <Upload className="w-3 h-3" />
            Upload Baru
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onVideoUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default CameraFeed;
