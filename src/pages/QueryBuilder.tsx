import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { OperationsSidebar, GroupByRule } from "@/components/QueryBuilder/OperationsSidebar";
import { FilterModal, FilterRule } from "@/components/QueryBuilder/FilterModal";
import { TransformModal, TransformRule } from "@/components/QueryBuilder/TransformModal";
import { SortModal, SortRule } from "@/components/QueryBuilder/SortModal";
import { AggregationModal, Aggregation } from "@/components/QueryBuilder/AggregationModal";
import { LimitModal } from "@/components/QueryBuilder/LimitModal";
import { SaveQueryModal } from "@/components/QueryBuilder/SaveQueryModal";
import { LoadQueryModal } from "@/components/QueryBuilder/LoadQueryModal";
import { CSVPreviewPanel } from "@/components/QueryBuilder/CSVPreviewPanel";
import { QueryPreview } from "@/components/QueryBuilder/QueryPreview";
import { Play, Save, FolderOpen } from "lucide-react";
import { SavedQuery } from "@/types/api";
import { queryService, savedQueriesService } from "@/services/api";
import { Operation, FilterOp, TransformOp, AggFunc } from "@/types/api";
import { toast } from "sonner";

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

  const [isLoading, setIsLoading] = useState(false);

  const [aggModalOpen, setAggModalOpen] = useState(false);
  const [editingAgg, setEditingAgg] = useState<Aggregation | null>(null);

  const [limitModalOpen, setLimitModalOpen] = useState(false);

  const [saveQueryModalOpen, setSaveQueryModalOpen] = useState(false);
  const [loadQueryModalOpen, setLoadQueryModalOpen] = useState(false);

  const tableName = (location.state?.tableName as string) || file?.name?.replace('.csv', '') || "uploaded_data";

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
  const handleRunQuery = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Executing query...");

    try {
      const operations: Operation[] = [];

      // 1. Filter
      filters.forEach(f => {
        operations.push({
          type: 'Filter',
          column: f.column,
          operator: f.operator as FilterOp, // Ensure case matches
          value: f.value
        });
      });

      // 2. Transform
      transforms.forEach(t => {
        operations.push({
          type: 'Transform',
          column: t.column,
          operation: t.operation as TransformOp,
          value: t.value,
          alias: t.alias
        });
      });

      // 3. Group By
      if (groupBy.columns.length > 0) {
        operations.push({
          type: 'GroupBy',
          columns: groupBy.columns,
          aggregations: groupBy.aggregations.map(agg => ({
            function: agg.function as AggFunc,
            column: agg.column,
            alias: agg.alias
          }))
        });
      }

      // 4. Sort
      sorts.forEach(s => {
        operations.push({
          type: 'Sort',
          column: s.column,
          ascending: s.ascending
        });
      });

      // 5. Select (Project) - logic: if grouped, select is implicit? usually comes last.
      // If no custom selection, select * (handled by backend usually, or we pass empty).
      // If we differ from backend's expectation, we might need a distinct Select op.
      if (selectedColumns.length > 0) {
        operations.push({ type: 'Select', columns: selectedColumns });
      }

      // 6. Limit
      if (limit) {
        operations.push({ type: 'Limit', count: limit });
      }

      // Execute
      const response = await queryService.executeQuery(operations);

      toast.dismiss(toastId);
      toast.success("Query executed successfully");

      // Transform rows object[] to string[][] for the results page
      const resultRows = response.rows.map(row =>
        response.columns.map(col => String(row[col] ?? ''))
      );

      navigate("/query-results", {
        state: {
          headers: response.columns,
          rows: resultRows,
          selectedColumns: response.columns, // Result columns are the selected ones
          tableName
        }
      });

    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Query execution failed");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save query handler
  const handleSaveQuery = useCallback(async (name: string, description: string) => {
    try {
      const operations: Operation[] = [];

      // Reconstruct operations (share logic with handleRunQuery or just duplicate for now)
      // 1. Filter
      filters.forEach(f => operations.push({ type: 'Filter', column: f.column, operator: f.operator as FilterOp, value: f.value }));
      // 2. Transform
      transforms.forEach(t => operations.push({ type: 'Transform', column: t.column, operation: t.operation as TransformOp, value: t.value, alias: t.alias }));
      // 3. Group By
      if (groupBy.columns.length > 0) {
        operations.push({
          type: 'GroupBy',
          columns: groupBy.columns,
          aggregations: groupBy.aggregations.map(agg => ({ function: agg.function as AggFunc, column: agg.column, alias: agg.alias }))
        });
      }
      // 4. Sort
      sorts.forEach(s => operations.push({ type: 'Sort', column: s.column, ascending: s.ascending }));
      // 5. Select
      if (selectedColumns.length > 0) operations.push({ type: 'Select', columns: selectedColumns });
      // 6. Limit
      if (limit) operations.push({ type: 'Limit', count: limit });

      await savedQueriesService.create(name, description, operations);
      toast.success("Query saved successfully!");
    } catch (error) {
      toast.error("Failed to save query");
      console.error(error);
    }
  }, [selectedColumns, filters, transforms, sorts, groupBy, limit]);

  // Load query handler
  const handleLoadQuery = useCallback((query: SavedQuery) => {
    // Reset defaults first (optional, or just overwrite)
    let newFilters: FilterRule[] = [];
    let newTransforms: TransformRule[] = [];
    let newSorts: SortRule[] = [];
    let newGroupBy: GroupByRule = { columns: [], aggregations: [] };
    let newLimit: number | null = null;
    let newSelectedColumns: string[] = [];

    // Parse operations
    query.query.forEach((op) => {
      switch (op.type) {
        case 'Filter':
          newFilters.push({ id: crypto.randomUUID(), column: op.column, operator: op.operator, value: op.value });
          break;
        case 'Transform':
          newTransforms.push({ id: crypto.randomUUID(), column: op.column, operation: op.operation, value: op.value, alias: op.alias });
          break;
        case 'Sort':
          newSorts.push({ id: crypto.randomUUID(), column: op.column, ascending: op.ascending });
          break;
        case 'GroupBy':
          newGroupBy = {
            columns: op.columns,
            aggregations: op.aggregations.map(agg => ({ id: crypto.randomUUID(), function: agg.function, column: agg.column, alias: agg.alias || '' }))
          };
          break;
        case 'Select':
          newSelectedColumns = op.columns;
          break;
        case 'Limit':
          newLimit = op.count;
          break;
      }
    });

    setFilters(newFilters);
    setTransforms(newTransforms);
    setSorts(newSorts);
    setGroupBy(newGroupBy);
    setLimit(newLimit);
    setSelectedColumns(newSelectedColumns.length > 0 ? newSelectedColumns : columns); // Default to all if none selected? Or respect empty.

    toast.success(`Loaded query: ${query.name}`);
  }, [columns]);

  return (
    <div className="min-h-screen bg-background">
      <Header showBack backTo="/">
        <Button variant="outline" size="sm" onClick={() => setLoadQueryModalOpen(true)}>
          <FolderOpen size={16} />
          Load Query
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSaveQueryModalOpen(true)}>
          <Save size={16} />
          Save Query
        </Button>
        <Button variant="bus" size="sm" onClick={handleRunQuery}>
          <Play size={16} />
          Run Query
        </Button>
      </Header>

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
              fileName={file?.name || "uploaded_data.csv"}
              fileSize={file?.size}
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

      <SaveQueryModal
        open={saveQueryModalOpen}
        onOpenChange={setSaveQueryModalOpen}
        onSave={handleSaveQuery}
      />

      <LoadQueryModal
        open={loadQueryModalOpen}
        onOpenChange={setLoadQueryModalOpen}
        currentColumns={columns}
        onLoad={handleLoadQuery}
      />
    </div>
  );
};

export default QueryBuilder;
