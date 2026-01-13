import { FilterRule } from "@/components/QueryBuilder/FilterModal";
import { TransformRule } from "@/components/QueryBuilder/TransformModal";
import { SortRule } from "@/components/QueryBuilder/SortModal";
import { GroupByRule } from "@/components/QueryBuilder/OperationsSidebar";

export interface SavedQuery {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  selectedColumns: string[];
  filters: FilterRule[];
  transforms: TransformRule[];
  sorts: SortRule[];
  groupBy: GroupByRule;
  limit: number | null;
  // Store original columns for validation
  originalColumns: string[];
}

const STORAGE_KEY = "doubledecker_saved_queries";

export const getSavedQueries = (): SavedQuery[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveQuery = (query: Omit<SavedQuery, "id" | "createdAt" | "updatedAt">): SavedQuery => {
  const queries = getSavedQueries();
  const newQuery: SavedQuery = {
    ...query,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  queries.unshift(newQuery);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
  return newQuery;
};

export const updateQuery = (id: string, updates: Partial<SavedQuery>): SavedQuery | null => {
  const queries = getSavedQueries();
  const index = queries.findIndex(q => q.id === id);
  if (index === -1) return null;
  
  queries[index] = {
    ...queries[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
  return queries[index];
};

export const deleteQuery = (id: string): boolean => {
  const queries = getSavedQueries();
  const filtered = queries.filter(q => q.id !== id);
  if (filtered.length === queries.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

export interface QueryValidationResult {
  isValid: boolean;
  missingColumns: string[];
  warnings: string[];
}

export const validateQueryAgainstColumns = (
  query: SavedQuery,
  currentColumns: string[]
): QueryValidationResult => {
  const missingColumns: string[] = [];
  const warnings: string[] = [];
  const currentColumnsSet = new Set(currentColumns);

  // Check selected columns
  query.selectedColumns.forEach(col => {
    if (!currentColumnsSet.has(col)) {
      missingColumns.push(col);
    }
  });

  // Check filter columns
  query.filters.forEach(filter => {
    if (!currentColumnsSet.has(filter.column)) {
      if (!missingColumns.includes(filter.column)) {
        missingColumns.push(filter.column);
      }
    }
  });

  // Check transform columns
  query.transforms.forEach(transform => {
    if (!currentColumnsSet.has(transform.column)) {
      if (!missingColumns.includes(transform.column)) {
        missingColumns.push(transform.column);
      }
    }
  });

  // Check sort columns
  query.sorts.forEach(sort => {
    if (!currentColumnsSet.has(sort.column)) {
      if (!missingColumns.includes(sort.column)) {
        missingColumns.push(sort.column);
      }
    }
  });

  // Check group by columns
  query.groupBy.columns.forEach(col => {
    if (!currentColumnsSet.has(col)) {
      if (!missingColumns.includes(col)) {
        missingColumns.push(col);
      }
    }
  });

  // Check aggregation columns
  query.groupBy.aggregations.forEach(agg => {
    if (!currentColumnsSet.has(agg.column)) {
      if (!missingColumns.includes(agg.column)) {
        missingColumns.push(agg.column);
      }
    }
  });

  if (missingColumns.length > 0) {
    warnings.push(`The following columns from the saved query are not present in the current CSV: ${missingColumns.join(", ")}`);
  }

  return {
    isValid: missingColumns.length === 0,
    missingColumns,
    warnings,
  };
};
