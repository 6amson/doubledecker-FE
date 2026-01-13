import { Group, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

export interface GroupByRule {
  columns: string[];
  aggregations: Aggregation[];
}

interface GroupByPanelProps {
  availableColumns: string[];
  groupBy: GroupByRule;
  onToggleGroupColumn: (column: string) => void;
  onAddAggregation: () => void;
  onUpdateAggregation: (id: string, updates: Partial<Aggregation>) => void;
  onRemoveAggregation: (id: string) => void;
}

const aggFunctions: { value: AggFunc; label: string }[] = [
  { value: "Sum", label: "SUM" },
  { value: "Avg", label: "AVG" },
  { value: "Max", label: "MAX" },
  { value: "Min", label: "MIN" },
  { value: "Count", label: "COUNT" },
];

export const GroupByPanel = ({
  availableColumns,
  groupBy,
  onToggleGroupColumn,
  onAddAggregation,
  onUpdateAggregation,
  onRemoveAggregation,
}: GroupByPanelProps) => {
  return (
    <div className="query-panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Group size={18} className="text-primary" />
          <h3 className="font-display font-semibold text-foreground">Group By</h3>
        </div>
      </div>

      {/* Group By Columns */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Group by columns:</p>
        <div className="flex flex-wrap gap-1.5">
          {availableColumns.map((col) => (
            <Badge
              key={col}
              variant={groupBy.columns.includes(col) ? "default" : "outline"}
              className={`cursor-pointer transition-all text-xs ${
                groupBy.columns.includes(col)
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-muted"
              }`}
              onClick={() => onToggleGroupColumn(col)}
            >
              {col}
            </Badge>
          ))}
        </div>
      </div>

      {/* Aggregations */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">Aggregations:</p>
          <Button variant="ghost" size="sm" onClick={onAddAggregation} className="h-7 text-xs">
            <Plus size={12} />
            Add
          </Button>
        </div>

        {groupBy.aggregations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-3">
            No aggregations
          </p>
        ) : (
          <div className="space-y-3">
            {groupBy.aggregations.map((agg) => (
              <div
                key={agg.id}
                className="bg-muted/50 rounded-lg p-3 animate-slide-up"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Select
                      value={agg.function}
                      onValueChange={(value) => onUpdateAggregation(agg.id, { function: value as AggFunc })}
                    >
                      <SelectTrigger className="h-9 bg-muted border-none w-24">
                        <SelectValue placeholder="Func" />
                      </SelectTrigger>
                      <SelectContent>
                        {aggFunctions.map((fn) => (
                          <SelectItem key={fn.value} value={fn.value}>
                            {fn.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={agg.column}
                      onValueChange={(value) => onUpdateAggregation(agg.id, { column: value })}
                    >
                      <SelectTrigger className="h-9 bg-muted border-none flex-1">
                        <SelectValue placeholder="Column" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableColumns.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveAggregation(agg.id)}
                    >
                      <X size={14} />
                    </Button>
                  </div>

                  <Input
                    placeholder="Alias (optional)"
                    value={agg.alias || ""}
                    onChange={(e) => onUpdateAggregation(agg.id, { alias: e.target.value || undefined })}
                    className="h-9 bg-muted border-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
