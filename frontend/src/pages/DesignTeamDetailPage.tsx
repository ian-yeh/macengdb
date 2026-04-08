import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDesignTeam, fetchDesignTeamReviews } from '../api/api';
import { type DesignTeamReview } from '../api/types';
import CompanyDetailSkeleton from '../components/features/companies/CompanyDetailSkeleton';
import Footer from '../components/layout/Footer';

const DIFFICULTY_LABELS: Record<number, string> = {
    1: 'Very Easy',
    2: 'Easy',
    3: 'Moderate',
    4: 'Hard',
    5: 'Very Hard',
};

export default function DesignTeamDetailPage() {
    const { teamId } = useParams<{ teamId: string }>();

    const { data: team, isLoading, error } = useQuery({
        queryKey: ['design-team', teamId],
        queryFn: () => fetchDesignTeam(teamId!),
        enabled: !!teamId,
    });

    const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
        queryKey: ['design-team-reviews', teamId],
        queryFn: () => fetchDesignTeamReviews(teamId!),
        enabled: !!teamId,
    });

    if (isLoading || reviewsLoading) {
        return (
            <div className="min-h-screen py-8 md:py-12 px-4 md:px-8 max-w-4xl mx-auto">
                <CompanyDetailSkeleton />
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-[#666]">
                <p className="italic">Design team not found.</p>
                <Link to="/?tab=design-teams" className="text-maceng-orange mt-4 underline decoration-maceng-orange/50 hover:decoration-maceng-orange text-sm">
                    ← Back to Design Teams
                </Link>
            </div>
        );
    }

    const renderDifficultyDots = (difficulty: number) => {
        return (
            <div className="flex gap-0.5 items-center">
                {Array.from({ length: 5 }, (_, i) => (
                    <span
                        key={i}
                        className={`inline-block w-2.5 h-2.5 rounded-full ${i < difficulty ? 'bg-maceng-orange' : 'bg-[#e5e5e5]'}`}
                    />
                ))}
                <span className="text-[12px] text-[#888] ml-1.5">{DIFFICULTY_LABELS[difficulty]}</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen py-8 md:py-12 px-4 md:px-8 max-w-4xl mx-auto flex flex-col">
            {/* Back Link */}
            <div className="animate-row-in">
                <Link
                    to="/?tab=design-teams"
                    className="text-maceng-orange text-[13px] font-medium underline decoration-maceng-orange/50 hover:decoration-maceng-orange transition-colors inline-flex items-center gap-1 mb-8"
                >
                    <span>←</span> Back to Design Teams
                </Link>
            </div>

            {/* Header */}
            <header className="mb-8">
                <h1 className="font-playfair text-2xl md:text-4xl font-bold text-maceng-maroon dark:text-maceng-orange mb-2 md:mb-3 tracking-tight animate-row-in" style={{ animationDelay: '50ms' }}>
                    {team.name}
                </h1>
                {team.description && (
                    <p className="text-[15px] text-[#555] dark:text-[#e5e5e5] leading-relaxed mb-4 animate-row-in" style={{ animationDelay: '100ms' }}>
                        {team.description}
                    </p>
                )}
                <div className="flex flex-wrap gap-2 md:gap-3 items-center border-b border-[#e5e5e5] dark:border-[#444] pb-6 animate-row-in" style={{ animationDelay: '150ms' }}>
                    {team.categories.map((cat: string) => (
                        <span
                            key={cat}
                            className="px-3 py-1 bg-maceng-maroon/5 dark:bg-maceng-maroon/20 text-maceng-maroon dark:text-maceng-orange text-[12px] font-semibold rounded-full uppercase tracking-wider"
                        >
                            {cat}
                        </span>
                    ))}
                    {team.avg_difficulty && (
                        <span className="text-[14px] font-semibold text-[#555] dark:text-[#d4d4d4] flex items-center gap-1">
                            Avg Difficulty: {team.avg_difficulty.toFixed(1)}/5
                        </span>
                    )}
                    {team.website_url && (
                        <a
                            href={team.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-maceng-orange underline hover:text-maceng-maroon dark:hover:text-white text-[13px] transition-colors"
                        >
                            Website ↗
                        </a>
                    )}
                </div>
            </header>

            {/* Application Experiences */}
            <section className="flex-grow">
                <div className="flex items-center justify-between mb-8 animate-row-in" style={{ animationDelay: '200ms' }}>
                    <h2 className="font-playfair text-lg md:text-2xl font-semibold text-[#333] dark:text-white">
                        Application Experiences ({reviews.length})
                    </h2>
                    <Link
                        to="/submit-design-team"
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-maceng-maroon text-white text-xs md:text-sm font-medium rounded-lg hover:bg-maceng-maroon/90 transition-colors cursor-pointer"
                    >
                        + Share your design team experience
                    </Link>
                </div>

                {reviews.length === 0 ? (
                    <div className="text-center py-12 text-[#999] italic">
                        No application experiences yet. Be the first to share yours!
                    </div>
                ) : (
                    <div className="space-y-8">
                        {reviews.map((review: DesignTeamReview, index: number) => (
                            <div key={review.id} className="border-b border-[#e5e5e5] dark:border-[#444] pb-8 animate-row-in" style={{ animationDelay: `${250 + index * 60}ms` }}>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-maceng-maroon dark:text-maceng-orange text-[16px] md:text-[17px]">
                                                {review.position}
                                            </h3>
                                            <span className={`text-[9px] md:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${review.accepted
                                                ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                                                : 'bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400'
                                                }`}>
                                                {review.accepted ? 'Accepted' : 'Not Accepted'}
                                            </span>
                                        </div>
                                        <p className="text-xs md:text-[13px] text-[#888] dark:text-[#a0a0a0] italic font-inter">
                                            {review.term}
                                        </p>
                                    </div>
                                    <div className="mt-1 sm:mt-0">
                                        {renderDifficultyDots(review.difficulty)}
                                    </div>
                                </div>

                                {/* Interview Acquisition / Source - Highlighted */}
                                {review.interview_acquisition && (
                                    <div className="mb-4 flex items-center gap-2.5">
                                        <div className="flex items-center gap-2 px-2.5 py-1 bg-maceng-orange/5 border border-maceng-orange/20 rounded-lg">
                                            <span className="text-[10px] uppercase font-bold text-maceng-orange/60 tracking-wider">Applied via</span>
                                            <span className="text-[12px] text-maceng-orange font-semibold">{review.interview_acquisition}</span>
                                        </div>
                                    </div>
                                )}

                                {review.description && (
                                    <p className="text-[15px] text-[#444] leading-relaxed mb-3 whitespace-pre-wrap">
                                        {review.description}
                                    </p>
                                )}

                                {review.tips && (
                                    <div className="bg-maceng-orange/5 border-l-3 border-maceng-orange px-4 py-3 rounded-r-lg">
                                        <p className="text-[13px] text-[#555] font-medium whitespace-pre-wrap">
                                            <span className="text-maceng-orange font-bold">Tip:</span>{' '}
                                            {review.tips}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <Footer />
        </div>
    );
}
