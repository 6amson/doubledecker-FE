import { Code, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FilterRule } from "./FilterPanel";
import { TransformRule } from "./TransformPanel";
import { SortRule } from "./SortPanel";

interface QueryPreviewProps {
  selectedColumns: string[];
  filters: FilterRule[];
  transforms: TransformRule[];
  sorts: SortRule[];
  limit: number | null;
  tableName: string;
}

export const QueryPreview = ({
  selectedColumns,
  filters,
  transforms,
  sorts,
  limit,
  tableName,
}: QueryPreviewProps) => {
  const [copied, setCopied] = useState(false);

  const generateQuery = () => {
    const parts: string[] = [];

    // SELECT
    const columns = selectedColumns.length > 0 ? selectedColumns.join(", ") : "*";
    parts.push(`SELECT ${columns}`);
    parts.push(`FROM "${tableName}"`);

    // WHERE
    if (filters.length > 0) {
      const filterClauses = filters
        .filter(f => f.column && f.operator)
        .map(f => {
          if (f.operator === "is_empty") return `${f.column} IS NULL OR ${f.column} = ''`;
          if (f.operator === "is_not_empty") return `${f.column} IS NOT NULL AND ${f.column} != ''`;
          if (f.operator === "equals") return `${f.column} = '${f.value}'`;
          if (f.operator === "not_equals") return `${f.column} != '${f.value}'`;
          if (f.operator === "contains") return `${f.column} LIKE '%${f.value}%'`;
          if (f.operator === "starts_with") return `${f.column} LIKE '${f.value}%'`;
          if (f.operator === "ends_with") return `${f.column} LIKE '%${f.value}'`;
          if (f.operator === "greater_than") return `${f.column} > '${f.value}'`;
          if (f.operator === "less_than") return `${f.column} < '${f.value}'`;
          return "";
        })
        .filter(Boolean);

      if (filterClauses.length > 0) {
        parts.push(`WHERE ${filterClauses.join(" AND ")}`);
      }
    }

    // ORDER BY
    if (sorts.length > 0) {
      const sortClauses = sorts
        .filter(s => s.column)
        .map(s => `${s.column} ${s.direction.toUpperCase()}`);

      if (sortClauses.length > 0) {
        parts.push(`ORDER BY ${sortClauses.join(", ")}`);
      }
    }

    // LIMIT
    if (limit) {
      parts.push(`LIMIT ${limit}`);
    }

    return parts.join("\n");
  };

  const query = generateQuery();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="query-panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code size={18} className="text-primary" />
          <h3 className="font-display font-semibold text-foreground">Query Preview</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <pre className="bg-muted/50 rounded-lg p-4 text-sm font-mono text-foreground/90 overflow-x-auto scrollbar-thin">
        <code>{query}</code>
      </pre>
    </div>
  );
};
