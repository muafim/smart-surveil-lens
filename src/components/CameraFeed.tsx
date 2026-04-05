import { useRef, useEffect, useState, useCallback } from "react";
import { Upload, Maximize2, Camera } from "lucide-react";
import type { Detection } from "@/lib/api";

interface CameraFeedProps {
  id: string;
  label: string;
  onImageUpload: (file: File) => void;
  detections: Detection[];
  isProcessing: boolean;
  imageUrl: string | null;
}

const LABEL_COLORS: Record<string, string> = {
  person: "#22d3ee",
  fall: "#ef4444",
  "fall detected": "#ef4444",
};

function getColor(label: string) {
  const key = label.toLowerCase();
  return LABEL_COLORS[key] || "#a78bfa";
}

const CameraFeed = ({ id, label, onImageUpload, detections, isProcessing, imageUrl }: CameraFeedProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  const drawDetections = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !imageUrl) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      canvas.width = cw;
      canvas.height = ch;

      const scale = Math.min(cw / img.width, ch / img.height);
      const dx = (cw - img.width * scale) / 2;
      const dy = (ch - img.height * scale) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, img.width * scale, img.height * scale);

      setImgSize({ w: img.width, h: img.height });

      detections.forEach((det) => {
        const [x1, y1, x2, y2] = det.bbox_xyxy;
        const color = getColor(det.label);

        const sx = x1 * scale + dx;
        const sy = y1 * scale + dy;
        const sw = (x2 - x1) * scale;
        const sh = (y2 - y1) * scale;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, sw, sh);

        const text = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        const tm = ctx.measureText(text);
        ctx.fillStyle = color;
        ctx.fillRect(sx, sy - 18, tm.width + 8, 18);
        ctx.fillStyle = "#000";
        ctx.fillText(text, sx + 4, sy - 5);
      });
    };
    img.src = imageUrl;
  }, [imageUrl, detections]);

  useEffect(() => {
    drawDetections();
  }, [drawDetections]);

  useEffect(() => {
    const handleResize = () => drawDetections();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawDetections]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onImageUpload(file);
    }
  };

  return (
    <div className="camera-grid-item flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Camera className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          {isProcessing && (
            <span className="status-badge bg-warning/10 text-warning">
              <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse-dot" />
              Processing
            </span>
          )}
          {imgSize.w > 0 && (
            <span className="text-[10px] font-mono text-muted-foreground">
              {imgSize.w}×{imgSize.h}
            </span>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 min-h-[240px] bg-background/50 cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        {imageUrl ? (
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Upload className="w-8 h-8" />
            <div className="text-center">
              <p className="text-sm font-medium">Drop image or click to upload</p>
              <p className="text-xs mt-1">Supports JPG, PNG, WEBP</p>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <div className="flex items-center gap-2 text-primary">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Analyzing...</span>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImageUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default CameraFeed;
