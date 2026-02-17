import { Link, useLocation } from 'react-router-dom';

const tabs = [
    { label: 'Companies', path: '/' },
    { label: 'Design Teams', path: '/design-teams' },
];

export default function TabNav() {
    const location = useLocation();

    return (
        <nav className="flex gap-1 mb-10 border-b border-[#e5e5e5]">
            {tabs.map(tab => {
                const isActive =
                    tab.path === '/'
                        ? location.pathname === '/' || location.pathname.startsWith('/company')
                        : location.pathname.startsWith(tab.path);

                return (
                    <Link
                        key={tab.path}
                        to={tab.path}
                        className={`
                            px-5 py-3 text-[14px] font-semibold tracking-wide uppercase
                            border-b-2 -mb-[1px] transition-all duration-200
                            ${isActive
                                ? 'border-maceng-maroon text-maceng-maroon'
                                : 'border-transparent text-[#999] hover:text-[#666] hover:border-[#ddd]'
                            }
                        `}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
}
