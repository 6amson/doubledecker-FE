import { useState } from "react";
import { Filter, X } from "lucide-react";
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

export type FilterOp = "Eq" | "Ne" | "Gt" | "Ge" | "Lt" | "Le" | "Contains";

export interface FilterRule {
  id: string;
  column: string;
  operator: FilterOp;
  value: string;
}

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: string[];
  filter: FilterRule | null;
  onSave: (filter: FilterRule) => void;
}

const operators: { value: FilterOp; label: string }[] = [
  { value: "Eq", label: "= equals" },
  { value: "Ne", label: "≠ not equals" },
  { value: "Gt", label: "> greater than" },
  { value: "Ge", label: "≥ greater or equal" },
  { value: "Lt", label: "< less than" },
  { value: "Le", label: "≤ less or equal" },
  { value: "Contains", label: "∋ contains" },
];

export const FilterModal = ({
  open,
  onOpenChange,
  columns,
  filter,
  onSave,
}: FilterModalProps) => {
  const [column, setColumn] = useState(filter?.column || "");
  const [operator, setOperator] = useState<FilterOp>(filter?.operator || "Eq");
  const [value, setValue] = useState(filter?.value || "");

  const handleSave = () => {
    if (!column) return;
    onSave({
      id: filter?.id || crypto.randomUUID(),
      column,
      operator,
      value,
    });
    onOpenChange(false);
    // Reset form
    setColumn("");
    setOperator("Eq");
    setValue("");
  };

  // Reset form when modal opens with new filter
  useState(() => {
    if (open && filter) {
      setColumn(filter.column);
      setOperator(filter.operator);
      setValue(filter.value);
    } else if (open && !filter) {
      setColumn("");
      setOperator("Eq");
      setValue("");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Filter size={18} className="text-primary" />
            {filter ? "Edit Filter" : "Add Filter"}
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
                {columns.filter(col => col && col.trim()).map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Operator</label>
            <Select value={operator} onValueChange={(v) => setOperator(v as FilterOp)}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {operators.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Value</label>
            <Input
              placeholder="Enter value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="bg-muted border-border"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="bus" onClick={handleSave} disabled={!column}>
            {filter ? "Update" : "Add"} Filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
