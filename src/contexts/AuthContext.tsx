import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/api';
import { AuthResponse } from '@/types/api';

interface User {
    id: string;
    email: string;
    total_queries: number;
    total_files_processed: number;
    total_saved_queries: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // CRITICAL: Token is stored in MEMORY (React State)
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = localStorage.getItem('auth_token');
                const storedUser = localStorage.getItem('auth_user');

                if (storedToken && storedUser) {
                    // 1. Optimistically set state to avoid flicker
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));

                    // 2. Validate with backend and fetch fresh user data
                    try {
                        const { userService } = await import('@/services/api');
                        const freshProfile = await userService.getProfile();

                        // Update user state with fresh data from backend
                        const updatedUser: User = {
                            id: freshProfile.id,
                            email: freshProfile.email,
                            total_queries: freshProfile.total_queries || 0,
                            total_files_processed: freshProfile.total_files_processed || 0,
                            total_saved_queries: freshProfile.total_saved_queries || 0,
                        };

                        setUser(updatedUser);
                        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
                    } catch (validationError) {
                        console.error("Token validation failed:", validationError);
                        // Invalid token or server down -> Logout
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('auth_user');
                        setToken(null);
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error("Failed to rehydrate session:", error);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);

        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('auth_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);

        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        authService.logout();
    };

    const value = {
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
