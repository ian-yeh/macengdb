import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

export default function TopBar() {
    const { pathname } = useLocation();
    const [params] = useSearchParams();
    const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

    const teams = pathname.startsWith('/design-teams') || (pathname === '/' && params.get('tab') === 'design-teams');
    const nav = [
        { to: '/', label: 'Companies', active: !teams && (pathname === '/' || pathname.startsWith('/company')) },
        { to: '/?tab=design-teams', label: 'Design teams', active: teams },
        { to: '/about', label: 'About', active: pathname === '/about' },
    ];

    const toggleTheme = () => {
        const next = !dark;
        document.documentElement.classList.toggle('dark', next);
        try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { /* private mode */ }
        setDark(next);
    };

    return (
        <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur-md">
            <div className="mx-auto flex h-[60px] max-w-[1080px] items-center gap-7 px-4 sm:px-6">
                <Link to="/" className="font-playfair text-[21px] font-bold tracking-tight">
                    <span className="text-accent">MacEng</span><span className="text-ink-3">DB</span>
                </Link>
                <nav aria-label="Primary" className="hidden gap-[22px] text-sm text-ink-2 sm:flex">
                    {nav.map(n => (
                        <Link
                            key={n.label}
                            to={n.to}
                            aria-current={n.active ? 'page' : undefined}
                            className="hover:text-ink aria-[current=page]:font-semibold aria-[current=page]:text-ink"
                        >
                            {n.label}
                        </Link>
                    ))}
                </nav>
                <div className="ml-auto flex items-center gap-2">
                    <Link to={teams ? '/submit-design-team' : '/submit'} className="btn btn-primary hidden sm:inline-flex">
                        Share an experience
                    </Link>
                    <button
                        onClick={toggleTheme}
                        aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}
                        title={`Switch to ${dark ? 'light' : 'dark'} theme`}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-2 hover:bg-sunken hover:text-ink"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}
