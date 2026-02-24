interface TabNavProps {
    activeTab: 'companies' | 'design-teams';
    onTabChange: (tab: 'companies' | 'design-teams') => void;
}

const tabs = [
    { id: 'companies' as const, label: 'Companies' },
    { id: 'design-teams' as const, label: 'Design Teams' },
];

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
    return (
        <nav className="flex gap-0 border-b-2 border-[#e5e5e5] dark:border-[#444] mb-8">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                        flex-1 py-3 text-[13px] md:text-[14px] font-bold tracking-wide uppercase
                        border-b-3 -mb-[2px] transition-all duration-200 bg-transparent cursor-pointer text-center
                        ${tab.id === activeTab
                            ? 'border-maceng-maroon text-maceng-maroon dark:border-maceng-orange dark:text-maceng-orange'
                            : 'border-transparent text-[#bbb] dark:text-[#b0b0b0] hover:text-[#888] dark:hover:text-[#d1d1d1] hover:border-[#ddd] dark:hover:border-[#555]'
                        }
                    `}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    );
}
