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
            {/* Subtle Info Indicator */}
            <div className="flex items-center gap-2.5 mb-8 animate-fade-up opacity-60 hover:opacity-100 transition-opacity" style={{ animationDelay: '0ms' }}>
                <span className="flex h-1.5 w-1.5 rounded-full bg-maceng-maroon dark:bg-maceng-orange"></span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666] dark:text-[#999]">
                    McMaster Engineering • Community Driven
                </span>
            </div>

            {/* High Impact Headline */}
            <div className="mb-8 md:mb-12 animate-fade-up" style={{ animationDelay: '100ms' }}>
                <h1 className="font-playfair text-4xl md:text-6xl font-bold text-[#222] dark:text-white leading-[1.1] mb-4 md:mb-6">
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
            <div className="relative -mx-4 md:-mx-8 my-8 md:my-12 border-y border-[#eee] dark:border-[#222] animate-fade-up" style={{ animationDelay: '200ms' }}>
                <div className="grid grid-cols-3 divide-x divide-[#eee] dark:divide-[#222]">
                    <div className="py-6 md:py-10 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl md:text-5xl font-bold text-maceng-maroon dark:text-maceng-orange mb-1 md:mb-2 tracking-tight">
                            <AnimatedNumber value={experienceCount} />
                        </div>
                        <div className="text-[8px] md:text-[12px] font-bold uppercase tracking-[0.1em] md:tracking-[0.15em] text-[#888] dark:text-[#666] px-1">
                            Experiences
                        </div>
                    </div>
                    <div className="py-6 md:py-10 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl md:text-5xl font-bold text-maceng-maroon dark:text-maceng-orange mb-1 md:mb-2 tracking-tight">
                            <AnimatedNumber value={companyCount} />
                        </div>
                        <div className="text-[8px] md:text-[12px] font-bold uppercase tracking-[0.1em] md:tracking-[0.15em] text-[#888] dark:text-[#666] px-1">
                            Companies
                        </div>
                    </div>
                    <div className="py-6 md:py-10 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl md:text-5xl font-bold text-maceng-maroon dark:text-maceng-orange mb-1 md:mb-2 tracking-tight">
                            <AnimatedNumber value={designTeamCount} />
                        </div>
                        <div className="text-[8px] md:text-[12px] font-bold uppercase tracking-[0.1em] md:tracking-[0.15em] text-[#888] dark:text-[#666] px-1">
                            Design Teams
                        </div>
                    </div>
                </div>
            </div>

            {/* CTAs & Tab Nav */}
            <div className="space-y-10 animate-fade-up" style={{ animationDelay: '300ms' }}>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <Link
                            to={activeTab === 'companies' ? "/submit" : "/submit-design-team"}
                            className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-maceng-maroon dark:bg-maceng-orange text-white rounded-lg font-bold text-sm text-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-maceng-maroon/20 dark:shadow-maceng-orange/20"
                        >
                            + Share your {activeTab === 'companies' ? 'company' : 'design team'} experience
                        </Link>
                        <button
                            onClick={() => {
                                const el = document.getElementById('search-filters');
                                el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full sm:w-auto px-6 py-3 sm:py-2.5 border border-maceng-maroon/30 dark:border-maceng-orange/30 text-maceng-maroon dark:text-maceng-orange rounded-lg font-bold text-sm hover:bg-maceng-maroon/5 dark:hover:bg-maceng-orange/5 transition-all text-center"
                        >
                            Browse all {activeTab === 'companies' ? 'companies' : 'design teams'}
                        </button>
                    </div>

                    {/* Tiny request link below buttons */}
                    <div className="w-full pl-0.5">
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
