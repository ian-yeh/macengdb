import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { fetchDesignTeams, submitDesignTeamReview } from '../api/api';
import { type DesignTeam } from '../api/types';

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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen py-12 px-8 max-w-2xl mx-auto">
                <div className="text-center py-16">
                    <h1 className="font-playfair text-3xl font-semibold text-maceng-maroon mb-4">
                        Thank you!
                    </h1>
                    <p className="text-[15px] text-[#555] mb-8">
                        Your application experience has been submitted successfully and sent to an admin for review. It will help fellow McMaster Engineering students prepare to join design teams.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2.5 bg-maceng-maroon text-white rounded font-medium text-sm hover:bg-maceng-maroon/90 transition-colors cursor-pointer"
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
                            className="px-6 py-2.5 border border-maceng-maroon text-maceng-maroon rounded font-medium text-sm hover:bg-maceng-maroon/5 transition-colors cursor-pointer"
                        >
                            Submit Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-8 max-w-2xl mx-auto">
            {/* Header */}
            <header className="mb-8">
                <Link
                    to="/"
                    className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange text-sm"
                >
                    ← Back to home
                </Link>

                <h1 className="font-playfair text-3xl font-semibold text-maceng-maroon mt-6 mb-2">
                    Submit an Application Experience
                </h1>
                <p className="text-[15px] text-[#555]">
                    Share your experience applying to a McMaster design team to help fellow students prepare.
                </p>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">
                        McMaster Email <span className="text-maceng-orange">*</span>
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@mcmaster.ca"
                        className="w-full py-2 px-3 text-sm border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon"
                        required
                    />
                    <p className="text-xs text-[#888] mt-1">Must be a @mcmaster.ca email address. Your identity remains anonymous.</p>
                </div>

                {/* Team Search */}
                <div className="relative" ref={suggestionsRef}>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">
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
                            className={`flex-1 py-2 px-3 text-sm border rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon ${selectedTeam ? 'border-green-500 bg-green-50' : 'border-[#ccc]'
                                }`}
                        />
                        {selectedTeam && (
                            <button
                                type="button"
                                onClick={handleTeamClear}
                                className="px-3 text-sm text-[#888] hover:text-[#333] transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    {showSuggestions && teamSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-[#ccc] rounded shadow-lg max-h-48 overflow-y-auto">
                            {teamSuggestions.map((team) => (
                                <button
                                    key={team.id}
                                    type="button"
                                    onClick={() => handleTeamSelect(team)}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#fafafa] transition-colors border-b border-[#f0f0f0] last:border-b-0 cursor-pointer"
                                >
                                    <span className="font-medium text-[#333]">{team.name}</span>
                                    {team.categories.length > 0 && (
                                        <span className="text-[#888] ml-2 text-xs">
                                            {team.categories.join(', ')}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Position */}
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">
                        Position Applied For <span className="text-maceng-orange">*</span>
                    </label>
                    <input
                        type="text"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="e.g. Mechanical Lead, Software Developer, Electrical Member"
                        className="w-full py-2 px-3 text-sm border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon"
                        required
                    />
                </div>

                {/* Term */}
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">
                        Term <span className="text-maceng-orange">*</span>
                    </label>
                    <select
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        className="w-full py-2 px-3 text-sm border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon"
                        required
                    >
                        <option value="">Select a term...</option>
                        {TERM_OPTIONS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {/* Accepted */}
                <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#ddd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-maceng-maroon"></div>
                    </label>
                    <span className="text-sm font-medium text-[#333]">Received an acceptance</span>
                </div>

                {/* Difficulty */}
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">
                        Application Difficulty <span className="text-maceng-orange">*</span>
                    </label>
                    <div className="flex gap-1.5 items-center">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => setDifficulty(level)}
                                className={`w-7 h-7 rounded-full transition-colors cursor-pointer border-2 ${level <= difficulty
                                    ? 'bg-maceng-orange border-maceng-orange'
                                    : 'bg-white border-[#ddd] hover:border-maceng-orange/50'
                                    }`}
                            />
                        ))}
                        {difficulty > 0 && (
                            <span className="text-xs text-[#888] ml-2">
                                {DIFFICULTY_LABELS[difficulty]}
                            </span>
                        )}
                    </div>
                </div>

                {/* How You Found Out */}
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">
                        How Did You Find Out About Recruiting?
                    </label>
                    <input
                        type="text"
                        value={interviewAcquisition}
                        onChange={(e) => setInterviewAcquisition(e.target.value)}
                        placeholder="e.g. Club fair, friend, Instagram, Discord"
                        className="w-full py-2 px-3 text-sm border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon"
                    />
                    <p className="text-xs text-[#888] mt-1">Optional. Helps others know where to look for openings.</p>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">
                        Describe the Application Process
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What was the application process like? Were there interviews, technical challenges, or portfolio reviews?"
                        rows={4}
                        className="w-full py-2 px-3 text-sm border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon resize-none"
                    />
                </div>

                {/* Tips */}
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">
                        Tips for Future Applicants
                    </label>
                    <textarea
                        value={tips}
                        onChange={(e) => setTips(e.target.value)}
                        placeholder="Any advice for someone applying to this team? (optional)"
                        rows={3}
                        className="w-full py-2 px-3 text-sm border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon resize-none"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-3">
                        {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-maceng-maroon text-white rounded font-medium text-sm hover:bg-maceng-maroon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {submitting ? 'Submitting...' : 'Submit Application Experience'}
                </button>
            </form>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[#e5e5e5] text-[13px] text-[#666]">
                <p>
                    © {new Date().getFullYear()} MacEngDB · Built by McMaster Engineering students
                </p>
            </footer>
        </div>
    );
}
