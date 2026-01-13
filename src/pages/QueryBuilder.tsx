import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ColumnSelector } from "@/components/QueryBuilder/ColumnSelector";
import { FilterPanel, FilterRule, FilterOp } from "@/components/QueryBuilder/FilterPanel";
import { TransformPanel, TransformRule, TransformOp } from "@/components/QueryBuilder/TransformPanel";
import { SortPanel, SortRule } from "@/components/QueryBuilder/SortPanel";
import { LimitPanel } from "@/components/QueryBuilder/LimitPanel";
import { GroupByPanel, GroupByRule, Aggregation, AggFunc } from "@/components/QueryBuilder/GroupByPanel";
import { QueryPreview } from "@/components/QueryBuilder/QueryPreview";
import { ResultsPreview } from "@/components/QueryBuilder/ResultsPreview";
import { ArrowLeft, Play, Download, Save } from "lucide-react";

// Mock data for demo
const mockColumns = ["id", "name", "email", "company", "revenue", "country", "created_at", "status"];
const mockRows = [
  ["1", "John Doe", "john@example.com", "Acme Inc", "125000", "USA", "2024-01-15", "active"],
  ["2", "Jane Smith", "jane@example.com", "Tech Corp", "89000", "UK", "2024-02-20", "active"],
  ["3", "Bob Johnson", "bob@example.com", "StartupXYZ", "45000", "Canada", "2024-03-10", "pending"],
  ["4", "Alice Brown", "alice@example.com", "MegaCo", "320000", "USA", "2024-01-05", "active"],
  ["5", "Charlie Wilson", "charlie@example.com", "DataFlow", "67000", "Germany", "2024-04-12", "inactive"],
  ["6", "Diana Lee", "diana@example.com", "CloudNine", "155000", "Japan", "2024-02-28", "active"],
  ["7", "Eve Martinez", "eve@example.com", "FinTech Pro", "210000", "Spain", "2024-03-22", "active"],
  ["8", "Frank Miller", "frank@example.com", "DevOps Ltd", "98000", "France", "2024-05-01", "pending"],
];

