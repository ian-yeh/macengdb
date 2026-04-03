import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { fetchDesignTeams, submitDesignTeamReview } from '../api/api';
import { type DesignTeam } from '../api/types';
import DesignTeamRequestModal from '../components/features/design-teams/DesignTeamRequestModal';
import Footer from '../components/layout/Footer';
import { usePostHog } from '@posthog/react';

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

export default function SubmitDesignTeamExperiencePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const posthog = usePostHog();

    // Form state
    const [email, setEmail] = useState('');
    const [teamQuery, setTeamQuery] = useState('');
    const [selectedTeam, setSelectedTeam] = useState<DesignTeam | null>(null);
    const [teamSuggestions, setTeamSuggestions] = useState<DesignTeam[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [position, setPosition] = useState('');
    const [term, setTerm] = useState('');
    const [accepted, setAccepted] = useState(false);
    const [difficulty, setDifficulty] = useState(0);
    const [description, setDescription] = useState('');
    const [tips, setTips] = useState('');
    const [interviewAcquisition, setInterviewAcquisition] = useState('');

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const [showRequestModal, setShowRequestModal] = useState(false);

    // Team search
    useEffect(() => {
        if (!teamQuery.trim() || selectedTeam) {
            setTeamSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const results = await fetchDesignTeams();
                const filtered = results.filter((t: DesignTeam) =>
                    t.name.toLowerCase().includes(teamQuery.toLowerCase())
                );
                setTeamSuggestions(filtered);
                setShowSuggestions(true);
            } catch {
                setTeamSuggestions([]);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [teamQuery, selectedTeam]);

    // Close suggestions on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleTeamSelect = (team: DesignTeam) => {
        setSelectedTeam(team);
        setTeamQuery(team.name);
        setShowSuggestions(false);
    };

    const handleTeamClear = () => {
        setSelectedTeam(null);
        setTeamQuery('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim().toLowerCase().endsWith('@mcmaster.ca')) {
            setError('Please use your McMaster email address (@mcmaster.ca)');
            return;
        }

        if (!selectedTeam) {
            setError('Please select a design team from the suggestions');
            return;
        }

        if (!position.trim()) {
            setError('Please enter the position you applied for');
            return;
        }

        if (!term) {
            setError('Please select a term');
            return;
        }

        if (difficulty === 0) {
            setError('Please select the application difficulty');
            return;
        }

        setSubmitting(true);
        try {
            await submitDesignTeamReview({
                design_team_id: selectedTeam.id,
                submitter_email: email.trim().toLowerCase(),
                position: position.trim(),
                term,
                accepted,
                difficulty,
                description: description.trim() || undefined,
                tips: tips.trim() || undefined,
                interview_acquisition: interviewAcquisition.trim() || undefined,
            });
            queryClient.invalidateQueries({ queryKey: ['design-teams'] });
            queryClient.invalidateQueries({ queryKey: ['design-team-reviews'] });
            setSuccess(true);
            posthog.capture('design_team_experience_submit_success', {
                team_name: selectedTeam.name,
                position: position.trim()
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
            setError(errorMessage);
            posthog.capture('design_team_experience_submit_failed', {
                team_name: selectedTeam?.name,
                error: errorMessage
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen py-8 md:py-12 px-4 md:px-8 max-w-2xl mx-auto flex flex-col items-center justify-center">
                <div className="text-center py-16 flex-grow">
                    <h1 className="font-playfair text-3xl font-semibold text-maceng-maroon dark:text-maceng-orange mb-4">
                        Thank you!
                    </h1>
                    <p className="text-[15px] text-[#555] dark:text-[#e5e5e5] mb-8">
                        Your application experience has been submitted successfully and sent to an admin for review. It will help fellow McMaster Engineering students prepare to join design teams.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2.5 bg-maceng-maroon dark:bg-maceng-orange text-white rounded font-medium text-sm hover:bg-maceng-maroon/90 dark:hover:bg-maceng-orange/90 transition-colors cursor-pointer"
                        >
                            Back to Home
                        </button>
                        <button
                            onClick={() => {
                                setSuccess(false);
                                setEmail('');
                                setSelectedTeam(null);
                                setTeamQuery('');
                                setPosition('');
                                setTerm('');
                                setAccepted(false);
                                setDifficulty(0);
                                setDescription('');
                                setTips('');
                                setInterviewAcquisition('');
                            }}
                            className="px-6 py-2.5 border border-maceng-maroon dark:border-maceng-orange text-maceng-maroon dark:text-maceng-orange rounded font-medium text-sm hover:bg-maceng-maroon/5 dark:hover:bg-maceng-orange/10 transition-colors cursor-pointer"
                        >
                            Submit Another
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 md:py-12 px-4 md:px-8 max-w-2xl mx-auto flex flex-col animate-fade-up">
            {/* Header */}
            <header className="mb-12">
                <Link
                    to="/"
                    className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange text-sm mb-6 inline-block"
                >
                    ← Back to home
                </Link>

                <h1 className="font-playfair text-4xl font-bold text-[#222] dark:text-white mb-3">
                    Submit an Application
                </h1>
                <p className="text-[17px] text-[#555] dark:text-[#b0b0b0] leading-relaxed">
                    Share your experience applying to a McMaster design team to help fellow students prepare and join the community.
                </p>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-12 flex-grow">
                {/* 1. Team & Role */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-maceng-maroon/10 dark:bg-maceng-orange/10 flex items-center justify-center text-maceng-maroon dark:text-maceng-orange font-bold text-sm">1</div>
                        <h2 className="text-xl font-bold text-[#222] dark:text-white">Team Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Team Search */}
                        <div className="relative md:col-span-2" ref={suggestionsRef}>
                            <label className="block text-sm font-semibold text-[#333] dark:text-white mb-2">
                                Design Team <span className="text-maceng-orange">*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={teamQuery}
                                    onChange={(e) => {
                                        setTeamQuery(e.target.value);
                                        if (selectedTeam) setSelectedTeam(null);
                                    }}
                                    placeholder="Search for a design team..."
                                    className={`flex-1 py-2.5 px-4 text-sm border rounded-lg font-inter bg-white dark:bg-[#111] dark:text-white focus:outline-none focus:ring-2 focus:ring-maceng-maroon/20 dark:focus:ring-maceng-orange/20 ${selectedTeam ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' : 'border-[#ccc] dark:border-[#444]'}`}
                                />
                                {selectedTeam && (
                                    <button
                                        type="button"
                                        onClick={handleTeamClear}
                                        className="px-2 text-[#888] hover:text-[#333] transition-colors cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            {showSuggestions && teamSuggestions.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#111] border border-[#ccc] dark:border-[#444] rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                    {teamSuggestions.map((team) => (
                                        <button
                                            key={team.id}
                                            type="button"
                                            onClick={() => handleTeamSelect(team)}
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-[#fafafa] dark:hover:bg-[#222] transition-colors border-b border-[#f0f0f0] dark:border-[#444] last:border-b-0 cursor-pointer"
                                        >
                                            <span className="font-medium text-[#333] dark:text-white">{team.name}</span>
                                            {team.categories.length > 0 && (
                                                <span className="text-[#888] dark:text-[#a0a0a0] ml-2 text-xs">
                                                    {team.categories.join(', ')}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {!selectedTeam && (
                                <div className="mt-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setShowRequestModal(true)}
                                        className="text-xs font-semibold text-maceng-orange hover:text-maceng-maroon transition-colors cursor-pointer"
                                    >
                                        Can't find your design team? Request it →
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Position */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-[#333] dark:text-white mb-2">
                                Position Applied For <span className="text-maceng-orange">*</span>
                            </label>
                            <input
                                type="text"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                placeholder="e.g. Mechanical Lead, Software Developer"
                                className="w-full py-2.5 px-4 text-sm border border-[#ccc] dark:border-[#444] rounded-lg font-inter bg-white dark:bg-[#111] dark:text-white focus:outline-none focus:ring-2 focus:ring-maceng-maroon/20 dark:focus:ring-maceng-orange/20"
                                required
                            />
                        </div>

                        {/* Term */}
                        <div>
                            <label className="block text-sm font-semibold text-[#333] dark:text-white mb-2">
                                Term <span className="text-maceng-orange">*</span>
                            </label>
                            <select
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                                className="w-full py-2.5 px-4 text-sm border border-[#ccc] dark:border-[#444] rounded-lg font-inter bg-white dark:bg-[#111] dark:text-white focus:outline-none focus:ring-2 focus:ring-maceng-maroon/20 dark:focus:ring-maceng-orange/20"
                                required
                            >
                                <option value="">Select a term...</option>
                                {TERM_OPTIONS.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        {/* Acquisition */}
                        <div>
                            <label className="block text-sm font-semibold text-[#333] dark:text-white mb-2">
                                Acquisition
                            </label>
                            <input
                                type="text"
                                value={interviewAcquisition}
                                onChange={(e) => setInterviewAcquisition(e.target.value)}
                                placeholder="e.g. Club fair, friend, Discord"
                                className="w-full py-2.5 px-4 text-sm border border-[#ccc] dark:border-[#444] rounded-lg font-inter bg-white dark:bg-[#111] dark:text-white focus:outline-none focus:ring-2 focus:ring-maceng-maroon/20 dark:focus:ring-maceng-orange/20"
                            />
                        </div>

                        {/* Status & Difficulty */}
                        <div className="md:col-span-2 flex flex-col md:flex-row md:items-end gap-8 pt-2">
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-[#333] dark:text-white mb-3">
                                    Process Difficulty <span className="text-maceng-orange">*</span>
                                </label>
                                <div className="flex gap-2 items-center">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setDifficulty(level)}
                                            className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${difficulty === level
                                                ? 'bg-maceng-maroon dark:bg-maceng-orange text-white shadow-lg'
                                                : 'bg-[#f0f0f0] dark:bg-[#222] text-[#555] dark:text-[#e5e5e5] hover:bg-[#e0e0e0] dark:hover:bg-[#333]'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                    <span className="text-xs font-bold text-maceng-orange ml-3 uppercase tracking-wider">
                                        {DIFFICULTY_LABELS[difficulty] || 'Select'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 h-10">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={accepted}
                                        onChange={(e) => setAccepted(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-5 bg-[#ddd] dark:bg-[#333] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-maceng-maroon dark:peer-checked:bg-maceng-orange"></div>
                                </label>
                                <span className="text-sm font-semibold text-[#333] dark:text-white">Received an acceptance</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. The Process */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-maceng-maroon/10 dark:bg-maceng-orange/10 flex items-center justify-center text-maceng-maroon dark:text-maceng-orange font-bold text-sm">2</div>
                        <h2 className="text-xl font-bold text-[#222] dark:text-white">Recruitment Process</h2>
                    </div>

                    <p className="text-[14px] text-[#777] dark:text-[#a0a0a0] leading-relaxed">
                        What was the application like? Mention if there was a portfolio review, technical task, or multiple interview rounds.
                    </p>

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. First stage was an online application with a portfolio. Second stage was a 30-minute interview with the team lead..."
                        rows={4}
                        className="w-full py-4 px-4 text-sm border border-[#ccc] dark:border-[#444] rounded-xl font-inter bg-white dark:bg-[#111] dark:text-white focus:outline-none focus:ring-2 focus:ring-maceng-maroon/20 dark:focus:ring-maceng-orange/20 min-h-[140px]"
                    />
                </section>

                {/* Tips & Advice - De-emphasized */}
                <div className="pt-6 border-t border-[#eee] dark:border-[#333]">
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#999] mb-3">
                        Tips & Advice (Optional)
                    </label>
                    <textarea
                        value={tips}
                        onChange={(e) => setTips(e.target.value)}
                        placeholder="Any advice for future candidates? What do they look for in candidates?"
                        rows={3}
                        className="w-full py-3 px-4 text-sm border border-[#eee] dark:border-[#333] rounded-xl font-inter bg-[#fafafa] dark:bg-[#1a1a1a] dark:text-white focus:outline-none focus:border-maceng-maroon/30 dark:focus:border-maceng-orange/30 min-h-[100px]"
                    />
                </div>

                {/* Verification - De-emphasized */}
                <div className="pt-6 border-t border-[#eee] dark:border-[#333]">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-[#999] mb-3">
                                McMaster Email <span className="text-maceng-orange">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="yourname@mcmaster.ca"
                                className="w-full py-3 px-4 text-sm border border-[#eee] dark:border-[#333] rounded-lg font-inter bg-[#fafafa] dark:bg-[#1a1a1a] dark:text-white focus:outline-none focus:border-maceng-maroon/30 dark:focus:border-maceng-orange/30"
                                required
                            />
                        </div>
                        <p className="text-[12px] text-[#aaa] dark:text-[#777] leading-relaxed">
                            Verified students only. Your identity remains <strong>anonymous</strong> to others.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg px-4 py-3 mb-6">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-maceng-maroon dark:bg-maceng-orange text-white rounded-xl font-bold text-base hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-maceng-maroon/20 dark:shadow-maceng-orange/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {submitting ? 'Submitting...' : 'Submit Experience'}
                    </button>
                </div>
            </form>

            <DesignTeamRequestModal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
            />

            <Footer />
        </div>
    );
}
