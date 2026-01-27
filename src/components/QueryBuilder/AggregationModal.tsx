import { useState, useEffect } from "react";
import { Group } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AggFunc = "Sum" | "Avg" | "Max" | "Min" | "Count";

export interface Aggregation {
  id: string;
  function: AggFunc;
  column: string;
  alias?: string;
}

interface AggregationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: string[];
  aggregation: Aggregation | null;
  onSave: (aggregation: Aggregation) => void;
}

const aggFunctions: { value: AggFunc; label: string }[] = [
  { value: "Sum", label: "SUM" },
  { value: "Avg", label: "AVG" },
  { value: "Max", label: "MAX" },
  { value: "Min", label: "MIN" },
  { value: "Count", label: "COUNT" },
];

export const AggregationModal = ({
  open,
  onOpenChange,
  columns,
  aggregation,
  onSave,
}: AggregationModalProps) => {
  const [func, setFunc] = useState<AggFunc>(aggregation?.function || "Sum");
  const [column, setColumn] = useState(aggregation?.column || "");
  const [alias, setAlias] = useState(aggregation?.alias || "");
  const [isManualAlias, setIsManualAlias] = useState(!!aggregation?.alias);

  useEffect(() => {
    if (open && aggregation) {
      setFunc(aggregation.function);
      setColumn(aggregation.column);
      setAlias(aggregation.alias || "");
      setIsManualAlias(!!aggregation.alias);
    } else if (open && !aggregation) {
      setFunc("Sum");
      setColumn("");
      setAlias("");
      setIsManualAlias(false);
    }
  }, [open, aggregation]);

  // Auto-generate alias if not manually set
  useEffect(() => {
    if (open && !isManualAlias && column) {
      setAlias(`${func}_${column}`);
    }
  }, [func, column, isManualAlias, open]);

  const handleSave = () => {
    if (!column) return;

    // Ensure alias is set (fallback to auto-generated if somehow empty)
    const finalAlias = alias || `${func}_${column}`;

    onSave({
      id: aggregation?.id || crypto.randomUUID(),
      function: func,
      column,
      alias: finalAlias,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Group size={18} className="text-primary" />
            {aggregation ? "Edit Aggregation" : "Add Aggregation"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Function</label>
              <Select value={func} onValueChange={(v) => setFunc(v as AggFunc)}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {aggFunctions.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Column</label>
              <Select value={column} onValueChange={setColumn}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {columns.filter(col => col && col.trim()).map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Alias (required)</label>
            <Input
              placeholder={`e.g., ${func}_${column || 'column'}`}
              value={alias}
              onChange={(e) => {
                setAlias(e.target.value);
                setIsManualAlias(true);
              }}
              className="bg-muted border-border"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="bus" onClick={handleSave} disabled={!column}>
            {aggregation ? "Update" : "Add"} Aggregation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
