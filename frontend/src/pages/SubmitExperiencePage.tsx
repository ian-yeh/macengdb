import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { searchCompanies, submitExperience } from '../api/api';
import { type Company, type InterviewStage, type ExperienceSubmitData } from '../api/types';
import CompanyRequestModal from '../components/features/companies/CompanyRequestModal';
import { usePostHog } from '@posthog/react';

const TERM_OPTIONS = [
    'Winter 2021', 'Spring 2021', 'Summer 2021', 'Fall 2021',
    'Winter 2022', 'Spring 2022', 'Summer 2022', 'Fall 2022',
    'Winter 2023', 'Spring 2023', 'Summer 2023', 'Fall 2023',
    'Winter 2024', 'Spring 2024', 'Summer 2024', 'Fall 2024',
    'Winter 2025', 'Spring 2025', 'Summer 2025', 'Fall 2025',
    'Winter 2026', 'Spring 2026', 'Summer 2026', 'Fall 2026',
];

export default function SubmitExperiencePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const posthog = usePostHog();

    // Step state
    const [step, setStep] = useState(0);
    const totalSteps = 5; // Intro, Details, Context, Rounds, Final/Submit

    // Form state
    const [email, setEmail] = useState('');
    const [companyQuery, setCompanyQuery] = useState('');
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [companySuggestions, setCompanySuggestions] = useState<Company[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [position, setPosition] = useState('');
    const [term, setTerm] = useState('');
    const [offerReceived, setOfferReceived] = useState(false);
    const [difficulty, setDifficulty] = useState(3);
    const [stages, setStages] = useState<InterviewStage[]>([]);
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
        // Simple validation for each step
        if (step === 1) {
            if (!selectedCompany && !companyQuery.trim()) {
                setError('First, let us know where you interviewed.');
                return;
            }
            if (!position.trim()) {
                setError('What was the role title?');
                return;
            }
            if (!term) {
                setError('Which term was this for?');
                return;
            }
        }
        if (step === 3 && stages.length === 0) {
            setError('Please add at least one interview stage.');
            return;
        }

        setError('');
        setStep(s => Math.min(s + 1, totalSteps));
    }, [step, selectedCompany, companyQuery, position, term, stages.length, totalSteps]);

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

    // Company search logic
    useEffect(() => {
        if (!companyQuery.trim() || selectedCompany) {
            setCompanySuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const results = await searchCompanies(companyQuery);
                setCompanySuggestions(results);
                setShowSuggestions(true);
            } catch {
                setCompanySuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [companyQuery, selectedCompany]);

    const handleCompanySelect = (company: Company) => {
        setSelectedCompany(company);
        setCompanyQuery(company.name);
        setShowSuggestions(false);
    };

    // Stage management
    const addStage = () => setStages([...stages, { name: '', duration: '', questions: [] }]);
    const removeStage = (index: number) => setStages(stages.filter((_, i) => i !== index));
    const updateStage = (index: number, field: keyof InterviewStage, value: string | string[]) => {
        const updated = [...stages];
        updated[index] = { ...updated[index], [field]: value };
        setStages(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim().toLowerCase().endsWith('@mcmaster.ca')) {
            setError('Please use your McMaster email (@mcmaster.ca)');
            return;
        }

        const data: ExperienceSubmitData = {
            submitter_email: email.trim().toLowerCase(),
            company_id: selectedCompany?.id,
            new_company_name: !selectedCompany ? companyQuery.trim() : undefined,
            position: position.trim(),
            term,
            offer_received: offerReceived,
            difficulty,
            stages: stages.filter(s => s.name.trim()),
            tips: tips.trim() || undefined,
            interview_acquisition: interviewAcquisition.trim() || undefined,
        };

        setSubmitting(true);
        try {
            await submitExperience(data);
            queryClient.invalidateQueries({ queryKey: ['companies'] });
            queryClient.invalidateQueries({ queryKey: ['experiences'] });
            setSuccess(true);
            posthog.capture('interview_experience_submit_success', {
                company_name: selectedCompany?.name || data.new_company_name,
                position: data.position
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
                    <h1 className="font-playfair text-4xl font-bold text-[#222] dark:text-white mb-4">You're all set.</h1>
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
            <div className="flex-grow flex items-center justify-center p-6 md:p-12 overflow-y-auto">
                <div className="max-w-2xl w-full">
                    
                    {/* Step 0: Welcome */}
                    {step === 0 && (
                        <div className="animate-fade-up text-center space-y-8">
                            <h1 className="font-playfair text-5xl md:text-6xl font-bold text-[#222] dark:text-white leading-tight">
                                You survived it. Now <span className="text-maceng-maroon dark:text-maceng-orange">own your experience</span>.
                            </h1>
                            <p className="text-xl text-[#666] dark:text-[#a0a0a0] max-w-lg mx-auto">
                                Your experience is power. Help others navigate their path by sharing your story.
                            </p>
                            <div className="flex flex-col items-center gap-6">
                                <button 
                                    onClick={nextStep}
                                    className="px-10 py-5 bg-maceng-maroon dark:bg-maceng-orange text-white rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-maceng-maroon/20 dark:shadow-maceng-orange/30"
                                >
                                    Get Started
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="text-sm font-medium text-[#999] hover:text-maceng-maroon dark:hover:text-maceng-orange transition-colors"
                                >
                                    Maybe later, take me back
                                </button>
                            </div>
                            <p className="text-xs text-[#999] dark:text-[#555]">takes ~2 mins</p>
                        </div>
                    )}

                    {/* Step 1: Company & Role */}
                    {step === 1 && (
                        <div className="animate-fade-up space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-maceng-maroon dark:text-maceng-orange">01. THE BASICS</h2>
                                <h3 className="font-playfair text-4xl font-bold dark:text-white">Where did you interview?</h3>
                            </div>

                            <div className="space-y-10" ref={suggestionsRef}>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-[#999] uppercase tracking-widest">Company Name</label>
                                    <div className="relative">
                                        <input 
                                            autoFocus
                                            type="text" 
                                            value={companyQuery}
                                            onChange={(e) => {
                                                setCompanyQuery(e.target.value);
                                                if (selectedCompany) setSelectedCompany(null);
                                            }}
                                            className="w-full bg-transparent border-b-2 border-[#eee] dark:border-[#333] focus:border-maceng-maroon dark:focus:border-maceng-orange py-4 text-3xl font-playfair outline-none transition-colors dark:text-white placeholder:text-[#ccc] dark:placeholder:text-[#333]"
                                            placeholder="Type company name..."
                                        />
                                        {showSuggestions && companySuggestions.length > 0 && (
                                            <div className="absolute top-full left-0 w-full bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#333] rounded-xl shadow-2xl mt-2 overflow-hidden z-20">
                                                {companySuggestions.map(c => (
                                                    <button 
                                                        key={c.id}
                                                        onClick={() => handleCompanySelect(c)}
                                                        className="w-full text-left px-6 py-4 hover:bg-[#fafafa] dark:hover:bg-[#252525] transition-colors border-b border-[#eee] dark:border-[#333] last:border-0 dark:text-white font-medium"
                                                    >
                                                        {c.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-[#999] uppercase tracking-widest">Position Title</label>
                                        <input 
                                            type="text" 
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                            className="w-full bg-transparent border-b-2 border-[#eee] dark:border-[#333] focus:border-maceng-maroon dark:focus:border-maceng-orange py-2 text-xl outline-none transition-colors dark:text-white"
                                            placeholder="e.g. Software Intern"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-[#999] uppercase tracking-widest">Work Term</label>
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

                    {/* Step 2: Difficulty & Context */}
                    {step === 2 && (
                        <div className="animate-fade-up space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-maceng-maroon dark:text-maceng-orange">02. THE VIBE</h2>
                                <h3 className="font-playfair text-4xl font-bold dark:text-white">How was the experience?</h3>
                            </div>

                            <div className="space-y-16">
                                <div className="space-y-6">
                                    <label className="text-xs font-bold text-[#999] uppercase tracking-widest block">Overall Difficulty</label>
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
                                        {difficulty <= 2 ? 'Quite Chill' : difficulty === 3 ? 'Medium Challenge' : 'Very Intense'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-[#999] uppercase tracking-widest block">Did you get the offer?</label>
                                        <button 
                                            onClick={() => setOfferReceived(!offerReceived)}
                                            className={`w-full py-4 rounded-xl border-2 font-bold transition-all ${offerReceived 
                                                ? 'bg-green-500/10 border-green-500 text-green-500' 
                                                : 'border-[#eee] dark:border-[#333] text-[#999]'}`}
                                        >
                                            {offerReceived ? 'Yes, Secured!' : 'No / Pending'}
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-[#999] uppercase tracking-widest block">How did you get it?</label>
                                        <input 
                                            type="text" 
                                            value={interviewAcquisition}
                                            onChange={(e) => setInterviewAcquisition(e.target.value)}
                                            className="w-full bg-transparent border-b-2 border-[#eee] dark:border-[#333] focus:border-maceng-maroon dark:focus:border-maceng-orange py-2 text-xl outline-none transition-colors dark:text-white"
                                            placeholder="Referral, OscarPlus, etc."
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

                    {/* Step 3: Interview Rounds */}
                    {step === 3 && (
                        <div className="animate-fade-up space-y-8 w-full max-w-3xl">
                            <div className="space-y-4">
                                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-maceng-maroon dark:text-maceng-orange">03. THE PROCESS</h2>
                                <h3 className="font-playfair text-4xl font-bold dark:text-white">Break down the rounds.</h3>
                                <p className="text-[#666] dark:text-[#888]">Describe what happened in each interview stage.</p>
                            </div>

                            <div className="space-y-6">
                                {stages.map((stage, idx) => (
                                    <div key={idx} className="bg-[#fafafa] dark:bg-[#1a1a1a] rounded-2xl p-6 border border-[#eee] dark:border-[#333] space-y-6 relative group">
                                        <button 
                                            onClick={() => removeStage(idx)}
                                            className="absolute top-4 right-4 text-xs font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Remove
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest">Stage Name</label>
                                                <input 
                                                    type="text"
                                                    value={stage.name}
                                                    onChange={(e) => updateStage(idx, 'name', e.target.value)}
                                                    className="w-full bg-white dark:bg-[#0f0f0f] border border-[#eee] dark:border-[#333] rounded-lg p-3 text-sm focus:border-maceng-orange outline-none dark:text-white"
                                                    placeholder="e.g. Technical Interview"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest">Duration</label>
                                                <input 
                                                    type="text"
                                                    value={stage.duration || ''}
                                                    onChange={(e) => updateStage(idx, 'duration', e.target.value)}
                                                    className="w-full bg-white dark:bg-[#0f0f0f] border border-[#eee] dark:border-[#333] rounded-lg p-3 text-sm focus:border-maceng-orange outline-none dark:text-white"
                                                    placeholder="e.g. 1 hour"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest">What happened?</label>
                                            <textarea 
                                                value={stage.questions.join('\n')}
                                                onChange={(e) => updateStage(idx, 'questions', e.target.value.split('\n'))}
                                                className="w-full bg-white dark:bg-[#0f0f0f] border border-[#eee] dark:border-[#333] rounded-lg p-4 text-sm focus:border-maceng-orange outline-none dark:text-white min-h-[100px]"
                                                placeholder="Format, questions asked, difficulty..."
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button 
                                    onClick={addStage}
                                    className="w-full py-6 border-2 border-dashed border-[#eee] dark:border-[#333] rounded-2xl text-sm font-bold text-[#999] hover:border-maceng-orange hover:text-maceng-orange transition-all"
                                >
                                    + Add Interview Round
                                </button>
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
                                <h3 className="font-playfair text-4xl font-bold dark:text-white">Almost done.</h3>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-[#999] uppercase tracking-widest block">Final Advice (Optional)</label>
                                    <textarea 
                                        value={tips}
                                        onChange={(e) => setTips(e.target.value)}
                                        className="w-full bg-transparent border-b-2 border-[#eee] dark:border-[#333] focus:border-maceng-maroon dark:focus:border-maceng-orange py-4 text-2xl outline-none transition-colors dark:text-white min-h-[150px]"
                                        placeholder="What should others know?"
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
                                {submitting ? 'Submitting...' : 'Complete Submission →'}
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
            <div className="absolute bottom-8 left-0 w-full flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold text-[#ccc] dark:text-[#333] pointer-events-none">
                Step {step} of {totalSteps} — McMaster Engineering Interview Database
            </div>

            <CompanyRequestModal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
            />
        </div>
    );
}
