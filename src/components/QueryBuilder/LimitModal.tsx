import { useState, useEffect } from "react";
import { Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface LimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limit: number | null;
  totalRows: number;
  onSave: (limit: number | null) => void;
}

export const LimitModal = ({
  open,
  onOpenChange,
  limit,
  totalRows,
  onSave,
}: LimitModalProps) => {
  const [value, setValue] = useState(limit ?? totalRows);

  useEffect(() => {
    if (open) {
      setValue(limit ?? totalRows);
    }
  }, [open, limit, totalRows]);

  const handleSave = () => {
    onSave(value === totalRows ? null : value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Hash size={18} className="text-primary" />
            Set Row Limit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min={1}
              max={totalRows}
              value={value}
              onChange={(e) => {
                const num = parseInt(e.target.value, 10);
                if (!isNaN(num) && num > 0) {
                  setValue(Math.min(num, totalRows));
                }
              }}
              className="h-12 bg-muted border-border w-32 text-lg font-mono"
            />
            <span className="text-muted-foreground">
              of {totalRows.toLocaleString()} rows
            </span>
          </div>

          <div className="space-y-2">
            <Slider
              value={[value]}
              min={1}
              max={totalRows}
              step={1}
              onValueChange={([v]) => setValue(v)}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>{totalRows.toLocaleString()}</span>
            </div>
          </div>

          <Button 
            variant="ghost" 
            onClick={() => setValue(totalRows)} 
            className="w-full text-muted-foreground"
          >
            Clear limit (use all rows)
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="bus" onClick={handleSave}>
            Apply Limit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
