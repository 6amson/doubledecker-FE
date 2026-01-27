import { useState, useEffect } from "react";
import { Wand2 } from "lucide-react";
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

export type TransformOp = "Multiply" | "Divide" | "Add" | "Subtract";

export interface TransformRule {
  id: string;
  column: string;
  operation: TransformOp;
  value: number;
  alias: string;
}

interface TransformModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: string[];
  transform: TransformRule | null;
  onSave: (transform: TransformRule) => void;
  originalColumns?: string[]; // Optional: to distinguish transformed columns
}

const operations: { value: TransformOp; label: string; symbol: string }[] = [
  { value: "Multiply", label: "Multiply", symbol: "×" },
  { value: "Divide", label: "Divide", symbol: "÷" },
  { value: "Add", label: "Add", symbol: "+" },
  { value: "Subtract", label: "Subtract", symbol: "−" },
];

export const TransformModal = ({
  open,
  onOpenChange,
  columns,
  transform,
  onSave,
  originalColumns = [],
}: TransformModalProps) => {
  const [column, setColumn] = useState(transform?.column || "");
  const [operation, setOperation] = useState<TransformOp>(transform?.operation || "Multiply");
  const [value, setValue] = useState(transform?.value?.toString() || "");
  const [alias, setAlias] = useState(transform?.alias || "");

  useEffect(() => {
    if (open && transform) {
      setColumn(transform.column);
      setOperation(transform.operation);
      setValue(transform.value.toString());
      setAlias(transform.alias);
    } else if (open && !transform) {
      setColumn("");
      setOperation("Multiply");
      setValue("");
      setAlias("");
    }
  }, [open, transform]);

  const handleSave = () => {
    if (!column || !alias) return;
    onSave({
      id: transform?.id || crypto.randomUUID(),
      column,
      operation,
      value: parseFloat(value) || 0,
      alias,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Wand2 size={18} className="text-primary" />
            {transform ? "Edit Transform" : "Add Transform"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Column</label>
            <Select value={column} onValueChange={setColumn}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {columns.filter(col => col && col.trim()).map((col) => {
                  const isTransformed = originalColumns.length > 0 && !originalColumns.includes(col);
                  return (
                    <SelectItem key={col} value={col}>
                      <div className="flex items-center gap-2">
                        <span>{col}</span>
                        {isTransformed && (
                          <Wand2 size={12} className="text-primary/70" />
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Operation</label>
              <Select value={operation} onValueChange={(v) => setOperation(v as TransformOp)}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {operations.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.symbol} {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Value</label>
              <Input
                type="number"
                placeholder="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-muted border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Alias (new column name)</label>
            <Input
              placeholder="e.g., revenue_doubled"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="bg-muted border-border"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="bus" onClick={handleSave} disabled={!column || !alias}>
            {transform ? "Update" : "Add"} Transform
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
