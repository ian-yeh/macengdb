import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDesignTeam, fetchDesignTeamReviews } from '../api/api';
import { type DesignTeamReview } from '../api/types';
import CompanyDetailSkeleton from '../components/CompanyDetailSkeleton';

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
            <div className="min-h-screen py-12 px-8 max-w-4xl mx-auto">
                <CompanyDetailSkeleton />
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-[#666]">
                <p className="italic">Design team not found.</p>
                <Link to="/" className="text-maceng-orange mt-4 underline">
                    ← Back to Design Teams
                </Link>
            </div>
        );
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < rating ? 'text-maceng-orange' : 'text-[#ddd]'}>
                ★
            </span>
        ));
    };

    return (
        <div className="min-h-screen py-12 px-8 max-w-4xl mx-auto">
            {/* Back Link */}
            <Link
                to="/"
                className="text-maceng-orange text-[13px] font-medium hover:text-maceng-maroon transition-colors inline-flex items-center gap-1 mb-8"
            >
                <span>←</span> Back to Design Teams
            </Link>

            {/* Header */}
            <header className="mb-8">
                <h1 className="font-playfair text-3xl md:text-4xl font-bold text-maceng-maroon mb-3 tracking-tight">
                    {team.name}
                </h1>
                {team.description && (
                    <p className="text-[15px] text-[#555] leading-relaxed mb-4">
                        {team.description}
                    </p>
                )}
                <div className="flex flex-wrap gap-3 items-center border-b border-[#e5e5e5] pb-6">
                    {team.categories.map((cat: string) => (
                        <span
                            key={cat}
                            className="px-3 py-1 bg-maceng-maroon/5 text-maceng-maroon text-[12px] font-semibold rounded-full uppercase tracking-wider"
                        >
                            {cat}
                        </span>
                    ))}
                    {team.avg_rating && (
                        <span className="text-[14px] font-semibold text-[#555] flex items-center gap-1">
                            <span className="text-maceng-orange">★</span>
                            {team.avg_rating.toFixed(1)}
                        </span>
                    )}
                    {team.website_url && (
                        <a
                            href={team.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-maceng-orange text-[13px] underline hover:text-maceng-maroon transition-colors"
                        >
                            Website ↗
                        </a>
                    )}
                </div>
            </header>

            {/* Experiences */}
            <section>
                <h2 className="font-playfair text-2xl font-semibold text-[#333] mb-8">
                    Experiences ({reviews.length})
                </h2>

                {reviews.length === 0 ? (
                    <div className="text-center py-12 text-[#999] italic">
                        No experiences yet. Be the first to share yours!
                    </div>
                ) : (
                    <div className="space-y-8">
                        {reviews.map((review: DesignTeamReview) => (
                            <div key={review.id} className="border-b border-[#e5e5e5] pb-8">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold text-maceng-maroon text-[17px]">
                                            {review.role}
                                        </h3>
                                        <p className="text-[13px] text-[#888] italic font-inter">
                                            {review.term}
                                            {review.time_commitment && ` · ${review.time_commitment}`}
                                        </p>
                                    </div>
                                    <div className="text-[16px] mt-1 sm:mt-0">
                                        {renderStars(review.rating)}
                                    </div>
                                </div>

                                {review.description && (
                                    <p className="text-[15px] text-[#444] leading-relaxed mb-3">
                                        {review.description}
                                    </p>
                                )}

                                {review.tips && (
                                    <div className="bg-maceng-orange/5 border-l-3 border-maceng-orange px-4 py-3 rounded-r-lg">
                                        <p className="text-[13px] text-[#555] font-medium">
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

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[#eee] text-center">
                <p className="text-[12px] text-[#aaa] italic font-inter">
                    MacEngDB — Built by McMaster Engineering students, for McMaster Engineering students.
                </p>
            </footer>
        </div>
    );
}
