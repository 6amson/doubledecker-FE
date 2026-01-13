import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Columns3, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ColumnSelectorProps {
  columns: string[];
  selectedColumns: string[];
  onToggle: (column: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const ColumnSelector = ({
  columns,
  selectedColumns,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: ColumnSelectorProps) => {
  const [search, setSearch] = useState("");

  const filteredColumns = columns.filter(col =>
    col.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="query-panel">
      <div className="flex items-center gap-2 mb-4">
        <Columns3 size={18} className="text-primary" />
        <h3 className="font-display font-semibold text-foreground">Columns</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {selectedColumns.length}/{columns.length}
        </span>
      </div>

      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search columns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 bg-muted border-none text-sm"
        />
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={onSelectAll}
          className="text-xs text-primary hover:underline"
        >
          Select all
        </button>
        <span className="text-muted-foreground">|</span>
        <button
          onClick={onDeselectAll}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Deselect all
        </button>
      </div>

      <ScrollArea className="h-[180px]">
        <div className="space-y-1">
          {filteredColumns.map((column) => (
            <label
              key={column}
              className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={selectedColumns.includes(column)}
                onCheckedChange={() => onToggle(column)}
                className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm text-foreground/90 truncate">{column}</span>
            </label>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
