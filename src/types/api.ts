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

export interface UploadResponse {
    table_name: string;
    file_name: string;
    file_size: number;
    file_link: string;
    success: boolean;
}

export interface Upload {
    id: string;           // UUID
    user_id: string;      // UUID
    file_name: string;    // Original filename
    s3_key: string;       // S3 storage key (without s3:// prefix)
    file_size: number;    // Size in bytes
    file_type: string;    // MIME type
    table_name: string;   // DataFusion table name
    created_at: string;   // ISO 8601 timestamp
    updated_at: string;   // ISO 8601 timestamp
    file_link: string | null;  // Presigned URL for CSV download
}

export interface PaginatedResponse<T> {
    data: T[];           // Array of records
    total: number;       // Total number of records
    page: number;        // Current page number
    page_size: number;   // Items per page
    total_pages: number; // Total number of pages
}

export interface PaginationParams {
    page?: number;       // Default: 1, Min: 1
    page_size?: number;  // Default: 10, Min: 1, Max: 100
}
