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
        <div className="mb-0">
            <nav className="flex gap-0.5 relative pt-4 px-2 border-b border-maceng-maroon/10 dark:border-maceng-orange/10 overflow-visible">

                {tabs.map(tab => {
                    const isActive = tab.id === activeTab;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                relative flex-1 min-w-[140px] py-3 text-[13px] md:text-[14px] font-bold tracking-wide uppercase
                                transition-all duration-200 cursor-pointer text-center rounded-t-xl
                                ${isActive
                                    ? 'bg-white dark:bg-[#1c1c1c] text-maceng-maroon dark:text-maceng-orange border-t-2 border-maceng-maroon dark:border-maceng-orange z-10'
                                    : 'bg-transparent text-[#888] dark:text-[#555] hover:bg-black/5 dark:hover:bg-white/5 border-t-2 border-transparent'
                                }
                            `}
                        >
                            {/* Inverted Left Corner */}
                            {isActive && (
                                <div className="absolute bottom-0 -left-[14px] w-[14px] h-[14px] overflow-hidden pointer-events-none">
                                    <div className="absolute bottom-0 right-0 w-[24px] h-[24px] bg-white dark:bg-[#1c1c1c] rounded-full shadow-[8px_8px_0_0_white] dark:shadow-[8px_8px_0_0_#1c1c1c] translate-x-3.5 translate-y-3.5"></div>
                                </div>
                            )}

                            {/* Inverted Right Corner */}
                            {isActive && (
                                <div className="absolute bottom-0 -right-[14px] w-[14px] h-[14px] overflow-hidden pointer-events-none">
                                    <div className="absolute bottom-0 left-0 w-[24px] h-[24px] bg-white dark:bg-[#1c1c1c] rounded-full shadow-[-8px_8px_0_0_white] dark:shadow-[-8px_8px_0_0_#1c1c1c] -translate-x-3.5 translate-y-3.5"></div>
                                </div>
                            )}

                            <span className="relative z-20">
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
