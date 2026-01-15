import { api } from '@/lib/axios';
import {
    AuthResponse,
    QueryResponse,
    SavedQuery,
    Operation
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

        const response = await api.post<string>('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

export const queryService = {
    executeQuery: async (operations: Operation[]): Promise<QueryResponse> => {
        const response = await api.post<QueryResponse>('/query', { operations });
        return response.data;
    },

    downloadQueryCSV: async (operations: Operation[], filename = 'query_results.csv'): Promise<void> => {
        const response = await api.post('/query/download', { operations }, {
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
