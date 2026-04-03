import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TabNav from '../ui/TabNav';

interface HeaderProps {
    activeTab: 'companies' | 'design-teams';
    onTabChange: (tab: 'companies' | 'design-teams') => void;
    onRequestCompany: () => void;
    onRequestDesignTeam: () => void;
    experienceCount: number;
    companyCount: number;
    designTeamCount: number;
}

function AnimatedNumber({ value }: { value: number }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        // Scale duration based on value size (min 800ms, max 2000ms)
        const duration = Math.min(2000, Math.max(800, value * 10 + 500));

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Quartic ease-out: smooth and responsive
            const easedProgress = 1 - Math.pow(1 - progress, 4);

            setDisplayValue(Math.floor(easedProgress * value));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        const animationId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationId);
    }, [value]);

    return <>{displayValue}</>;
}

export default function Header({
    activeTab,
    onTabChange,
    onRequestCompany,
    onRequestDesignTeam,
    experienceCount,
    companyCount,
    designTeamCount
}: HeaderProps) {
    const accentText = activeTab === 'companies' ? 'interview.' : 'apply.';

    return (
        <header className="mb-16 pt-8">
            {/* Info Badge */}
            <div className="flex items-center gap-2 mb-8 animate-fade-up" style={{ animationDelay: '0ms' }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maceng-maroon/10 dark:bg-maceng-orange/10 border border-maceng-maroon/20 dark:border-maceng-orange/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-maceng-maroon dark:bg-maceng-orange opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-maceng-maroon dark:bg-maceng-orange"></span>
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-maceng-maroon dark:text-maceng-orange">
                        Live • McMaster Only
                    </span>
                </div>
            </div>

            {/* High Impact Headline */}
            <div className="mb-12 animate-fade-up" style={{ animationDelay: '100ms' }}>
                <h1 className="font-playfair text-5xl md:text-6xl font-bold text-[#222] dark:text-white leading-[1.1] mb-6">
                    Know before <br />
                    you <span className="text-maceng-maroon dark:text-maceng-orange italic">{accentText}</span>
                </h1>

                <p className="text-[17px] md:text-[19px] text-[#555] dark:text-[#b0b0b0] max-w-2xl leading-relaxed font-inter">
                    {activeTab === 'companies'
                        ? "Real interview experiences from Mac students. Read what they asked, how hard it was, and whether they got the offer."
                        : "Explore McMaster Engineering's design teams. Read about real application experiences to help you prepare smarter."
                    }
                </p>
            </div>

            {/* Platform Stats - Refined Full Width Section */}
            <div className="relative -mx-4 md:-mx-8 my-12 border-y border-[#eee] dark:border-[#222] animate-fade-up" style={{ animationDelay: '200ms' }}>
                <div className="grid grid-cols-3 divide-x divide-[#eee] dark:divide-[#222]">
                    <div className="py-10 flex flex-col items-center justify-center text-center">
                        <div className="text-4xl md:text-5xl font-bold text-maceng-maroon dark:text-maceng-orange mb-2 tracking-tight">
                            <AnimatedNumber value={experienceCount} />
                        </div>
                        <div className="text-[11px] md:text-[12px] font-bold uppercase tracking-[0.15em] text-[#888] dark:text-[#666]">
                            Experiences Shared
                        </div>
                    </div>
                    <div className="py-10 flex flex-col items-center justify-center text-center">
                        <div className="text-4xl md:text-5xl font-bold text-maceng-maroon dark:text-maceng-orange mb-2 tracking-tight">
                            <AnimatedNumber value={companyCount} />
                        </div>
                        <div className="text-[11px] md:text-[12px] font-bold uppercase tracking-[0.15em] text-[#888] dark:text-[#666]">
                            Companies Listed
                        </div>
                    </div>
                    <div className="py-10 flex flex-col items-center justify-center text-center">
                        <div className="text-4xl md:text-5xl font-bold text-maceng-maroon dark:text-maceng-orange mb-2 tracking-tight">
                            <AnimatedNumber value={designTeamCount} />
                        </div>
                        <div className="text-[11px] md:text-[12px] font-bold uppercase tracking-[0.15em] text-[#888] dark:text-[#666]">
                            Design Teams Active
                        </div>
                    </div>
                </div>
            </div>

            {/* CTAs & Tab Nav */}
            <div className="space-y-12 animate-fade-up" style={{ animationDelay: '300ms' }}>
                <div className="flex flex-wrap gap-4">
                    <Link
                        to={activeTab === 'companies' ? "/submit" : "/submit-design-team"}
                        className="px-6 py-2.5 bg-maceng-maroon dark:bg-maceng-orange text-white rounded-lg font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-maceng-maroon/20 dark:shadow-maceng-orange/20"
                    >
                        + Share your experience
                    </Link>
                    <button
                        onClick={() => {
                            const el = document.getElementById('search-filters');
                            el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-6 py-2.5 border border-maceng-maroon/30 dark:border-maceng-orange/30 text-maceng-maroon dark:text-maceng-orange rounded-lg font-bold text-sm hover:bg-maceng-maroon/5 dark:hover:bg-maceng-orange/5 transition-all"
                    >
                        Browse all {activeTab === 'companies' ? 'companies' : 'design teams'}
                    </button>
                    {/* Tiny request link moved down */}
                    <div className="w-full mt-2">
                        <p className="text-[13px] text-[#777] dark:text-[#555]">
                            Don't see your {activeTab === 'companies' ? 'company' : 'team'}?{' '}
                            <button
                                onClick={activeTab === 'companies' ? onRequestCompany : onRequestDesignTeam}
                                className="text-maceng-orange font-bold hover:underline transition-all cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-0.5 group"
                            >
                                Request it <span className="text-[10px] group-hover:translate-x-0.5 transition-transform">→</span>
                            </button>
                        </p>
                    </div>
                </div>

                <div className="pt-4">
                    <TabNav activeTab={activeTab} onTabChange={onTabChange} />
                </div>
            </div>
        </header>
    );
}
