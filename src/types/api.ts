export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        total_queries: number;
        total_files_processed: number;
        total_saved_queries: number;
    };
}

export interface QueryResponse {
    columns: string[];
    rows: Record<string, any>[];
}

export interface SavedQuery {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    query: Operation[];
    created_at: string;
    updated_at: string;
}

export type Operation =
    | { type: 'Select'; columns: string[] }
    | { type: 'Filter'; column: string; operator: FilterOp; value: string }
    | { type: 'GroupBy'; columns: string[]; aggregations: Aggregation[] }
    | { type: 'Sort'; column: string; ascending: boolean }
    | { type: 'Limit'; count: number }
    | { type: 'Transform'; column: string; operation: TransformOp; value: number; alias: string };

export type FilterOp = 'Eq' | 'Ne' | 'Gt' | 'Ge' | 'Lt' | 'Le' | 'Contains';
export type AggFunc = 'Sum' | 'Avg' | 'Max' | 'Min' | 'Count';
export type TransformOp = 'Multiply' | 'Divide' | 'Add' | 'Subtract';

export interface Aggregation {
    function: AggFunc;
    column: string;
    alias?: string;
}
