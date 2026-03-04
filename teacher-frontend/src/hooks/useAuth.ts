import { useState, useEffect, useCallback } from 'react';
import { processSSOLogin } from '../lib/sso';

const TOKEN_KEY = 'teacher_token';
const REFRESH_KEY = 'teacher_refresh_token';

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, refreshToken?: string) => void;
    logout: () => void;
}

export function useAuth(): AuthState {
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem(TOKEN_KEY));
    const [isLoading, setIsLoading] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return !!params.get('sso_code');
    });

    const login = useCallback((token: string, refreshToken?: string) => {
        localStorage.setItem(TOKEN_KEY, token);
        if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        setIsAuthenticated(false);
    }, []);

    // SSO callback 처리
    useEffect(() => {
        processSSOLogin().then((tokens) => {
            if (tokens) {
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        });
    }, []);

    return { isAuthenticated, isLoading, login, logout };
}
