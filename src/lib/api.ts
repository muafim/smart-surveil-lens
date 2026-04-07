const DEFAULT_API_URL = "http://localhost:8000";

export function getApiUrl(): string {
  return localStorage.getItem("yolo_api_url") || DEFAULT_API_URL;
}

export function setApiUrl(url: string) {
  localStorage.setItem("yolo_api_url", url);
}

export interface VideoStats {
  total_frames: number;
  processed_frames: number;
  avg_total_frame_ms: number;
  avg_yolo_ms: number;
  avg_pose_ms: number;
  processing_fps: number;
  total_fall_events: number;
  max_fall_count: number;
}

export interface PredictVideoResponse {
  message: string;
  model: string;
  file_id: string;
  download_url: string;
  stats: VideoStats;
}

export interface HealthResponse {
  status: string;
}

export interface RootResponse {
  message: string;
  available_models: string[];
  endpoints: string[];
}

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${getApiUrl()}/health`);
  if (!res.ok) throw new Error("API not reachable");
  return res.json();
}

export async function getAvailableModels(): Promise<string[]> {
  const res = await fetch(`${getApiUrl()}/`);
  if (!res.ok) throw new Error("Failed to fetch models");
  const data: RootResponse = await res.json();
  return data.available_models;
}

export async function predictVideo(
  file: File,
  modelName: string,
  options?: {
    scale?: number;
    skip_frames?: number;
    fall_confirm_seconds?: number;
    recover_seconds?: number;
    draw_bbox?: boolean;
  }
): Promise<PredictVideoResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model_name", modelName);
  if (options?.scale !== undefined) formData.append("scale", options.scale.toString());
  if (options?.skip_frames !== undefined) formData.append("skip_frames", options.skip_frames.toString());
  if (options?.fall_confirm_seconds !== undefined) formData.append("fall_confirm_seconds", options.fall_confirm_seconds.toString());
  if (options?.recover_seconds !== undefined) formData.append("recover_seconds", options.recover_seconds.toString());
  if (options?.draw_bbox !== undefined) formData.append("draw_bbox", options.draw_bbox.toString());

  const res = await fetch(`${getApiUrl()}/predict-video`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Video prediction failed");
  }
  return res.json();
}

export function getDownloadUrl(fileId: string): string {
  return `${getApiUrl()}/download/${fileId}`;
}
