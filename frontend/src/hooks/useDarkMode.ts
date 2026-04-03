import { useEffect } from 'react';

export function useDarkMode() {
    const isDark = false;
    const toggleDarkMode = () => {};

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('dark');
        localStorage.removeItem('dark-mode');
    }, []);

    return { isDark, toggleDarkMode };
}
