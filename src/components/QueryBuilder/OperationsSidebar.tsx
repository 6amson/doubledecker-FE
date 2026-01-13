import { useState } from "react";
import {
  Columns3,
  Filter,
  Wand2,
  ArrowUpDown,
  Group,
  Hash,
  Plus,
  ChevronDown,
  X,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import { FilterRule, FilterOp } from "./FilterModal";
import { TransformRule, TransformOp } from "./TransformModal";
import { SortRule } from "./SortModal";
import { Aggregation, AggFunc } from "./AggregationModal";

export interface GroupByRule {
  columns: string[];
  aggregations: Aggregation[];
}

interface OperationsSidebarProps {
  columns: string[];
  selectedColumns: string[];
  onToggleColumn: (column: string) => void;
  onSelectAllColumns: () => void;
  onDeselectAllColumns: () => void;
  
  filters: FilterRule[];
  onAddFilter: () => void;
  onEditFilter: (filter: FilterRule) => void;
  onRemoveFilter: (id: string) => void;
  
  transforms: TransformRule[];
  onAddTransform: () => void;
  onEditTransform: (transform: TransformRule) => void;
  onRemoveTransform: (id: string) => void;
  
  sorts: SortRule[];
  onAddSort: () => void;
  onEditSort: (sort: SortRule) => void;
  onRemoveSort: (id: string) => void;
  
  groupBy: GroupByRule;
  onToggleGroupColumn: (column: string) => void;
  onAddAggregation: () => void;
  onEditAggregation: (agg: Aggregation) => void;
  onRemoveAggregation: (id: string) => void;
  
  limit: number | null;
  totalRows: number;
  onEditLimit: () => void;
  onClearLimit: () => void;
}

const operatorLabels: Record<FilterOp, string> = {
  Eq: "=",
  Ne: "≠",
  Gt: ">",
  Ge: "≥",
  Lt: "<",
  Le: "≤",
  Contains: "∋",
};

const transformLabels: Record<TransformOp, string> = {
  Multiply: "×",
  Divide: "÷",
  Add: "+",
  Subtract: "−",
};

export const OperationsSidebar = ({
  columns,
  selectedColumns,
  onToggleColumn,
  onSelectAllColumns,
  onDeselectAllColumns,
  filters,
  onAddFilter,
  onEditFilter,
  onRemoveFilter,
  transforms,
  onAddTransform,
  onEditTransform,
  onRemoveTransform,
  sorts,
  onAddSort,
  onEditSort,
  onRemoveSort,
  groupBy,
  onToggleGroupColumn,
  onAddAggregation,
  onEditAggregation,
  onRemoveAggregation,
  limit,
  totalRows,
  onEditLimit,
  onClearLimit,
}: OperationsSidebarProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    columns: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="space-y-2">
      {/* Columns Section */}
      <Collapsible open={openSections.columns} onOpenChange={() => toggleSection("columns")}>
        <div className="query-panel">
          <CollapsibleTrigger className="flex items-center justify-between w-full py-1">
            <div className="flex items-center gap-2">
              <Columns3 size={18} className="text-primary" />
              <h3 className="font-display font-semibold text-foreground">Select</h3>
              <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
                {selectedColumns.length}/{columns.length}
              </Badge>
            </div>
            <ChevronDown size={16} className={cn("transition-transform", openSections.columns && "rotate-180")} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-3">
            <div className="flex gap-2 mb-3">
              <button onClick={onSelectAllColumns} className="text-xs text-primary hover:underline">
                Select all
              </button>
              <span className="text-muted-foreground">|</span>
              <button onClick={onDeselectAllColumns} className="text-xs text-muted-foreground hover:text-foreground">
                Deselect all
              </button>
            </div>
            <ScrollArea className="h-[140px]">
              <div className="space-y-1">
                {columns.map((column) => (
                  <label
                    key={column}
                    className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedColumns.includes(column)}
                      onCheckedChange={() => onToggleColumn(column)}
                      className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-sm text-foreground/90 truncate">{column}</span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Filters Section */}
      <Collapsible open={openSections.filters} onOpenChange={() => toggleSection("filters")}>
        <div className="query-panel">
          <CollapsibleTrigger className="flex items-center justify-between w-full py-1">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-primary" />
              <h3 className="font-display font-semibold text-foreground">Filter</h3>
              {filters.length > 0 && (
                <Badge variant="default" className="ml-1 text-xs h-5 px-1.5 bg-primary">
                  {filters.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2"
                onClick={(e) => { e.stopPropagation(); onAddFilter(); }}
              >
                <Plus size={14} />
              </Button>
              <ChevronDown size={16} className={cn("transition-transform", openSections.filters && "rotate-180")} />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-3">
            {filters.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">No filters</p>
            ) : (
              <div className="space-y-2">
                {filters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50 group"
                  >
                    <span className="text-xs font-mono text-foreground/80 truncate flex-1">
                      {filter.column} {operatorLabels[filter.operator]} {filter.value}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onEditFilter(filter)}
                    >
                      <Pencil size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      onClick={() => onRemoveFilter(filter.id)}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Group By Section */}
      <Collapsible open={openSections.groupBy} onOpenChange={() => toggleSection("groupBy")}>
        <div className="query-panel">
          <CollapsibleTrigger className="flex items-center justify-between w-full py-1">
            <div className="flex items-center gap-2">
              <Group size={18} className="text-primary" />
              <h3 className="font-display font-semibold text-foreground">Group By</h3>
              {(groupBy.columns.length > 0 || groupBy.aggregations.length > 0) && (
                <Badge variant="default" className="ml-1 text-xs h-5 px-1.5 bg-primary">
                  {groupBy.columns.length + groupBy.aggregations.length}
                </Badge>
              )}
            </div>
            <ChevronDown size={16} className={cn("transition-transform", openSections.groupBy && "rotate-180")} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-3 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Group columns:</p>
              <div className="flex flex-wrap gap-1.5">
                {columns.map((col) => (
                  <Badge
                    key={col}
                    variant={groupBy.columns.includes(col) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all text-xs",
                      groupBy.columns.includes(col)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-muted"
                    )}
                    onClick={() => onToggleGroupColumn(col)}
                  >
                    {col}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">Aggregations:</p>
                <Button variant="ghost" size="sm" className="h-6 px-2" onClick={onAddAggregation}>
                  <Plus size={12} />
                </Button>
              </div>
              {groupBy.aggregations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">No aggregations</p>
              ) : (
                <div className="space-y-2">
                  {groupBy.aggregations.map((agg) => (
                    <div
                      key={agg.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50 group"
                    >
                      <span className="text-xs font-mono text-foreground/80 truncate flex-1">
                        {agg.function}({agg.column}){agg.alias && ` → ${agg.alias}`}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onEditAggregation(agg)}
                      >
                        <Pencil size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        onClick={() => onRemoveAggregation(agg.id)}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Transforms Section */}
      <Collapsible open={openSections.transforms} onOpenChange={() => toggleSection("transforms")}>
        <div className="query-panel">
          <CollapsibleTrigger className="flex items-center justify-between w-full py-1">
            <div className="flex items-center gap-2">
              <Wand2 size={18} className="text-primary" />
              <h3 className="font-display font-semibold text-foreground">Transform</h3>
              {transforms.length > 0 && (
                <Badge variant="default" className="ml-1 text-xs h-5 px-1.5 bg-primary">
                  {transforms.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2"
                onClick={(e) => { e.stopPropagation(); onAddTransform(); }}
              >
                <Plus size={14} />
              </Button>
              <ChevronDown size={16} className={cn("transition-transform", openSections.transforms && "rotate-180")} />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-3">
            {transforms.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">No transforms</p>
            ) : (
              <div className="space-y-2">
                {transforms.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50 group"
                  >
                    <span className="text-xs font-mono text-foreground/80 truncate flex-1">
                      {t.column} {transformLabels[t.operation]} {t.value} → {t.alias}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onEditTransform(t)}
                    >
                      <Pencil size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      onClick={() => onRemoveTransform(t.id)}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Sort Section */}
      <Collapsible open={openSections.sorts} onOpenChange={() => toggleSection("sorts")}>
        <div className="query-panel">
          <CollapsibleTrigger className="flex items-center justify-between w-full py-1">
            <div className="flex items-center gap-2">
              <ArrowUpDown size={18} className="text-primary" />
              <h3 className="font-display font-semibold text-foreground">Sort</h3>
              {sorts.length > 0 && (
                <Badge variant="default" className="ml-1 text-xs h-5 px-1.5 bg-primary">
                  {sorts.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2"
                onClick={(e) => { e.stopPropagation(); onAddSort(); }}
              >
                <Plus size={14} />
              </Button>
              <ChevronDown size={16} className={cn("transition-transform", openSections.sorts && "rotate-180")} />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pt-3">
            {sorts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">No sorting</p>
            ) : (
              <div className="space-y-2">
                {sorts.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50 group"
                  >
                    <span className="text-xs font-mono text-foreground/80 truncate flex-1">
                      {s.column} {s.ascending ? "↑ ASC" : "↓ DESC"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onEditSort(s)}
                    >
                      <Pencil size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      onClick={() => onRemoveSort(s.id)}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Limit Section */}
      <div className="query-panel">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Hash size={18} className="text-primary" />
            <h3 className="font-display font-semibold text-foreground">Limit</h3>
            {limit !== null && (
              <Badge variant="default" className="ml-1 text-xs h-5 px-1.5 bg-primary">
                {limit}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onEditLimit}>
              <Pencil size={14} />
            </Button>
            {limit !== null && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-destructive" 
                onClick={onClearLimit}
              >
                <X size={14} />
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {limit !== null ? `Returning ${limit} of ${totalRows} rows` : `All ${totalRows} rows`}
        </p>
      </div>
    </div>
  );
};
