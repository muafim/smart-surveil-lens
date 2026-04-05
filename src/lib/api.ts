const DEFAULT_API_URL = "http://localhost:8000";

export function getApiUrl(): string {
  return localStorage.getItem("yolo_api_url") || DEFAULT_API_URL;
}

export function setApiUrl(url: string) {
  localStorage.setItem("yolo_api_url", url);
}

export interface Detection {
  class_id: number;
  label: string;
  confidence: number;
  bbox_xyxy: [number, number, number, number];
}

export interface PredictResponse {
  model: string;
  inference_time_sec: number;
  num_detections: number;
  detections: Detection[];
}

export interface HealthResponse {
  status: string;
}

export interface RootResponse {
  message: string;
  available_models: string[];
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

export async function predict(file: File, modelName: string): Promise<PredictResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model_name", modelName);

  const res = await fetch(`${getApiUrl()}/predict`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Prediction failed");
  }
  return res.json();
}
