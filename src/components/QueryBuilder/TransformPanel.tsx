import { Wand2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface TransformRule {
  id: string;
  column: string;
  operation: string;
  newColumnName?: string;
}

interface TransformPanelProps {
  columns: string[];
  transforms: TransformRule[];
  onAddTransform: () => void;
  onUpdateTransform: (id: string, updates: Partial<TransformRule>) => void;
  onRemoveTransform: (id: string) => void;
}

const operations = [
  { value: "uppercase", label: "UPPERCASE" },
  { value: "lowercase", label: "lowercase" },
  { value: "trim", label: "Trim whitespace" },
  { value: "round", label: "Round numbers" },
  { value: "abs", label: "Absolute value" },
  { value: "length", label: "String length" },
  { value: "date_format", label: "Format date" },
  { value: "extract_year", label: "Extract year" },
  { value: "extract_month", label: "Extract month" },
];

export const TransformPanel = ({
  columns,
  transforms,
  onAddTransform,
  onUpdateTransform,
  onRemoveTransform,
}: TransformPanelProps) => {
  return (
    <div className="query-panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wand2 size={18} className="text-primary" />
          <h3 className="font-display font-semibold text-foreground">Transform</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onAddTransform} className="h-8">
          <Plus size={14} />
          Add
        </Button>
      </div>

      {transforms.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No transformations
        </p>
      ) : (
        <div className="space-y-3">
          {transforms.map((transform) => (
            <div
              key={transform.id}
              className="bg-muted/50 rounded-lg p-3 animate-slide-up"
            >
              <div className="flex flex-col gap-2">
                <Select
                  value={transform.column}
                  onValueChange={(value) => onUpdateTransform(transform.id, { column: value })}
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
                    value={transform.operation}
                    onValueChange={(value) => onUpdateTransform(transform.id, { operation: value })}
                  >
                    <SelectTrigger className="h-9 bg-muted border-none flex-1">
                      <SelectValue placeholder="Operation" />
                    </SelectTrigger>
                    <SelectContent>
                      {operations.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveTransform(transform.id)}
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
