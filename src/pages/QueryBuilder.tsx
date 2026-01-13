import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { OperationsSidebar, GroupByRule } from "@/components/QueryBuilder/OperationsSidebar";
import { FilterModal, FilterRule, FilterOp } from "@/components/QueryBuilder/FilterModal";
import { TransformModal, TransformRule, TransformOp } from "@/components/QueryBuilder/TransformModal";
import { SortModal, SortRule } from "@/components/QueryBuilder/SortModal";
import { AggregationModal, Aggregation, AggFunc } from "@/components/QueryBuilder/AggregationModal";
import { LimitModal } from "@/components/QueryBuilder/LimitModal";
import { CSVPreviewPanel } from "@/components/QueryBuilder/CSVPreviewPanel";
import { QueryPreview } from "@/components/QueryBuilder/QueryPreview";
import { ArrowLeft, Play, Save } from "lucide-react";

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

  // Data state
  const [columns, setColumns] = useState<string[]>(mockColumns);
  const [rows, setRows] = useState<string[][]>(mockRows);
  
  // Query state
  const [selectedColumns, setSelectedColumns] = useState<string[]>(mockColumns);
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [transforms, setTransforms] = useState<TransformRule[]>([]);
  const [sorts, setSorts] = useState<SortRule[]>([]);
  const [groupBy, setGroupBy] = useState<GroupByRule>({ columns: [], aggregations: [] });
  const [limit, setLimit] = useState<number | null>(null);

  // Modal state
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<FilterRule | null>(null);
  
  const [transformModalOpen, setTransformModalOpen] = useState(false);
  const [editingTransform, setEditingTransform] = useState<TransformRule | null>(null);
  
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [editingSort, setEditingSort] = useState<SortRule | null>(null);
  
  const [aggModalOpen, setAggModalOpen] = useState(false);
  const [editingAgg, setEditingAgg] = useState<Aggregation | null>(null);
  
  const [limitModalOpen, setLimitModalOpen] = useState(false);

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
  const handleSaveFilter = useCallback((filter: FilterRule) => {
    setFilters(prev => {
      const exists = prev.find(f => f.id === filter.id);
      if (exists) {
        return prev.map(f => f.id === filter.id ? filter : f);
      }
      return [...prev, filter];
    });
    setEditingFilter(null);
  }, []);

  const handleRemoveFilter = useCallback((id: string) => {
    setFilters(prev => prev.filter(f => f.id !== id));
  }, []);

  // Transform handlers
  const handleSaveTransform = useCallback((transform: TransformRule) => {
    setTransforms(prev => {
      const exists = prev.find(t => t.id === transform.id);
      if (exists) {
        return prev.map(t => t.id === transform.id ? transform : t);
      }
      return [...prev, transform];
    });
    setEditingTransform(null);
  }, []);

  const handleRemoveTransform = useCallback((id: string) => {
    setTransforms(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sort handlers
  const handleSaveSort = useCallback((sort: SortRule) => {
    setSorts(prev => {
      const exists = prev.find(s => s.id === sort.id);
      if (exists) {
        return prev.map(s => s.id === sort.id ? sort : s);
      }
      return [...prev, sort];
    });
    setEditingSort(null);
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

  const handleSaveAggregation = useCallback((agg: Aggregation) => {
    setGroupBy(prev => {
      const exists = prev.aggregations.find(a => a.id === agg.id);
      if (exists) {
        return {
          ...prev,
          aggregations: prev.aggregations.map(a => a.id === agg.id ? agg : a)
        };
      }
      return {
        ...prev,
        aggregations: [...prev.aggregations, agg]
      };
    });
    setEditingAgg(null);
  }, []);

  const handleRemoveAggregation = useCallback((id: string) => {
    setGroupBy(prev => ({
      ...prev,
      aggregations: prev.aggregations.filter(a => a.id !== id)
    }));
  }, []);

  // Run query - navigate to results page
  const handleRunQuery = useCallback(() => {
    navigate("/query-results", {
      state: {
        headers: columns,
        rows,
        selectedColumns,
        tableName
      }
    });
  }, [navigate, columns, rows, selectedColumns, tableName]);

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
            <Button variant="bus" size="sm" onClick={handleRunQuery}>
              <Play size={16} />
              Run Query
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - All Operations */}
          <aside className="lg:col-span-3">
            <OperationsSidebar
              columns={columns}
              selectedColumns={selectedColumns}
              onToggleColumn={handleToggleColumn}
              onSelectAllColumns={handleSelectAllColumns}
              onDeselectAllColumns={handleDeselectAllColumns}
              filters={filters}
              onAddFilter={() => { setEditingFilter(null); setFilterModalOpen(true); }}
              onEditFilter={(f) => { setEditingFilter(f); setFilterModalOpen(true); }}
              onRemoveFilter={handleRemoveFilter}
              transforms={transforms}
              onAddTransform={() => { setEditingTransform(null); setTransformModalOpen(true); }}
              onEditTransform={(t) => { setEditingTransform(t); setTransformModalOpen(true); }}
              onRemoveTransform={handleRemoveTransform}
              sorts={sorts}
              onAddSort={() => { setEditingSort(null); setSortModalOpen(true); }}
              onEditSort={(s) => { setEditingSort(s); setSortModalOpen(true); }}
              onRemoveSort={handleRemoveSort}
              groupBy={groupBy}
              onToggleGroupColumn={handleToggleGroupColumn}
              onAddAggregation={() => { setEditingAgg(null); setAggModalOpen(true); }}
              onEditAggregation={(a) => { setEditingAgg(a); setAggModalOpen(true); }}
              onRemoveAggregation={handleRemoveAggregation}
              limit={limit}
              totalRows={rows.length}
              onEditLimit={() => setLimitModalOpen(true)}
              onClearLimit={() => setLimit(null)}
            />
          </aside>

          {/* Center - CSV Preview, Query Preview & Results */}
          <section className="lg:col-span-9 space-y-4">
            <CSVPreviewPanel
              headers={columns}
              rows={rows}
              fileName={tableName}
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
        </div>
      </main>

      {/* Modals */}
      <FilterModal
        open={filterModalOpen}
        onOpenChange={setFilterModalOpen}
        columns={columns}
        filter={editingFilter}
        onSave={handleSaveFilter}
      />

      <TransformModal
        open={transformModalOpen}
        onOpenChange={setTransformModalOpen}
        columns={columns}
        transform={editingTransform}
        onSave={handleSaveTransform}
      />

      <SortModal
        open={sortModalOpen}
        onOpenChange={setSortModalOpen}
        columns={columns}
        sort={editingSort}
        onSave={handleSaveSort}
      />

      <AggregationModal
        open={aggModalOpen}
        onOpenChange={setAggModalOpen}
        columns={columns}
        aggregation={editingAgg}
        onSave={handleSaveAggregation}
      />

      <LimitModal
        open={limitModalOpen}
        onOpenChange={setLimitModalOpen}
        limit={limit}
        totalRows={rows.length}
        onSave={setLimit}
      />
    </div>
  );
};

export default QueryBuilder;
