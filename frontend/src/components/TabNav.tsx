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
        <nav className="flex gap-1 border-b border-[#e5e5e5] mb-6">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                        px-5 py-2.5 text-[13px] font-semibold tracking-wide uppercase
                        border-b-2 -mb-[1px] transition-all duration-200 bg-transparent cursor-pointer
                        ${tab.id === activeTab
                            ? 'border-maceng-maroon text-maceng-maroon'
                            : 'border-transparent text-[#999] hover:text-[#666] hover:border-[#ddd]'
                        }
                    `}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    );
}
