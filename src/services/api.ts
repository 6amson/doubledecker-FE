import { api } from '@/lib/axios';
import {
    AuthResponse,
    QueryResponse,
    SavedQuery,
    Operation,
    Upload,
    PaginatedResponse,
    PaginationParams,
    UploadResponse
} from '@/types/api';

export const authService = {
    signup: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/signup', { email, password });
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data;
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('auth_token');
    },
};

export const fileService = {
    uploadCSV: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<string | { table_name: string }>('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Handle if backend returns object { table_name: "..." } or text string
        const data = response.data;
        if (typeof data === 'object' && 'table_name' in data) {
            return (data as { table_name: string }).table_name;
        }
        return String(data);
    },
};

export const queryService = {
    executeQuery: async (operations: Operation[], table_name?: string): Promise<QueryResponse> => {
        const response = await api.post<QueryResponse>('/query', { table_name, operations });
        return response.data;
    },

    downloadQueryCSV: async (operations: Operation[], table_name?: string, filename = 'query_results.csv'): Promise<void> => {
        const response = await api.post('/query/download', { table_name, operations }, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
};

export const savedQueriesService = {
    create: async (name: string, description: string | null, query: Operation[]): Promise<SavedQuery> => {
        const response = await api.post<SavedQuery>('/saved_queries', { name, description, query });
        return response.data;
    },

    list: async (): Promise<SavedQuery[]> => {
        const response = await api.get<SavedQuery[]>('/saved_queries');
        return response.data;
    },

    get: async (id: string): Promise<SavedQuery> => {
        const response = await api.get<SavedQuery>(`/saved_queries/${id}`);
        return response.data;
    },

    update: async (id: string, name: string, description: string | null, query: Operation[]): Promise<SavedQuery> => {
        const response = await api.put<SavedQuery>(`/saved_queries/${id}`, { name, description, query });
        return response.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/saved_queries/${id}`);
        return response.data;
    },
};

export const uploadsService = {
    getRecentUploads: async (params?: PaginationParams): Promise<PaginatedResponse<Upload>> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

        const url = `/uploads${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await api.get<PaginatedResponse<Upload>>(url);
        return response.data;
    },

    deleteUpload: async (id: string): Promise<void> => {
        await api.delete(`/uploads/${id}`);
    },
};

export const userService = {
    getProfile: async () => {
        const response = await api.get('/profile');
        return response.data;
    },
};
