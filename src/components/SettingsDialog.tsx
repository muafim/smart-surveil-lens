import { useState } from "react";
import { X, Server, CheckCircle, XCircle } from "lucide-react";
import { getApiUrl, setApiUrl, checkHealth } from "@/lib/api";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onConnectionChange: (connected: boolean) => void;
}

const SettingsDialog = ({ open, onClose, onConnectionChange }: SettingsDialogProps) => {
  const [url, setUrl] = useState(getApiUrl());
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  if (!open) return null;

  const handleTest = async () => {
    setTesting(true);
    setStatus("idle");
    setApiUrl(url);
    try {
      await checkHealth();
      setStatus("success");
      onConnectionChange(true);
    } catch {
      setStatus("error");
      onConnectionChange(false);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setApiUrl(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg w-full max-w-md mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            API Settings
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">FastAPI Server URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full px-3 py-2 rounded-md bg-muted border border-border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {testing ? "Testing..." : "Test Connection"}
            </button>
            {status === "success" && (
              <span className="flex items-center gap-1 text-xs text-success">
                <CheckCircle className="w-3.5 h-3.5" /> Connected
              </span>
            )}
            {status === "error" && (
              <span className="flex items-center gap-1 text-xs text-destructive">
                <XCircle className="w-3.5 h-3.5" /> Failed
              </span>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;
