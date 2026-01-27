import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

export const QueryBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const file = location.state?.file as File | null;

  // Data state - initialize empty, will be populated from file or localStorage
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [totalRowCount, setTotalRowCount] = useState(0);

  // Query state
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
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
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [aggModalOpen, setAggModalOpen] = useState(false);
  const [editingAgg, setEditingAgg] = useState<Aggregation | null>(null);

  const [limitModalOpen, setLimitModalOpen] = useState(false);

  const [saveQueryModalOpen, setSaveQueryModalOpen] = useState(false);
  const [loadQueryModalOpen, setLoadQueryModalOpen] = useState(false);

  // Get table name - REQUIRED for all backend operations
  // Priority: navigation state > localStorage
  const rawTableName = location.state?.tableName || localStorage.getItem('current_table_name');

  // Get file name for display
  const fileName = location.state?.fileName || localStorage.getItem('current_file_name') || file?.name || "uploaded_data.csv";

  // Handle object format from backend (defensive)
  const tableName = rawTableName && typeof rawTableName === 'object' && rawTableName !== null
    ? (rawTableName.table_name || null)
    : rawTableName;

  // Redirect to dashboard if no table name available
  useEffect(() => {
    if (!tableName) {
      toast.error("No table selected. Please upload a file or select from recent files.");
      navigate("/");
    }
  }, [tableName, navigate]);

  // Persist table name to localStorage when it changes
  useEffect(() => {
    if (tableName) {
      localStorage.setItem('current_table_name', tableName);
    }
    if (fileName && fileName !== "uploaded_data.csv") {
      localStorage.setItem('current_file_name', fileName);
    }
  }, [tableName, fileName]);

  // Derived state: columns available for different operations
  // Mimics backend execution order: Filter -> Transform -> GroupBy -> Sort

  // 1. Filter: Runs first, so it sees only initial columns
  const columnsForFilter = columns;

  // 2. Transform: Runs after Filter. Can define new columns.
  // We allow transforms to potentially reference other transforms (if backend supports execution order),
  // so we show all transformed columns here.
  const columnsWithTransforms = useMemo(() => {
    const cols = [...columns];
    transforms.forEach(t => {
      // Additive operation: df.with_column()
      if (t.alias && !cols.includes(t.alias)) {
        cols.push(t.alias);
      }
    });
    return cols;
  }, [columns, transforms]);

  // Transform: Can operate on columns available at its execution point
  // If GroupBy is active, only group keys + aggregations exist
  // Otherwise, all original + transformed columns are available
  const columnsForTransform = useMemo(() => {
    const isGroupedOrAggregated = groupBy.columns.length > 0 || groupBy.aggregations.length > 0;

    if (isGroupedOrAggregated) {
      const groupCols = groupBy.columns;
      const aggAliases = groupBy.aggregations.map(a => a.alias).filter(Boolean) as string[];
      return Array.from(new Set([...groupCols, ...aggAliases]));
    }

    // If no grouping, all original + transformed columns are available
    return columnsWithTransforms;
  }, [columnsWithTransforms, groupBy]);
  const columnsForGroupBy = columnsWithTransforms;

  // 3. GroupBy: Destructive operation.
  // If active (either grouping or aggregating), it reduces the dataset to strict Group Keys + Aggregations.
  // Post-GroupBy transforms (transforms on aggregations) are also valid output columns.
  const columnsForSortAndSelect = useMemo(() => {
    const isGroupedOrAggregated = groupBy.columns.length > 0 || groupBy.aggregations.length > 0;

    if (isGroupedOrAggregated) {
      const groupCols = groupBy.columns;
      // Aggregations NOW strictly have aliases (enforced by AggregationModal)
      const aggCols = groupBy.aggregations.map(a => a.alias).filter(Boolean) as string[];

      // Post-GroupBy transforms: transforms that operate on aggregation results
      const aggAliasesLower = aggCols.map(a => a.toLowerCase());
      const postGroupTransforms = transforms
        .filter(t => aggAliasesLower.includes(t.column.toLowerCase()))
        .map(t => t.alias)
        .filter(Boolean) as string[];

      return Array.from(new Set([...groupCols, ...aggCols, ...postGroupTransforms]));
    }
    // If no grouping/aggregation, Sort/Select sees all transformed columns
    return columnsWithTransforms;
  }, [columnsWithTransforms, groupBy, transforms]);

  // Parse actual file if provided OR load from URL if fileLink provided
  useEffect(() => {
    const fileLink = location.state?.fileLink as string | null;

    if (file) {
      setIsLoadingData(true);
      // Load from local file upload
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Optimization: Only process needed lines
        const allLines = text.split('\n');
        const totalLines = allLines.filter(line => line.trim()).length - 1; // Subtract header
        const previewLines = allLines.slice(0, 101).filter(line => line.trim()); // Header + 100 rows

        if (previewLines.length > 0) {
          const parsedHeaders = previewLines[0].split(',').map(h => h.trim().replace(/"/g, '')).filter(h => h && h.trim());
          setColumns(parsedHeaders);
          setSelectedColumns(parsedHeaders);

          const dataRows = previewLines.slice(1).map(line =>
            line.split(',').map(cell => cell.trim().replace(/"/g, ''))
          );
          setRows(dataRows);
          setTotalRowCount(Math.max(0, totalLines));

          // Persist to localStorage
          localStorage.setItem('csv_columns', JSON.stringify(parsedHeaders));
          localStorage.setItem('csv_rows', JSON.stringify(dataRows));
          localStorage.setItem('csv_total_rows', Math.max(0, totalLines).toString());
        }
        setIsLoadingData(false);
      };
      reader.readAsText(file);
    } else if (fileLink) {
      setIsLoadingData(true);
      // Load from presigned URL (saved file)
      fetch(fileLink)
        .then(response => {
          // Check if response is OK
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(text => {
          // Check if response is XML error (expired presigned URL)
          if (text.trim().startsWith('<?xml') || text.includes('<Error>')) {
            throw new Error('The file link has expired. Please select the file again from Recent Files.');
          }

          const allLines = text.split('\n');
          const totalLines = allLines.filter(line => line.trim()).length - 1;
          const previewLines = allLines.slice(0, 101).filter(line => line.trim());

          if (previewLines.length > 0) {
            const parsedHeaders = previewLines[0].split(',').map(h => h.trim().replace(/"/g, '')).filter(h => h && h.trim());
            setColumns(parsedHeaders);
            setSelectedColumns(parsedHeaders);

            const dataRows = previewLines.slice(1).map(line =>
              line.split(',').map(cell => cell.trim().replace(/"/g, ''))
            );
            setRows(dataRows);
            setTotalRowCount(Math.max(0, totalLines));

            // Persist to localStorage
            localStorage.setItem('csv_columns', JSON.stringify(parsedHeaders));
            localStorage.setItem('csv_rows', JSON.stringify(dataRows));
            localStorage.setItem('csv_total_rows', Math.max(0, totalLines).toString());
          }
          setIsLoadingData(false);
        })
        .catch(error => {
          console.error('Failed to load CSV from URL:', error);
          toast.error(error.message || 'Failed to load CSV file. Redirecting to dashboard...');
          setIsLoadingData(false);

          // Clear expired data from localStorage
          localStorage.removeItem('csv_columns');
          localStorage.removeItem('csv_rows');
          localStorage.removeItem('csv_total_rows');
          localStorage.removeItem('current_file_name');

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/');
          }, 2000);
        });
    } else {
      // Try to restore from localStorage if no file provided
      const storedColumns = localStorage.getItem('csv_columns');
      const storedRows = localStorage.getItem('csv_rows');
      const storedTotalRows = localStorage.getItem('csv_total_rows');

      if (storedColumns && storedRows) {
        try {
          const parsedColumns = JSON.parse(storedColumns).filter((col: string) => col && col.trim());
          const parsedRows = JSON.parse(storedRows);
          setColumns(parsedColumns);
          setRows(parsedRows);
          setTotalRowCount(storedTotalRows ? parseInt(storedTotalRows) : parsedRows.length);
          setSelectedColumns(parsedColumns);
        } catch (e) {
          console.error('Failed to restore CSV data from localStorage:', e);
        }
      }
    }
  }, [file, location.state?.fileLink]);

  // Column handlers
  const handleToggleColumn = useCallback((column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  }, []);

  // Initial selection logic must respect this too
  const handleSelectAllColumns = useCallback(() => {
    setSelectedColumns(columnsForSortAndSelect);
  }, [columnsForSortAndSelect]);

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

    // Auto-select the new transform alias column (moved outside state updater)
    if (transform.alias) {
      setSelectedColumns(prevSelected =>
        prevSelected.includes(transform.alias) ? prevSelected : [...prevSelected, transform.alias]
      );
    }

    setEditingTransform(null);
  }, []);

  const handleRemoveTransform = useCallback((id: string) => {
    const transformToRemove = transforms.find(t => t.id === id);
    if (transformToRemove?.alias) {
      setSelectedColumns(prev => prev.filter(col => col !== transformToRemove.alias));
    }
    setTransforms(prev => prev.filter(t => t.id !== id));
  }, [transforms]);

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

    // Auto-select the new aggregation alias column
    if (agg.alias) {
      setSelectedColumns(prevSelected =>
        prevSelected.includes(agg.alias!) ? prevSelected : [...prevSelected, agg.alias!]
      );
    }

    setEditingAgg(null);
  }, []);

  const handleRemoveAggregation = useCallback((id: string) => {
    const aggToRemove = groupBy.aggregations.find(a => a.id === id);
    if (aggToRemove?.alias) {
      setSelectedColumns(prev => prev.filter(col => col !== aggToRemove.alias));
    }
    setGroupBy(prev => ({
      ...prev,
      aggregations: prev.aggregations.filter(a => a.id !== id)
    }));
  }, [groupBy]);


  // Run query - navigate to results page
  const handleRunQuery = async () => {
    // Validate GroupBy has at least one aggregation
    if (groupBy.columns.length > 0 && groupBy.aggregations.length === 0) {
      toast.error("GroupBy requires at least one aggregation function");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Executing query...");

    try {
      const operations: Operation[] = [];

      // 1. Filter (normalize column names to lowercase)
      filters.forEach(f => {
        operations.push({
          type: 'Filter',
          column: f.column.toLowerCase(),
          operator: f.operator as FilterOp,
          value: f.value
        });
      });

      // 2. Pre-Group Transforms (normalize to lowercase)
      // We process transforms that do NOT depend on Aggregation Aliases here.
      const aggAliases = groupBy.aggregations.map(a => a.alias?.toLowerCase()).filter(Boolean);

      const preGroupTransforms = transforms.filter(t => !aggAliases.includes(t.column.toLowerCase()));
      const postGroupTransforms = transforms.filter(t => aggAliases.includes(t.column.toLowerCase()));

      preGroupTransforms.forEach(t => {
        operations.push({
          type: 'Transform',
          column: t.column.toLowerCase(),
          operation: t.operation as TransformOp,
          value: t.value,
          alias: t.alias?.toLowerCase()
        });
      });

      // 3. Group By (normalize column names to lowercase)
      if (groupBy.columns.length > 0) {
        operations.push({
          type: 'GroupBy',
          columns: groupBy.columns.map(col => col.toLowerCase()),
          aggregations: groupBy.aggregations.map(agg => ({
            function: agg.function as AggFunc,
            column: agg.column.toLowerCase(),
            alias: agg.alias?.toLowerCase()
          }))
        });
      }

      // 4. Post-Group Transforms (normalize column names to lowercase)
      // Transforms that operate on Aggregated Columns must run AFTER GroupBy
      postGroupTransforms.forEach(t => {
        operations.push({
          type: 'Transform',
          column: t.column.toLowerCase(),
          operation: t.operation as TransformOp,
          value: t.value,
          alias: t.alias?.toLowerCase()
        });
      });

      // 4. Sort (normalize column names to lowercase)
      sorts.forEach(s => {
        operations.push({
          type: 'Sort',
          column: s.column.toLowerCase(),
          ascending: s.ascending
        });
      });

      // 5. Select (normalize column names to lowercase)
      // CRITICAL: After GroupBy, only grouped columns + aggregations exist
      // Filter selectedColumns to only include columns that still exist
      if (selectedColumns.length > 0) {
        const validColumns = selectedColumns.filter(col =>
          columnsForSortAndSelect.includes(col)
        );

        if (validColumns.length > 0) {
          operations.push({ type: 'Select', columns: validColumns.map(col => col.toLowerCase()) });
        }
      }

      // 6. Limit
      if (limit) {
        operations.push({ type: 'Limit', count: limit });
      }

      // Execute
      console.log('Final operations payload:', JSON.stringify(operations, null, 2));
      const response = await queryService.executeQuery(operations, tableName);
      console.log('Backend response:', response);
      console.log('Response columns:', response.columns);
      console.log('First row:', response.rows[0]);
      console.log('First row keys:', response.rows[0] ? Object.keys(response.rows[0]) : 'no rows');

      toast.dismiss(toastId);
      toast.success("Query executed successfully");

      // Backend returns rows as arrays, not objects
      // Map by index since row[i] corresponds to response.columns[i]
      const resultRows = response.rows.map((row: any[]) =>
        row.map(cell => String(cell ?? ''))
      );

      console.log('Mapped first result row:', resultRows[0]);
      console.log('Total result rows:', resultRows.length);

      // Create a mapping from lowercase to original casing
      const lowerToOriginal = new Map<string, string>();
      columns.forEach(col => {
        lowerToOriginal.set(col.toLowerCase(), col);
      });

      // Also map any aggregation aliases (they're already lowercase, keep as-is)
      groupBy.aggregations.forEach(agg => {
        if (agg.alias) {
          lowerToOriginal.set(agg.alias.toLowerCase(), agg.alias);
        }
      });

      // Map backend's lowercase columns to original casing for display
      const displayHeaders = response.columns.map(col =>
        lowerToOriginal.get(col) || col
      );

      console.log('Display headers:', displayHeaders);

      navigate("/query-results", {
        state: {
          headers: displayHeaders,
          rows: resultRows,
          selectedColumns: displayHeaders,
          tableName,
          queryMetadata: {
            hasGroupBy: groupBy.columns.length > 0,
            groupByColumns: groupBy.columns,
            aggregationColumns: groupBy.aggregations.map(a => a.alias).filter(Boolean) as string[],
            isAggregated: groupBy.aggregations.length > 0
          }
        }
      });

    } catch (error: any) {
      toast.dismiss(toastId);

      // Extract actual error message from backend
      const errorMessage = error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Query execution failed";

      toast.error(errorMessage);
      console.error('Query execution error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save query handler
  const handleSaveQuery = useCallback(async (name: string, description: string) => {
    // Validate GroupBy has at least one aggregation
    if (groupBy.columns.length > 0 && groupBy.aggregations.length === 0) {
      toast.error("GroupBy requires at least one aggregation function");
      return;
    }

    // Validate Aggregation requires at least one grouping column (Rear Added)
    if (groupBy.aggregations.length > 0 && groupBy.columns.length === 0) {
      toast.error("Aggregation requires at least one grouping column");
      return;
    }

    try {
      const operations: Operation[] = [];

      // Reconstruct operations with lowercase column names

      // 1. Filter
      filters.forEach(f => operations.push({ type: 'Filter', column: f.column.toLowerCase(), operator: f.operator as FilterOp, value: f.value }));

      // 2. Pre-Group Transforms
      const aggAliases = groupBy.aggregations.map(a => a.alias?.toLowerCase()).filter(Boolean);
      const preGroupTransforms = transforms.filter(t => !aggAliases.includes(t.column.toLowerCase()));
      const postGroupTransforms = transforms.filter(t => aggAliases.includes(t.column.toLowerCase()));

      preGroupTransforms.forEach(t => operations.push({ type: 'Transform', column: t.column.toLowerCase(), operation: t.operation as TransformOp, value: t.value, alias: t.alias?.toLowerCase() }));

      // 3. Group By
      if (groupBy.columns.length > 0) {
        operations.push({
          type: 'GroupBy',
          columns: groupBy.columns.map(col => col.toLowerCase()),
          aggregations: groupBy.aggregations.map(agg => ({ function: agg.function as AggFunc, column: agg.column.toLowerCase(), alias: agg.alias?.toLowerCase() }))
        });
      }

      // 4. Post-Group Transforms
      postGroupTransforms.forEach(t => operations.push({ type: 'Transform', column: t.column.toLowerCase(), operation: t.operation as TransformOp, value: t.value, alias: t.alias?.toLowerCase() }));

      // 4. Sort
      sorts.forEach(s => operations.push({ type: 'Sort', column: s.column.toLowerCase(), ascending: s.ascending }));

      // 5. Select - filter to only valid columns after GroupBy
      if (selectedColumns.length > 0) {
        // Calculate valid columns (use centralized logic)
        const validColumns = selectedColumns.filter(col => columnsForSortAndSelect.includes(col));

        if (validColumns.length > 0) {
          operations.push({ type: 'Select', columns: validColumns.map(col => col.toLowerCase()) });
        }
      }

      // 6. Limit
      if (limit) operations.push({ type: 'Limit', count: limit });

      await savedQueriesService.create(name, description, operations);
      toast.success("Query saved successfully!");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save query";
      toast.error(errorMessage);
      console.error('Save query error:', error);
    }
  }, [selectedColumns, filters, transforms, sorts, groupBy, limit, columnsForSortAndSelect]);

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
        <Button variant="outline" size="sm" onClick={() => setLoadQueryModalOpen(true)} disabled={isLoading}>
          <FolderOpen size={16} />
          Load Query
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSaveQueryModalOpen(true)} disabled={isLoading}>
          <Save size={16} />
          Save Query
        </Button>
        <Button variant="bus" size="sm" onClick={handleRunQuery} disabled={isLoading}>
          <Play size={16} />
          {isLoading ? 'Running...' : 'Run Query'}
        </Button>
      </Header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Operations */}
          <aside className="lg:col-span-3">
            {isLoadingData ? (
              <div className="query-panel space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-8 w-3/4 mt-6" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-8 w-3/4 mt-6" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <OperationsSidebar
                columns={columnsForGroupBy}
                availableColumns={columnsForSortAndSelect}
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
                totalRows={totalRowCount}
                onEditLimit={() => setLimitModalOpen(true)}
                onClearLimit={() => setLimit(null)}
              />
            )}
          </aside>

          {/* Center - CSV Preview, Query Preview & Results */}
          <section className="lg:col-span-9 space-y-4">
            {isLoadingData ? (
              <div className="query-panel space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            ) : (
              <>
                <CSVPreviewPanel
                  headers={columns}
                  rows={rows}
                  fileName={fileName}
                  fileSize={file?.size}
                  totalRowCount={totalRowCount}
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
              </>
            )}
          </section>
        </div>
      </main>

      {/* Modals */}
      <FilterModal
        open={filterModalOpen}
        onOpenChange={setFilterModalOpen}
        columns={columnsForFilter}
        filter={editingFilter}
        onSave={handleSaveFilter}
      />

      <TransformModal
        open={transformModalOpen}
        onOpenChange={setTransformModalOpen}
        columns={columnsForTransform}
        originalColumns={columns}
        transform={editingTransform}
        onSave={handleSaveTransform}
      />

      <SortModal
        open={sortModalOpen}
        onOpenChange={setSortModalOpen}
        columns={columnsForSortAndSelect}
        originalColumns={columns}
        sort={editingSort}
        onSave={handleSaveSort}
      />

      <AggregationModal
        open={aggModalOpen}
        onOpenChange={setAggModalOpen}
        columns={columnsForGroupBy}
        aggregation={editingAgg}
        onSave={handleSaveAggregation}
      />

      <LimitModal
        open={limitModalOpen}
        onOpenChange={setLimitModalOpen}
        limit={limit}
        totalRows={totalRowCount}
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
