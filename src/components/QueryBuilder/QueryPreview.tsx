import { Code, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FilterRule, FilterOp } from "./FilterPanel";
import { TransformRule } from "./TransformPanel";
import { SortRule } from "./SortPanel";
import { GroupByRule } from "./GroupByPanel";

interface QueryPreviewProps {
  selectedColumns: string[];
  filters: FilterRule[];
  transforms: TransformRule[];
  sorts: SortRule[];
  groupBy: GroupByRule;
  limit: number | null;
  tableName: string;
}

type Operation =
  | { type: "Select"; columns: string[] }
  | { type: "Filter"; column: string; operator: FilterOp; value: string }
  | { type: "GroupBy"; columns: string[]; aggregations: { function: string; column: string; alias?: string }[] }
  | { type: "Sort"; column: string; ascending: boolean }
  | { type: "Limit"; count: number }
  | { type: "Transform"; column: string; operation: string; value: number; alias: string };

export const QueryPreview = ({
  selectedColumns,
  filters,
  transforms,
  sorts,
  groupBy,
  limit,
  tableName,
}: QueryPreviewProps) => {
  const [copied, setCopied] = useState(false);

  const generateOperations = (): Operation[] => {
    const ops: Operation[] = [];

    // Select operation
    if (selectedColumns.length > 0) {
      ops.push({ type: "Select", columns: selectedColumns });
    }

    // Filter operations
    filters
      .filter(f => f.column && f.operator && f.value)
      .forEach(f => {
        ops.push({
          type: "Filter",
          column: f.column,
          operator: f.operator,
          value: f.value,
        });
      });

    // GroupBy operation
    if (groupBy.columns.length > 0 || groupBy.aggregations.length > 0) {
      ops.push({
        type: "GroupBy",
        columns: groupBy.columns,
        aggregations: groupBy.aggregations
          .filter(a => a.column && a.function)
          .map(a => ({
            function: a.function,
            column: a.column,
            ...(a.alias ? { alias: a.alias } : {}),
          })),
      });
    }

    // Transform operations
    transforms
      .filter(t => t.column && t.operation && t.alias)
      .forEach(t => {
        ops.push({
          type: "Transform",
          column: t.column,
          operation: t.operation,
          value: t.value,
          alias: t.alias,
        });
      });

    // Sort operations
    sorts
      .filter(s => s.column)
      .forEach(s => {
        ops.push({
          type: "Sort",
          column: s.column,
          ascending: s.ascending,
        });
      });

    // Limit operation
    if (limit && limit > 0) {
      ops.push({ type: "Limit", count: limit });
    }

    return ops;
  };

  const operations = generateOperations();
  const queryJson = JSON.stringify({ operations }, null, 2);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(queryJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="query-panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code size={18} className="text-primary" />
          <h3 className="font-display font-semibold text-foreground">Query Preview</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {operations.length} ops
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <pre className="bg-muted/50 rounded-lg p-4 text-sm font-mono text-foreground/90 overflow-x-auto scrollbar-thin max-h-64 overflow-y-auto">
        <code>{queryJson}</code>
      </pre>
    </div>
  );
};
