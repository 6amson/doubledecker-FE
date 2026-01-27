import { useState, useEffect } from "react";
import { ArrowUpDown, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export interface SortRule {
  id: string;
  column: string;
  ascending: boolean;
}

interface SortModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: string[];
  sort: SortRule | null;
  onSave: (sort: SortRule) => void;
  originalColumns?: string[]; // Optional: to distinguish transformed columns
}

export const SortModal = ({
  open,
  onOpenChange,
  columns,
  sort,
  onSave,
  originalColumns = [],
}: SortModalProps) => {
  const [column, setColumn] = useState(sort?.column || "");
  const [ascending, setAscending] = useState(sort?.ascending ?? true);

  useEffect(() => {
    if (open && sort) {
      setColumn(sort.column);
      setAscending(sort.ascending);
    } else if (open && !sort) {
      setColumn("");
      setAscending(true);
    }
  }, [open, sort]);

  const handleSave = () => {
    if (!column) return;
    onSave({
      id: sort?.id || crypto.randomUUID(),
      column,
      ascending,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <ArrowUpDown size={18} className="text-primary" />
            {sort ? "Edit Sort" : "Add Sort"}
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Direction</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={ascending ? "bus" : "outline"}
                onClick={() => setAscending(true)}
                className="w-full"
              >
                ↑ Ascending
              </Button>
              <Button
                type="button"
                variant={!ascending ? "bus" : "outline"}
                onClick={() => setAscending(false)}
                className="w-full"
              >
                ↓ Descending
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="bus" onClick={handleSave} disabled={!column}>
            {sort ? "Update" : "Add"} Sort
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
