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
        <nav className="flex gap-0 border-b-2 border-[#e5e5e5] mb-8">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                        flex-1 py-3 text-[13px] md:text-[14px] font-bold tracking-wide uppercase
                        border-b-3 -mb-[2px] transition-all duration-200 bg-transparent cursor-pointer text-center
                        ${tab.id === activeTab
                            ? 'border-maceng-maroon text-maceng-maroon'
                            : 'border-transparent text-[#bbb] hover:text-[#888] hover:border-[#ddd]'
                        }
                    `}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    );
}
