import { useState } from "react";
import { Filter, Plus, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterRule {
  id: string;
  column: string;
  operator: string;
  value: string;
}

interface FilterPanelProps {
  columns: string[];
  filters: FilterRule[];
  onAddFilter: () => void;
  onUpdateFilter: (id: string, updates: Partial<FilterRule>) => void;
  onRemoveFilter: (id: string) => void;
}

const operators = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "not equals" },
  { value: "contains", label: "contains" },
  { value: "starts_with", label: "starts with" },
  { value: "ends_with", label: "ends with" },
  { value: "greater_than", label: ">" },
  { value: "less_than", label: "<" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
];

export const FilterPanel = ({
  columns,
  filters,
  onAddFilter,
  onUpdateFilter,
  onRemoveFilter,
}: FilterPanelProps) => {
  return (
    <div className="query-panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-primary" />
          <h3 className="font-display font-semibold text-foreground">Filters</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onAddFilter} className="h-8">
          <Plus size={14} />
          Add
        </Button>
      </div>

      {filters.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No filters applied
        </p>
      ) : (
        <div className="space-y-3">
          {filters.map((filter, index) => (
            <div
              key={filter.id}
              className="bg-muted/50 rounded-lg p-3 animate-slide-up"
            >
              {index > 0 && (
                <span className="text-xs text-primary font-medium mb-2 block">AND</span>
              )}
              <div className="flex flex-col gap-2">
                <Select
                  value={filter.column}
                  onValueChange={(value) => onUpdateFilter(filter.id, { column: value })}
                >
                  <SelectTrigger className="h-9 bg-muted border-none">
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

                <div className="flex gap-2">
                  <Select
                    value={filter.operator}
                    onValueChange={(value) => onUpdateFilter(filter.id, { operator: value })}
                  >
                    <SelectTrigger className="h-9 bg-muted border-none flex-1">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {!["is_empty", "is_not_empty"].includes(filter.operator) && (
                    <Input
                      placeholder="Value"
                      value={filter.value}
                      onChange={(e) => onUpdateFilter(filter.id, { value: e.target.value })}
                      className="h-9 bg-muted border-none flex-1"
                    />
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveFilter(filter.id)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
