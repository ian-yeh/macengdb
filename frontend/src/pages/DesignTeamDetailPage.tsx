import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDesignTeam, fetchDesignTeamReviews, submitDesignTeamReview } from '../api/api';
import { type DesignTeamReview } from '../api/types';
import CompanyDetailSkeleton from '../components/CompanyDetailSkeleton';

const TERM_OPTIONS = [
    'Fall 2023', 'Winter 2024', 'Spring 2024', 'Summer 2024',
    'Fall 2024', 'Winter 2025', 'Spring 2025', 'Summer 2025',
    'Fall 2025', 'Winter 2026', 'Spring 2026', 'Summer 2026',
];

const DIFFICULTY_LABELS: Record<number, string> = {
    1: 'Very Easy',
    2: 'Easy',
    3: 'Moderate',
    4: 'Hard',
    5: 'Very Hard',
};

export default function DesignTeamDetailPage() {
    const { teamId } = useParams<{ teamId: string }>();
    const queryClient = useQueryClient();

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

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        submitter_email: '',
        position: '',
        term: '',
        accepted: false,
        difficulty: 0,
        description: '',
        tips: '',
        interview_acquisition: '',
    });
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [submitError, setSubmitError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamId || formData.difficulty === 0) return;

        setSubmitStatus('submitting');
        setSubmitError('');

        try {
            await submitDesignTeamReview({
                design_team_id: parseInt(teamId),
                submitter_email: formData.submitter_email,
                position: formData.position,
                term: formData.term,
                accepted: formData.accepted,
                difficulty: formData.difficulty,
                description: formData.description || undefined,
                tips: formData.tips || undefined,
                interview_acquisition: formData.interview_acquisition || undefined,
            });

            setSubmitStatus('success');
            setFormData({
                submitter_email: '',
                position: '',
                term: '',
                accepted: false,
                difficulty: 0,
                description: '',
                tips: '',
                interview_acquisition: '',
            });

            queryClient.invalidateQueries({ queryKey: ['design-team-reviews', teamId] });
            queryClient.invalidateQueries({ queryKey: ['design-team', teamId] });

            setTimeout(() => {
                setSubmitStatus('idle');
                setShowForm(false);
            }, 2000);
        } catch (err) {
            setSubmitStatus('error');
            setSubmitError(err instanceof Error ? err.message : 'Failed to submit');
        }
    };

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

    const renderClickableDifficulty = (difficulty: number, onChange: (v: number) => void) => {
        return (
            <div className="flex gap-1 items-center">
                {Array.from({ length: 5 }, (_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => onChange(i + 1)}
                        className={`w-6 h-6 rounded-full transition-colors cursor-pointer border-2 ${i < difficulty
                            ? 'bg-maceng-orange border-maceng-orange'
                            : 'bg-white border-[#ddd] hover:border-maceng-orange/50'
                            }`}
                    />
                ))}
                {difficulty > 0 && (
                    <span className="text-xs text-[#888] ml-2">{DIFFICULTY_LABELS[difficulty]}</span>
                )}
            </div>
        );
    };

    const inputClass = "w-full py-2.5 px-3.5 text-sm border border-[#ddd] rounded-lg font-inter bg-white focus:outline-none focus:ring-4 focus:ring-maceng-maroon/10 focus:border-maceng-maroon transition-all";

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
                    {team.avg_difficulty && (
                        <span className="text-[14px] font-semibold text-[#555] flex items-center gap-1">
                            Avg Difficulty: {team.avg_difficulty.toFixed(1)}/5
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

            {/* Application Experiences */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="font-playfair text-2xl font-semibold text-[#333]">
                        Application Experiences ({reviews.length})
                    </h2>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-maceng-maroon text-white text-sm font-medium rounded-lg hover:bg-maceng-maroon/90 transition-colors cursor-pointer"
                        >
                            + Share Application Experience
                        </button>
                    )}
                </div>

                {/* Submission Form */}
                {showForm && (
                    <div className="mb-10 p-6 bg-[#fafafa] border border-[#eee] rounded-xl animate-fade-in">
                        <h3 className="font-playfair text-lg text-maceng-maroon mb-1">Share Your Application Experience</h3>
                        <p className="text-xs text-[#888] mb-5">Help others prepare to apply. Your submission will be reviewed before publishing.</p>

                        {submitStatus === 'success' ? (
                            <div className="text-center py-6">
                                <p className="text-green-600 font-medium text-sm">✓ Experience submitted! It will appear after review.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] uppercase tracking-wider font-bold text-maceng-maroon/60 mb-1 block">
                                            McMaster Email *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="you@mcmaster.ca"
                                            value={formData.submitter_email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, submitter_email: e.target.value }))}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] uppercase tracking-wider font-bold text-maceng-maroon/60 mb-1 block">
                                            Position Applied For *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Mechanical Lead, Software Developer"
                                            value={formData.position}
                                            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] uppercase tracking-wider font-bold text-maceng-maroon/60 mb-1 block">
                                            Term *
                                        </label>
                                        <select
                                            required
                                            value={formData.term}
                                            onChange={(e) => setFormData(prev => ({ ...prev, term: e.target.value }))}
                                            className={inputClass}
                                        >
                                            <option value="">Select term...</option>
                                            {TERM_OPTIONS.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] uppercase tracking-wider font-bold text-maceng-maroon/60 mb-1 block">
                                            Received an Acceptance
                                        </label>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.accepted}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, accepted: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-[#ddd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-maceng-maroon"></div>
                                            </label>
                                            <span className="text-sm text-[#555]">{formData.accepted ? 'Yes' : 'No'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] uppercase tracking-wider font-bold text-maceng-maroon/60 mb-1 block">
                                        Application Difficulty *
                                    </label>
                                    {renderClickableDifficulty(formData.difficulty, (v) => setFormData(prev => ({ ...prev, difficulty: v })))}
                                </div>

                                <div>
                                    <label className="text-[11px] uppercase tracking-wider font-bold text-maceng-maroon/60 mb-1 block">
                                        How Did You Find Out About Recruiting?
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Club fair, friend, Instagram, Discord"
                                        value={formData.interview_acquisition}
                                        onChange={(e) => setFormData(prev => ({ ...prev, interview_acquisition: e.target.value }))}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] uppercase tracking-wider font-bold text-maceng-maroon/60 mb-1 block">
                                        Describe the Application Process
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="What was the application process like? Were there interviews, technical challenges, or portfolio reviews?"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className={`${inputClass} resize-none`}
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] uppercase tracking-wider font-bold text-maceng-maroon/60 mb-1 block">
                                        Tips for Future Applicants
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Any advice for someone applying to this team?"
                                        value={formData.tips}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tips: e.target.value }))}
                                        className={`${inputClass} resize-none`}
                                    />
                                </div>

                                {submitStatus === 'error' && (
                                    <p className="text-xs text-red-600">{submitError}</p>
                                )}

                                <div className="flex gap-2 justify-end pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setShowForm(false); setSubmitStatus('idle'); }}
                                        className="px-4 py-2 text-sm text-[#666] hover:text-[#333] transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitStatus === 'submitting' || formData.difficulty === 0 || !formData.position || !formData.term || !formData.submitter_email}
                                        className="px-5 py-2 bg-maceng-maroon text-white text-sm font-medium rounded-lg hover:bg-maceng-maroon/90 transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        {submitStatus === 'submitting' ? 'Submitting...' : 'Submit Experience'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {reviews.length === 0 && !showForm ? (
                    <div className="text-center py-12 text-[#999] italic">
                        No application experiences yet. Be the first to share yours!
                    </div>
                ) : (
                    <div className="space-y-8">
                        {reviews.map((review: DesignTeamReview) => (
                            <div key={review.id} className="border-b border-[#e5e5e5] pb-8">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-maceng-maroon text-[17px]">
                                                {review.position}
                                            </h3>
                                            <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${review.accepted
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-50 text-red-500'
                                                }`}>
                                                {review.accepted ? 'Accepted' : 'Not Accepted'}
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-[#888] italic font-inter">
                                            {review.term}
                                            {review.interview_acquisition && ` · Found via: ${review.interview_acquisition}`}
                                        </p>
                                    </div>
                                    <div className="mt-1 sm:mt-0">
                                        {renderDifficultyDots(review.difficulty)}
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
