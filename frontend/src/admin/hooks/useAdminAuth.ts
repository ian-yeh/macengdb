import { useState, useCallback } from 'react';
import { fetchPendingExperiences } from '../../api/api';

export function useAdminAuth() {
    const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('adminKey') || '');
    const [authenticated, setAuthenticated] = useState(() => !!sessionStorage.getItem('adminKey'));
    const [authError, setAuthError] = useState('');
    const [feedback, setFeedback] = useState<{ key: string; message: string; type: 'success' | 'error' } | null>(null);
    const [processing, setProcessing] = useState<Set<string>>(new Set());

    const handleLogin = async (keyInput: string) => {
        setAuthError('');
        try {
            await fetchPendingExperiences(keyInput);
            setAdminKey(keyInput);
            sessionStorage.setItem('adminKey', keyInput);
            setAuthenticated(true);
            return true;
        } catch {
            setAuthError('Invalid admin key');
            return false;
        }
    };

    const logout = () => {
        setAdminKey('');
        sessionStorage.removeItem('adminKey');
        setAuthenticated(false);
    };

    const showFeedback = useCallback((key: string, message: string, type: 'success' | 'error') => {
        setFeedback({ key, message, type });
        setTimeout(() => setFeedback(null), 3000);
    }, []);

    const startProcessing = (key: string) => setProcessing(prev => new Set(prev).add(key));
    const stopProcessing = (key: string) => setProcessing(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
    });

    return {
        adminKey,
        authenticated,
        authError,
        feedback,
        processing,
        handleLogin,
        logout,
        showFeedback,
        startProcessing,
        stopProcessing
    };
}
