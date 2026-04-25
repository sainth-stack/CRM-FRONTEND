import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './AuthContext';
import API_BASE_URL from '../config';

const ACCESS_TOKEN_STORAGE_KEY = 'token';
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY));
    const [hasMailbox, setHasMailbox] = useState(false);
    const [mailboxHealth, setMailboxHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const refreshTimeoutRef = useRef(null);
    const refreshPromiseRef = useRef(null);

    // Synchronize global axios headers with the mission-critical token
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const clearRefreshTimer = useCallback(() => {
        if (refreshTimeoutRef.current) {
            window.clearTimeout(refreshTimeoutRef.current);
            refreshTimeoutRef.current = null;
        }
    }, []);

    const logout = useCallback(() => {
        clearRefreshTimer();
        refreshPromiseRef.current = null;
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
        setHasMailbox(false);
        setMailboxHealth(null);
    }, [clearRefreshTimer]);

    const persistAccessToken = useCallback((accessToken) => {
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
        setToken(accessToken);
        return accessToken;
    }, []);

    const persistSession = useCallback((accessToken, refreshToken = null) => {
        persistAccessToken(accessToken);
        if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
        }
    }, [persistAccessToken]);

    const refreshAccessToken = useCallback(async () => {
        if (refreshPromiseRef.current) {
            return refreshPromiseRef.current;
        }

        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
        if (!storedRefreshToken) {
            throw new Error('Refresh session unavailable.');
        }

        refreshPromiseRef.current = fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: storedRefreshToken })
        })
            .then(async (response) => {
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.detail || 'Session refresh failed.');
                }

                const data = await response.json();
                return persistAccessToken(data.access_token);
            })
            .finally(() => {
                refreshPromiseRef.current = null;
            });

        return refreshPromiseRef.current;
    }, [persistAccessToken]);

    const scheduleRefresh = useCallback((accessToken) => {
        clearRefreshTimer();
        if (!accessToken) {
            return;
        }

        try {
            const decoded = jwtDecode(accessToken);
            if (!decoded?.exp) {
                return;
            }

            const expiresAtMs = decoded.exp * 1000;
            const delay = Math.max(expiresAtMs - Date.now() - REFRESH_BUFFER_MS, 30_000);

            refreshTimeoutRef.current = window.setTimeout(async () => {
                try {
                    await refreshAccessToken();
                } catch (error) {
                    console.error('Session refresh failed:', error);
                    logout();
                }
            }, delay);
        } catch (error) {
            console.error('Unable to schedule token refresh:', error);
        }
    }, [clearRefreshTimer, logout, refreshAccessToken]);

    const loadProfile = useCallback(async (accessToken, allowRefresh = true) => {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setHasMailbox(userData.has_mailbox);
            setMailboxHealth(userData.mailbox_health || null);
            return true;
        }

        if (response.status === 401 && allowRefresh) {
            const refreshedToken = await refreshAccessToken();
            return loadProfile(refreshedToken, false);
        }

        return false;
    }, [refreshAccessToken]);

    const checkAuth = useCallback(async () => {
        const storedToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
        
        if (!storedToken && !storedRefreshToken) {
            // Delay to prevent React 'cascading renders' in initial mount cycle
            await new Promise(resolve => setTimeout(resolve, 0));
            setLoading(false);
            return;
        }

        try {
            const activeToken = storedToken || await refreshAccessToken();
            const authenticated = await loadProfile(activeToken, true);

            if (!authenticated) {
                logout();
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            logout();
        }
        
        setLoading(false);
    }, [loadProfile, logout, refreshAccessToken]);

    useEffect(() => {
        scheduleRefresh(token);
        return () => {
            clearRefreshTimer();
        };
    }, [token, scheduleRefresh, clearRefreshTimer]);

    useEffect(() => {
        let isMounted = true;
        const initializeAuth = async () => {
            await checkAuth();
            if (isMounted) {
                // Any post-init logic
            }
        };
        initializeAuth();
        return () => { isMounted = false; };
    }, [checkAuth]);

    useEffect(() => {
        const interceptorId = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (
                    error.response?.status === 401 &&
                    originalRequest &&
                    !originalRequest._retry &&
                    localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
                ) {
                    originalRequest._retry = true;
                    try {
                        const refreshedToken = await refreshAccessToken();
                        originalRequest.headers = {
                            ...(originalRequest.headers || {}),
                            Authorization: `Bearer ${refreshedToken}`,
                        };
                        return axios(originalRequest);
                    } catch (refreshError) {
                        logout();
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptorId);
        };
    }, [logout, refreshAccessToken]);

    const login = async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            persistSession(data.access_token, data.refresh_token);
            // We consciously DO NOT set user here to prevent firing the 'isLoggedIn' 
            // routes before 'hasMailbox' is validated. We delegate to checkAuth().
            await checkAuth();
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Identity verification failed.');
        }
    };

    const getMailboxAuthorizationUrl = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/google/url`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            return response.data?.url;
        } catch (error) {
            console.error("Failed to initialize mailbox authorization:", error);
            throw error;
        }
    };

    const connectMailbox = async (code, state, redirectUri = null) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/connect/google/mailbox`, 
                { code, state, redirect_uri: redirectUri },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error("Mailbox vaulting failed:", error);
            throw error;
        }
    };

    const demoSignup = async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/demo/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Demo onboarding failed.' }));
            throw new Error(error.detail);
        }
        return await response.json();
    };

    const verifyDemoOtp = async (email, otp) => {
        const response = await fetch(`${API_BASE_URL}/auth/demo/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });

        if (response.ok) {
            const data = await response.json();
            persistSession(data.access_token, data.refresh_token);
            await checkAuth(); // Refresh user metadata (is_expired, etc)
        } else {
            const error = await response.json().catch(() => ({ detail: 'Verification failed.' }));
            throw new Error(error.detail);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            isLoggedIn: !!user, 
            hasMailbox, 
            mailboxHealth,
            login, 
            logout, 
            getMailboxAuthorizationUrl,
            connectMailbox, 
            demoSignup,
            verifyDemoOtp,
            loading, 
            checkAuth,
            refreshAccessToken,
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
