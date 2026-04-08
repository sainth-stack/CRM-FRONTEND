import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [hasMailbox, setHasMailbox] = useState(false);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    // Synchronize global axios headers with the mission-critical token
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setHasMailbox(false);
    };

    const checkAuth = React.useCallback(async () => {
        const storedToken = localStorage.getItem('token');
        
        if (!storedToken) {
            // Delay to prevent React 'cascading renders' in initial mount cycle
            await new Promise(resolve => setTimeout(resolve, 0));
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${storedToken}` }
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                setHasMailbox(userData.has_mailbox);
            } else {
                logout();
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            logout();
        }
        
        setLoading(false);
    }, [API_URL]);

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

    const login = async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            setToken(data.access_token);
            // We consciously DO NOT set user here to prevent firing the 'isLoggedIn' 
            // routes before 'hasMailbox' is validated. We delegate to checkAuth().
            await checkAuth();
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Identity verification failed.');
        }
    };

    const connectMailbox = async (code, redirectUri = null) => {
        try {
            const response = await axios.post(`${API_URL}/connect/google/mailbox`, 
                { code, redirect_uri: redirectUri },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error("Mailbox vaulting failed:", error);
            throw error;
        }
    };

    const demoSignup = async (email, password) => {
        const response = await fetch(`${API_URL}/auth/demo/signup`, {
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
        const response = await fetch(`${API_URL}/auth/demo/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            setToken(data.access_token);
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
            login, 
            logout, 
            connectMailbox, 
            demoSignup,
            verifyDemoOtp,
            loading, 
            checkAuth 
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