export const QueryBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const file = location.state?.file as File | null;

  const [columns, setColumns] = useState<string[]>(mockColumns);
  const [rows, setRows] = useState<string[][]>(mockRows);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(mockColumns);
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [transforms, setTransforms] = useState<TransformRule[]>([]);
  const [sorts, setSorts] = useState<SortRule[]>([]);
  const [groupBy, setGroupBy] = useState<GroupByRule>({ columns: [], aggregations: [] });
  const [limit, setLimit] = useState<number | null>(null);

  const tableName = file?.name?.replace('.csv', '') || "uploaded_data";

  // Parse actual file if provided
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length > 0) {
          const parsedHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          setColumns(parsedHeaders);
          setSelectedColumns(parsedHeaders);
          
          const dataRows = lines.slice(1).map(line => 
            line.split(',').map(cell => cell.trim().replace(/"/g, ''))
          );
          setRows(dataRows);
        }
      };
      reader.readAsText(file);
    }
  }, [file]);

  // Column handlers
  const handleToggleColumn = useCallback((column: string) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  }, []);

  const handleSelectAllColumns = useCallback(() => {
    setSelectedColumns(columns);
  }, [columns]);

  const handleDeselectAllColumns = useCallback(() => {
    setSelectedColumns([]);
  }, []);

  // Filter handlers
  const handleAddFilter = useCallback(() => {
    setFilters(prev => [...prev, {
      id: crypto.randomUUID(),
      column: "",
      operator: "Eq" as FilterOp,
      value: ""
    }]);
  }, []);

  const handleUpdateFilter = useCallback((id: string, updates: Partial<FilterRule>) => {
    setFilters(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const handleRemoveFilter = useCallback((id: string) => {
    setFilters(prev => prev.filter(f => f.id !== id));
  }, []);

  // Transform handlers
  const handleAddTransform = useCallback(() => {
    setTransforms(prev => [...prev, {
      id: crypto.randomUUID(),
      column: "",
      operation: "Multiply" as TransformOp,
      value: 0,
      alias: ""
    }]);
  }, []);

  const handleUpdateTransform = useCallback((id: string, updates: Partial<TransformRule>) => {
    setTransforms(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const handleRemoveTransform = useCallback((id: string) => {
    setTransforms(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sort handlers
  const handleAddSort = useCallback(() => {
    setSorts(prev => [...prev, {
      id: crypto.randomUUID(),
      column: "",
      ascending: true
    }]);
  }, []);

  const handleUpdateSort = useCallback((id: string, updates: Partial<SortRule>) => {
    setSorts(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const handleRemoveSort = useCallback((id: string) => {
    setSorts(prev => prev.filter(s => s.id !== id));
  }, []);

  // GroupBy handlers
  const handleToggleGroupColumn = useCallback((column: string) => {
    setGroupBy(prev => ({
      ...prev,
      columns: prev.columns.includes(column)
        ? prev.columns.filter(c => c !== column)
        : [...prev.columns, column]
    }));
  }, []);

  const handleAddAggregation = useCallback(() => {
    setGroupBy(prev => ({
      ...prev,
      aggregations: [...prev.aggregations, {
        id: crypto.randomUUID(),
        function: "Sum" as AggFunc,
        column: "",
        alias: undefined
      }]
    }));
  }, []);

  const handleUpdateAggregation = useCallback((id: string, updates: Partial<Aggregation>) => {
    setGroupBy(prev => ({
      ...prev,
      aggregations: prev.aggregations.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  }, []);

  const handleRemoveAggregation = useCallback((id: string) => {
    setGroupBy(prev => ({
      ...prev,
      aggregations: prev.aggregations.filter(a => a.id !== id)
    }));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft size={20} />
            </Button>
            <Logo size="sm" />
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium">{tableName}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Save size={16} />
              Save Query
            </Button>
            <Button variant="outline" size="sm">
              <Download size={16} />
              Export
            </Button>
            <Button variant="bus" size="sm">
              <Play size={16} />
              Run Query
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Operations */}
          <aside className="lg:col-span-3 space-y-4">
            <ColumnSelector
              columns={columns}
              selectedColumns={selectedColumns}
              onToggle={handleToggleColumn}
              onSelectAll={handleSelectAllColumns}
              onDeselectAll={handleDeselectAllColumns}
            />
            <FilterPanel
              columns={columns}
              filters={filters}
              onAddFilter={handleAddFilter}
              onUpdateFilter={handleUpdateFilter}
              onRemoveFilter={handleRemoveFilter}
            />
            <TransformPanel
              columns={columns}
              transforms={transforms}
              onAddTransform={handleAddTransform}
              onUpdateTransform={handleUpdateTransform}
              onRemoveTransform={handleRemoveTransform}
            />
          </aside>

          {/* Center - Results & Query */}
          <section className="lg:col-span-6 space-y-4">
            <ResultsPreview
              headers={columns}
              rows={rows}
              selectedColumns={selectedColumns}
            />
            <QueryPreview
              selectedColumns={selectedColumns}
              filters={filters}
              transforms={transforms}
              sorts={sorts}
              groupBy={groupBy}
              limit={limit}
              tableName={tableName}
            />
          </section>

          {/* Right Sidebar - GroupBy, Sort & Limit */}
          <aside className="lg:col-span-3 space-y-4">
            <GroupByPanel
              availableColumns={columns}
              groupBy={groupBy}
              onToggleGroupColumn={handleToggleGroupColumn}
              onAddAggregation={handleAddAggregation}
              onUpdateAggregation={handleUpdateAggregation}
              onRemoveAggregation={handleRemoveAggregation}
            />
            <SortPanel
              columns={columns}
              sorts={sorts}
              onAddSort={handleAddSort}
              onUpdateSort={handleUpdateSort}
              onRemoveSort={handleRemoveSort}
            />
            <LimitPanel
              limit={limit}
              totalRows={rows.length}
              onLimitChange={setLimit}
            />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default QueryBuilder;
