import { ArrowUpDown, Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  direction: "asc" | "desc";
}

interface SortPanelProps {
  columns: string[];
  sorts: SortRule[];
  onAddSort: () => void;
  onUpdateSort: (id: string, updates: Partial<SortRule>) => void;
  onRemoveSort: (id: string) => void;
}

export const SortPanel = ({
  columns,
  sorts,
  onAddSort,
  onUpdateSort,
  onRemoveSort,
}: SortPanelProps) => {
  return (
    <div className="query-panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ArrowUpDown size={18} className="text-primary" />
          <h3 className="font-display font-semibold text-foreground">Sort</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onAddSort} className="h-8">
          <Plus size={14} />
          Add
        </Button>
      </div>

      {sorts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No sorting applied
        </p>
      ) : (
        <div className="space-y-3">
          {sorts.map((sort, index) => (
            <div
              key={sort.id}
              className="bg-muted/50 rounded-lg p-3 animate-slide-up"
            >
              {index > 0 && (
                <span className="text-xs text-muted-foreground mb-2 block">then by</span>
              )}
              <div className="flex gap-2">
                <Select
                  value={sort.column}
                  onValueChange={(value) => onUpdateSort(sort.id, { column: value })}
                >
                  <SelectTrigger className="h-9 bg-muted border-none flex-1">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant={sort.direction === "asc" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => onUpdateSort(sort.id, { direction: "asc" })}
                >
                  <ArrowUp size={14} />
                </Button>

                <Button
                  variant={sort.direction === "desc" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => onUpdateSort(sort.id, { direction: "desc" })}
                >
                  <ArrowDown size={14} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveSort(sort.id)}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
