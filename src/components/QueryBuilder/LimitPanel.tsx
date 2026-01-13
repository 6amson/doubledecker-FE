import { Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface LimitPanelProps {
  limit: number | null;
  totalRows: number;
  onLimitChange: (limit: number | null) => void;
}

export const LimitPanel = ({ limit, totalRows, onLimitChange }: LimitPanelProps) => {
  const handleSliderChange = (value: number[]) => {
    const newLimit = value[0];
    onLimitChange(newLimit === totalRows ? null : newLimit);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || value === "0") {
      onLimitChange(null);
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num > 0) {
        onLimitChange(Math.min(num, totalRows));
      }
    }
  };

  return (
    <div className="query-panel">
      <div className="flex items-center gap-2 mb-4">
        <Hash size={18} className="text-primary" />
        <h3 className="font-display font-semibold text-foreground">Limit</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="number"
            min={1}
            max={totalRows}
            value={limit ?? ""}
            onChange={handleInputChange}
            placeholder="All rows"
            className="h-10 bg-muted border-none w-28"
          />
          <span className="text-sm text-muted-foreground">
            of {totalRows.toLocaleString()} rows
          </span>
        </div>

        <Slider
          value={[limit ?? totalRows]}
          min={1}
          max={totalRows}
          step={1}
          onValueChange={handleSliderChange}
          className="py-2"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>{totalRows.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
