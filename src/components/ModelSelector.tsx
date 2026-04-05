import { Cpu } from "lucide-react";

interface ModelSelectorProps {
  models: string[];
  selected: string;
  onChange: (model: string) => void;
}

const ModelSelector = ({ models, selected, onChange }: ModelSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Cpu className="w-4 h-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Model:</span>
      <div className="flex gap-1">
        {models.length === 0 ? (
          <span className="text-xs text-muted-foreground font-mono">No models available</span>
        ) : (
          models.map((m) => (
            <button
              key={m}
              onClick={() => onChange(m)}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                selected === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ModelSelector;
