import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { searchCompanies, submitExperience } from '../api/api';
import { type Company, type InterviewStage, type ExperienceSubmitData } from '../api/types';
import CompanyRequestModal from '../components/CompanyRequestModal';
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

    // Company search
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

    const handleCompanySelect = (company: Company) => {
        setSelectedCompany(company);
        setCompanyQuery(company.name);
        setShowSuggestions(false);
    };

    const handleCompanyClear = () => {
        setSelectedCompany(null);
        setCompanyQuery('');
    };

    // Stage management
    const addStage = () => {
        setStages([...stages, { name: '', duration: '', questions: [] }]);
    };

    const updateStage = (index: number, field: keyof InterviewStage, value: string | string[]) => {
        const updated = [...stages];
        updated[index] = { ...updated[index], [field]: value };
        setStages(updated);
    };

    const removeStage = (index: number) => {
        setStages(stages.filter((_, i) => i !== index));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!email.trim().toLowerCase().endsWith('@mcmaster.ca')) {
            setError('Please use your McMaster email address (@mcmaster.ca)');
            return;
        }

        if (!selectedCompany && !companyQuery.trim()) {
            setError('Please search for a company or enter a new one');
            return;
        }

        if (!position.trim()) {
            setError('Please enter the position title');
            return;
        }

        if (!term) {
            setError('Please select a term');
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
            stages: stages.filter(s => s.name.trim()), // Only include filled-in stages
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
            posthog.capture('interview_experience_submit_failed', {
                company_name: selectedCompany?.name,
                error: errorMessage
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen py-8 md:py-12 px-4 md:px-8 max-w-2xl mx-auto">
                <div className="text-center py-16">
                    <h1 className="font-playfair text-3xl font-semibold text-maceng-maroon dark:text-maceng-orange mb-4">
                        Thank you!
                    </h1>
                    <p className="text-[15px] text-[#555] dark:text-[#e5e5e5] mb-8">
                        Your experience has been submitted successfully, and was sent to an admin for review. It will help fellow McMaster Engineering students prepare for interviews.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2.5 bg-maceng-maroon dark:bg-maceng-orange text-white rounded font-medium text-sm hover:bg-maceng-maroon/90 dark:hover:bg-maceng-orange/90 transition-colors"
                        >
                            Back to Companies
                        </button>
                        <button
                            onClick={() => {
                                setSuccess(false);
                                setEmail('');
                                setSelectedCompany(null);
                                setCompanyQuery('');
                                setPosition('');
                                setTerm('');
                                setOfferReceived(false);
                                setDifficulty(3);
                                setStages([]);
                                setTips('');
                                setInterviewAcquisition('');
                            }}
                            className="px-6 py-2.5 border border-maceng-maroon dark:border-maceng-orange text-maceng-maroon dark:text-maceng-orange rounded font-medium text-sm hover:bg-maceng-maroon/5 dark:hover:bg-maceng-orange/10 transition-colors"
                        >
                            Submit Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 md:py-12 px-4 md:px-8 max-w-2xl mx-auto">
            {/* Header */}
            <header className="mb-8">
                <Link
                    to="/"
                    className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange text-sm"
                >
                    ← Back to companies
                </Link>

                <h1 className="font-playfair text-3xl font-semibold text-maceng-maroon dark:text-maceng-orange mt-6 mb-2">
                    Submit an Experience
                </h1>
                <p className="text-[15px] text-[#555] dark:text-[#e5e5e5]">
                    Share your interview experience to help fellow McMaster Engineering students.
                </p>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-[#333] dark:text-white mb-1.5">
                        McMaster Email <span className="text-maceng-orange">*</span>
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@mcmaster.ca"
                        className="w-full py-2 px-3 text-sm border border-[#ccc] dark:border-[#444] rounded font-inter bg-white dark:bg-[#111111] dark:text-white focus:outline-none focus:border-maceng-maroon dark:focus:border-maceng-orange"
                        required
                    />
                    <p className="text-xs text-[#888] dark:text-[#a0a0a0] mt-1">Must be a @mcmaster.ca email address. Don't worry, this is only to verify you're a student and prevent spam. Your identity remains anonymous. </p>
                </div>

                {/* Company Search */}
                <div className="relative" ref={suggestionsRef}>
                    <label className="block text-sm font-medium text-[#333] dark:text-white mb-1.5">
                        Company <span className="text-maceng-orange">*</span>
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={companyQuery}
                            onChange={(e) => {
                                setCompanyQuery(e.target.value);
                                if (selectedCompany) setSelectedCompany(null);
                            }}
                            placeholder="Search for a company..."
                            className={`flex-1 py-2 px-3 text-sm border rounded font-inter bg-white dark:bg-[#111111] dark:text-white focus:outline-none focus:border-maceng-maroon dark:focus:border-maceng-orange ${selectedCompany ? 'border-green-500 bg-green-50 dark:bg-green-950/20 dark:border-green-800' : 'border-[#ccc] dark:border-[#444]'
                                }`}
                        />
                        {selectedCompany && (
                            <button
                                type="button"
                                onClick={handleCompanyClear}
                                className="px-3 text-sm text-[#888] hover:text-[#333] transition-colors"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    {showSuggestions && (companySuggestions.length > 0 || (companyQuery.trim() && !selectedCompany)) && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#111111] border border-[#ccc] dark:border-[#444] rounded shadow-lg max-h-64 overflow-y-auto">
                            {companySuggestions.map((company) => (
                                <button
                                    key={company.id}
                                    type="button"
                                    onClick={() => handleCompanySelect(company)}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#fafafa] dark:hover:bg-[#222] transition-colors border-b border-[#f0f0f0] dark:border-[#444] last:border-b-0"
                                >
                                    <span className="font-medium text-[#333] dark:text-white">{company.name}</span>
                                    {company.industries.length > 0 && (
                                        <span className="text-[#888] dark:text-[#a0a0a0] ml-2 text-xs">
                                            {company.industries.join(', ')}
                                        </span>
                                    )}
                                </button>
                            ))}
                            {companyQuery.trim() && !selectedCompany && !companySuggestions.some(c => c.name.toLowerCase() === companyQuery.toLowerCase().trim()) && (
                                <button
                                    type="button"
                                    onClick={() => setShowSuggestions(false)}
                                    className="w-full text-left px-3 py-3 text-sm hover:bg-maceng-orange/5 transition-colors border-t border-[#f0f0f0] dark:border-[#444] flex items-center justify-between"
                                >
                                    <div>
                                        <span className="text-[#333] dark:text-white">Use </span>
                                        <span className="font-bold text-maceng-orange">"{companyQuery}"</span>
                                        <span className="text-[#333] dark:text-white"> as a new company</span>
                                    </div>
                                    <span className="text-[10px] bg-maceng-orange/10 text-maceng-orange px-2 py-0.5 rounded font-bold uppercase tracking-wider">New</span>
                                </button>
                            )}
                        </div>
                    )}
                    {/* Company request trigger */}
                    {!selectedCompany && (
                        <div className="mt-2">
                            <button
                                type="button"
                                onClick={() => setShowRequestModal(true)}
                                className="text-xs text-maceng-orange hover:text-maceng-maroon transition-colors"
                            >
                                Can't find your company? Request it →
                            </button>
                        </div>
                    )}
                </div>

                {/* Position */}
                <div>
                    <label className="block text-sm font-medium text-[#333] dark:text-white mb-1.5">
                        Position <span className="text-maceng-orange">*</span>
                    </label>
                    <input
                        type="text"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="e.g. Software Engineering Intern"
                        className="w-full py-2 px-3 text-sm border border-[#ccc] dark:border-[#444] rounded font-inter bg-white dark:bg-[#111111] dark:text-white focus:outline-none focus:border-maceng-maroon dark:focus:border-maceng-orange"
                        required
                    />
                </div>

                {/* Interview Acquisition */}
                <div>
                    <label className="block text-sm font-medium text-[#333] dark:text-white mb-1.5">
                        How did you get the interview?
                    </label>
                    <input
                        type="text"
                        value={interviewAcquisition}
                        onChange={(e) => setInterviewAcquisition(e.target.value)}
                        placeholder="e.g. Career Fair, LinkedIn, Cold Apply, Referral"
                        className="w-full py-2 px-3 text-sm border border-[#ccc] dark:border-[#444] rounded font-inter bg-white dark:bg-[#111111] dark:text-white focus:outline-none focus:border-maceng-maroon dark:focus:border-maceng-orange"
                    />
                    <p className="text-xs text-[#888] dark:text-[#a0a0a0] mt-1">Optional. Helps others understand the application process.</p>
                </div>

                {/* Term */}
                <div>
                    <label className="block text-sm font-medium text-[#333] dark:text-white mb-1.5">
                        Term <span className="text-maceng-orange">*</span>
                    </label>
                    <select
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        className="w-full py-2 px-3 text-sm border border-[#ccc] dark:border-[#444] rounded font-inter bg-white dark:bg-[#111111] dark:text-white focus:outline-none focus:border-maceng-maroon dark:focus:border-maceng-orange"
                        required
                    >
                        <option value="">Select a term...</option>
                        {TERM_OPTIONS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {/* Offer Received */}
                <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={offerReceived}
                            onChange={(e) => setOfferReceived(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-[#ddd] dark:bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-maceng-maroon dark:peer-checked:bg-maceng-orange"></div>
                    </label>
                    <span className="text-sm text-[#333] dark:text-white">Received an offer</span>
                </div>

                {/* Difficulty */}
                <div>
                    <label className="block text-sm font-medium text-[#333] dark:text-white mb-1.5">
                        Interview Difficulty
                    </label>
                    <div className="flex gap-2 items-center">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => setDifficulty(level)}
                                className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${difficulty === level
                                    ? 'bg-maceng-maroon dark:bg-maceng-orange text-white shadow-md'
                                    : 'bg-[#f0f0f0] dark:bg-[#333] text-[#555] dark:text-[#e5e5e5] hover:bg-[#e0e0e0] dark:hover:bg-[#444]'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                        <span className="text-xs text-[#888] dark:text-[#a0a0a0] ml-2">
                            {difficulty <= 2 ? 'Easy' : difficulty === 3 ? 'Medium' : 'Hard'}
                        </span>
                    </div>
                </div>

                {/* Interview Stages */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-[#333] dark:text-white">
                            Interview Stages
                        </label>
                        <button
                            type="button"
                            onClick={addStage}
                            className="text-sm text-maceng-orange hover:text-maceng-maroon dark:hover:text-maceng-orange/80 transition-colors font-medium"
                        >
                            + Add Stage
                        </button>
                    </div>
                    {stages.length === 0 && (
                        <p className="text-xs text-[#888] dark:text-[#a0a0a0] italic">
                            No stages added yet. Click "Add Stage" to document each interview round.
                        </p>
                    )}
                    <div className="space-y-4">
                        {stages.map((stage, index) => (
                            <div key={index} className="border border-[#e5e5e5] dark:border-[#444] rounded p-4 bg-[#fafafa] dark:bg-[#111111]">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-medium text-maceng-maroon dark:text-maceng-orange uppercase tracking-wide">
                                        Stage {index + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeStage(index)}
                                        className="text-xs text-[#888] dark:text-[#a0a0a0] hover:text-red-500 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={stage.name}
                                        onChange={(e) => updateStage(index, 'name', e.target.value)}
                                        placeholder="Stage name (e.g. Technical Interview)"
                                        className="py-1.5 px-2.5 text-sm border border-[#ddd] dark:border-[#444] rounded font-inter bg-white dark:bg-[#202020] dark:text-white focus:outline-none focus:border-maceng-maroon dark:focus:border-maceng-orange"
                                    />
                                    <input
                                        type="text"
                                        value={stage.duration || ''}
                                        onChange={(e) => updateStage(index, 'duration', e.target.value)}
                                        placeholder="Duration (e.g. 45 min)"
                                        className="py-1.5 px-2.5 text-sm border border-[#ddd] dark:border-[#444] rounded font-inter bg-white dark:bg-[#202020] dark:text-white focus:outline-none focus:border-maceng-maroon dark:focus:border-maceng-orange"
                                    />
                                </div>
                                <textarea
                                    value={stage.questions.join('\n')}
                                    onChange={(e) => updateStage(index, 'questions', e.target.value.split('\n').filter(q => q.trim()))}
                                    placeholder="Questions asked"
                                    rows={2}
                                    className="w-full py-1.5 px-2.5 text-sm border border-[#ddd] dark:border-[#444] rounded font-inter bg-white dark:bg-[#202020] dark:text-white focus:outline-none focus:border-maceng-maroon dark:focus:border-maceng-orange min-h-[80px]"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tips */}
                <div>
                    <label className="block text-sm font-medium text-[#333] dark:text-white mb-1.5">
                        Tips & Advice
                    </label>
                    <textarea
                        value={tips}
                        onChange={(e) => setTips(e.target.value)}
                        placeholder="Any advice for future candidates? (optional)"
                        rows={3}
                        className="w-full py-2 px-3 text-sm border border-[#ccc] dark:border-[#444] rounded font-inter bg-white dark:bg-[#111111] dark:text-white focus:outline-none focus:border-maceng-maroon dark:focus:border-maceng-orange min-h-[100px]"
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
                    className="w-full py-3 bg-maceng-maroon text-white rounded font-medium text-sm hover:bg-maceng-maroon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Submitting...' : 'Submit Experience'}
                </button>
            </form>

            {/* Request Modal */}
            <CompanyRequestModal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
            />

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[#e5e5e5] dark:border-[#444] text-[13px] text-[#666] dark:text-[#d4d4d4]">
                <p>
                    © {new Date().getFullYear()} MacEngDB · Built by McMaster Engineering students
                </p>
            </footer>
        </div>
    );
}
