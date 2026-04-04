import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { fetchDesignTeams, submitDesignTeamReview } from '../api/api';
import { type DesignTeam } from '../api/types';
import DesignTeamRequestModal from '../components/features/design-teams/DesignTeamRequestModal';
import { usePostHog } from '@posthog/react';

const TERM_OPTIONS = [
    'Fall 2023', 'Winter 2024', 'Spring 2024', 'Summer 2024',
    'Fall 2024', 'Winter 2025', 'Spring 2025', 'Summer 2025',
    'Fall 2025', 'Winter 2026', 'Spring 2026', 'Summer 2026',
];

const DIFFICULTY_LABELS: Record<number, string> = {
    1: 'Quite Chill',
    2: 'Easy Enough',
    3: 'Moderate',
    4: 'Competitive',
    5: 'Very Intense',
};

export default function SubmitDesignTeamExperiencePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const posthog = usePostHog();

    // Step state
    const [step, setStep] = useState(0);
    const totalSteps = 4; // Intro, Details, Process, Final/Submit

    // Form state
    const [email, setEmail] = useState('');
    const [teamQuery, setTeamQuery] = useState('');
    const [selectedTeam, setSelectedTeam] = useState<DesignTeam | null>(null);
    const [teamSuggestions, setTeamSuggestions] = useState<DesignTeam[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [position, setPosition] = useState('');
    const [term, setTerm] = useState('');
    const [accepted, setAccepted] = useState(false);
    const [difficulty, setDifficulty] = useState(3);
    const [description, setDescription] = useState('');
    const [tips, setTips] = useState('');
    const [interviewAcquisition, setInterviewAcquisition] = useState('');

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const [showRequestModal, setShowRequestModal] = useState(false);

    // Navigation
    const nextStep = useCallback(() => {
        if (step === 1) {
            if (!selectedTeam) {
                setError('Which team did you apply to?');
                return;
            }
            if (!position.trim()) {
                setError('What was the position name?');
                return;
            }
            if (!term) {
                setError('What term was this for?');
                return;
            }
        }
        if (step === 3 && !description.trim()) {
            setError('Please describe what the recruitment process was like.');
            return;
        }

        setError('');
        setStep(s => Math.min(s + 1, totalSteps));
    }, [step, selectedTeam, position, term, description, totalSteps]);

    const prevStep = () => {
        setError('');
        setStep(s => Math.max(s - 1, 0));
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && e.metaKey) {
                if (step < totalSteps) {
                    nextStep();
                } else if (step === totalSteps) {
                    // Trigger form submission
                    const form = document.querySelector('form');
                    if (form) form.requestSubmit();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [step, nextStep]);

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

    const handleTeamSelect = (team: DesignTeam) => {
        setSelectedTeam(team);
        setTeamQuery(team.name);
        setShowSuggestions(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim().toLowerCase().endsWith('@mcmaster.ca')) {
            setError('Please use your McMaster email address (@mcmaster.ca)');
            return;
        }

        setSubmitting(true);
        try {
            await submitDesignTeamReview({
                design_team_id: selectedTeam!.id,
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
                team_name: selectedTeam!.name,
                position: position.trim()
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-white dark:bg-[#0f0f0f] flex items-center justify-center p-8 transition-colors duration-500">
                <div className="max-w-md w-full text-center animate-fade-up">
                    <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="font-playfair text-4xl font-bold text-[#222] dark:text-white mb-4">You're in.</h1>
                    <p className="text-[#666] dark:text-[#a0a0a0] mb-8 text-lg">
                        Your story is recorded. Your experience has been sent for review.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-4 bg-maceng-maroon dark:bg-maceng-orange text-white rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-maceng-maroon/10 dark:shadow-maceng-orange/20"
                        >
                            Return home
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 border border-[#eee] dark:border-[#333] text-[#888] rounded-xl font-bold hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a] transition-all"
                        >
                            Submit another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const progress = (step / totalSteps) * 100;

    return (
        <div className="fixed inset-0 bg-white dark:bg-[#0f0f0f] flex flex-col font-inter transition-colors duration-500">
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-[#f0f0f0] dark:bg-[#1a1a1a]">
                <div 
                    className="h-full bg-maceng-maroon dark:bg-maceng-orange transition-all duration-700 ease-in-out" 
                    style={{ width: `${progress}%` }} 
                />
            </div>

            {/* Back Button */}
            {step > 0 && (
                <button 
                    onClick={prevStep}
                    className="absolute top-8 left-8 text-[#999] hover:text-[#333] dark:hover:text-white transition-colors flex items-center gap-2 group z-50 text-sm font-medium"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
                </button>
            )}

            {/* Exit Button */}
            <button 
                onClick={() => navigate('/')}
                className="absolute top-8 right-8 text-[#999] hover:text-[#333] dark:hover:text-white transition-colors z-50 flex items-center gap-2 group text-sm font-medium"
            >
                Exit <span className="bg-[#eee] dark:bg-[#222] w-6 h-6 flex items-center justify-center rounded-md group-hover:bg-red-500/10 group-hover:text-red-500 transition-all">✕</span>
            </button>

            {/* Main Content Area */}
            <div className="flex-grow flex items-center justify-center p-6 md:p-12 pb-24 md:pb-12 overflow-y-auto">
                <div className="max-w-2xl w-full">
                    
                    {/* Step 0: Welcome */}
                    {step === 0 && (
                        <div className="animate-fade-up text-center space-y-6 md:space-y-8">
                            <h1 className="font-playfair text-4xl md:text-6xl font-bold text-[#222] dark:text-white leading-tight">
                                You survived it. Now <span className="text-maceng-maroon dark:text-maceng-orange">own your experience</span>.
                            </h1>
                            <p className="text-lg md:text-xl text-[#666] dark:text-[#a0a0a0] max-w-lg mx-auto">
                                Your experience is power. Help others navigate their path by sharing your story.
                            </p>
                            <div className="flex flex-col items-center gap-4 md:gap-6">
                                <button 
                                    onClick={nextStep}
                                    className="w-full sm:w-auto px-10 py-4 md:py-5 bg-maceng-maroon dark:bg-maceng-orange text-white rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-maceng-maroon/20 dark:shadow-maceng-orange/30"
                                >
                                    Get Started
                                </button>
                                <button 
                                    onClick={() => navigate('/')}
                                    className="text-xs md:text-sm font-medium text-[#999] hover:text-maceng-maroon dark:hover:text-maceng-orange transition-colors"
                                >
                                    Maybe later, take me back
                                </button>
                            </div>
                            <p className="text-[10px] md:text-xs text-[#999] dark:text-[#555]">takes ~90 seconds</p>
                        </div>
                    )}

                    {/* Step 1: Team & Position */}
                    {step === 1 && (
                        <div className="animate-fade-up space-y-8 md:space-y-12">
                            <div className="space-y-2 md:space-y-4">
                                <h2 className="text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] text-maceng-maroon dark:text-maceng-orange">01. TEAM DETAILS</h2>
                                <h3 className="font-playfair text-2xl md:text-4xl font-bold dark:text-white">Which team did you apply for?</h3>
                            </div>

                            <div className="space-y-10" ref={suggestionsRef}>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-[#999] uppercase tracking-widest">Team Name</label>
                                    <div className="relative">
                                        <input 
                                            autoFocus
                                            type="text" 
                                            value={teamQuery}
                                            onChange={(e) => {
                                                setTeamQuery(e.target.value);
                                                if (selectedTeam) setSelectedTeam(null);
                                            }}
                                            className="w-full bg-transparent border-b-2 border-[#eee] dark:border-[#333] focus:border-maceng-maroon dark:focus:border-maceng-orange py-4 text-3xl font-playfair outline-none transition-colors dark:text-white placeholder:text-[#ccc] dark:placeholder:text-[#333]"
                                            placeholder="Type team name..."
                                        />
                                        {showSuggestions && teamSuggestions.length > 0 && (
                                            <div className="absolute top-full left-0 w-full bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#333] rounded-xl shadow-2xl mt-2 overflow-hidden z-20">
                                                {teamSuggestions.map(t => (
                                                    <button 
                                                        key={t.id}
                                                        onClick={() => handleTeamSelect(t)}
                                                        className="w-full text-left px-6 py-4 hover:bg-[#fafafa] dark:hover:bg-[#252525] transition-colors border-b border-[#eee] dark:border-[#333] last:border-0 dark:text-white font-medium"
                                                    >
                                                        {t.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowRequestModal(true)}
                                        className="text-xs font-semibold text-maceng-orange hover:opacity-80 transition-opacity"
                                    >
                                        Can't find your design team? Request it →
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-[#999] uppercase tracking-widest">Role Name</label>
                                        <input 
                                            type="text" 
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                            className="w-full bg-transparent border-b-2 border-[#eee] dark:border-[#333] focus:border-maceng-maroon dark:focus:border-maceng-orange py-2 text-xl outline-none transition-colors dark:text-white"
                                            placeholder="e.g. Mechanical Lead"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-[#999] uppercase tracking-widest">Recruitment Term</label>
                                        <select 
                                            value={term}
                                            onChange={(e) => setTerm(e.target.value)}
                                            className="w-full bg-transparent border-b-2 border-[#eee] dark:border-[#333] focus:border-maceng-maroon dark:focus:border-maceng-orange py-2 text-xl outline-none transition-colors dark:text-white appearance-none cursor-pointer"
                                        >
                                            <option value="">Select term...</option>
                                            {TERM_OPTIONS.map(t => <option key={t} value={t} className="bg-white dark:bg-[#1a1a1a]">{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={nextStep}
                                className="px-8 py-4 bg-maceng-maroon dark:bg-maceng-orange text-white rounded-xl font-bold hover:scale-[1.02] transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {/* Step 2: Context */}
                    {step === 2 && (
                        <div className="animate-fade-up space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-maceng-maroon dark:text-maceng-orange">02. THE PROCESS</h2>
                                <h3 className="font-playfair text-4xl font-bold dark:text-white">How was the recruitment?</h3>
                            </div>

                            <div className="space-y-16">
                                <div className="space-y-6">
                                    <label className="text-xs font-bold text-[#999] uppercase tracking-widest block">Process Difficulty</label>
                                    <div className="flex gap-4">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setDifficulty(level)}
                                                className={`w-16 h-16 rounded-2xl text-2xl font-bold transition-all border-2 ${difficulty === level
                                                    ? 'bg-maceng-maroon dark:bg-maceng-orange border-transparent text-white scale-110 shadow-lg'
                                                    : 'bg-transparent border-[#eee] dark:border-[#333] text-[#999] hover:border-maceng-maroon dark:hover:border-maceng-orange'
                                                }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-maceng-maroon dark:text-maceng-orange font-bold uppercase tracking-[0.1em] text-sm">
                                        {DIFFICULTY_LABELS[difficulty]}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-[#999] uppercase tracking-widest block">Were you accepted?</label>
                                        <button 
                                            onClick={() => setAccepted(!accepted)}
                                            className={`w-full py-4 rounded-xl border-2 font-bold transition-all ${accepted 
                                                ? 'bg-green-500/10 border-green-500 text-green-500' 
                                                : 'border-[#eee] dark:border-[#333] text-[#999]'}`}
                                        >
                                            {accepted ? 'Yes, Joined!' : 'No / Declined'}
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-[#999] uppercase tracking-widest block">How did you find it?</label>
                                        <input 
                                            type="text" 
                                            value={interviewAcquisition}
                                            onChange={(e) => setInterviewAcquisition(e.target.value)}
                                            className="w-full bg-transparent border-b-2 border-[#eee] dark:border-[#333] focus:border-maceng-maroon dark:focus:border-maceng-orange py-2 text-xl outline-none transition-colors dark:text-white"
                                            placeholder="Friend, Fair, Discord..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={nextStep}
                                className="px-8 py-4 bg-maceng-maroon dark:bg-maceng-orange text-white rounded-xl font-bold hover:scale-[1.02] transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {/* Step 3: Description */}
                    {step === 3 && (
                        <div className="animate-fade-up space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-maceng-maroon dark:text-maceng-orange">03. THE JOURNEY</h2>
                                <h3 className="font-playfair text-4xl font-bold dark:text-white">Describe the process.</h3>
                                <p className="text-[#666] dark:text-[#888]">Was there a portfolio review? A technical task? Multiple interviews?</p>
                            </div>

                            <div className="space-y-6">
                                <textarea 
                                    autoFocus
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-transparent border-b-2 border-[#eee] dark:border-[#333] focus:border-maceng-maroon dark:focus:border-maceng-orange py-4 text-2xl outline-none transition-colors dark:text-white min-h-[200px]"
                                    placeholder="Write your story here..."
                                />
                            </div>

                            <button 
                                onClick={nextStep}
                                className="px-8 py-4 bg-maceng-maroon dark:bg-maceng-orange text-white rounded-xl font-bold hover:scale-[1.02] transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {/* Step 4: Advice & Email */}
                    {step === 4 && (
                        <form onSubmit={handleSubmit} className="animate-fade-up space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-maceng-maroon dark:text-maceng-orange">04. FINAL DETAILS</h2>
                                <h3 className="font-playfair text-4xl font-bold dark:text-white">Almost there.</h3>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-[#999] uppercase tracking-widest block">Tips for Success (Optional)</label>
                                    <textarea 
                                        value={tips}
                                        onChange={(e) => setTips(e.target.value)}
                                        className="w-full bg-transparent border-b-2 border-[#eee] dark:border-[#333] focus:border-maceng-maroon dark:focus:border-maceng-orange py-4 text-2xl outline-none transition-colors dark:text-white min-h-[150px]"
                                        placeholder="Any advice for other applicants?"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-[#999] uppercase tracking-widest block">Verify you're a McMaster student (private)</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent border-b-2 border-[#eee] dark:border-[#333] focus:border-maceng-maroon dark:focus:border-maceng-orange py-4 text-3xl font-playfair outline-none transition-colors dark:text-white"
                                        placeholder="yourname@mcmaster.ca"
                                        required
                                    />
                                    <p className="text-[11px] text-[#888] flex items-center gap-2 uppercase tracking-widest font-bold">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" /></svg>
                                        Your identity stays anonymous.
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium animate-shake">
                                    {error}
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={submitting}
                                className="w-full py-6 bg-maceng-maroon dark:bg-maceng-orange text-white rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-maceng-maroon/20 dark:shadow-maceng-orange/40 disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Complete Review →'}
                            </button>
                        </form>
                    )}

                    {/* Step Error Notice (Floating) */}
                    {error && step < 4 && (
                        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium animate-shake text-center">
                            {error}
                        </div>
                    )}

                </div>
            </div>

            {/* Footer Navigation Tip */}
            <div className="absolute bottom-6 md:bottom-8 left-0 w-full flex justify-center text-[8px] md:text-[10px] px-4 text-center uppercase tracking-[0.2em] font-bold text-[#ccc] dark:text-[#333] pointer-events-none opacity-60">
                Step {step} of {totalSteps} — McMaster Engineering Design Teams
            </div>

            <DesignTeamRequestModal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
            />
        </div>
    );
}
