import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { searchCompanies, submitExperience, submitCompanyRequest } from '../api/api';
import { type Company, type InterviewStage, type ExperienceSubmitData } from '../api/types';

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
    const [requestName, setRequestName] = useState('');
    const [requestEmail, setRequestEmail] = useState('');
    const [requestStatus, setRequestStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

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

    const handleRequestSubmit = async () => {
        if (!requestName.trim()) return;
        setRequestStatus('submitting');
        try {
            await submitCompanyRequest(requestName.trim(), requestEmail.trim() || undefined);
            setRequestStatus('success');
            setRequestName('');
            setRequestEmail('');
        } catch {
            setRequestStatus('error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!email.trim().toLowerCase().endsWith('@mcmaster.ca')) {
            setError('Please use your McMaster email address (@mcmaster.ca)');
            return;
        }

        if (!selectedCompany) {
            setError('Please select a company from the suggestions');
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
            company_id: selectedCompany.id,
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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen py-8 md:py-12 px-4 md:px-8 max-w-2xl mx-auto">
                <div className="text-center py-16">
                    <h1 className="font-playfair text-3xl font-semibold text-maceng-maroon mb-4">
                        Thank you!
                    </h1>
                    <p className="text-[15px] text-[#555] mb-8">
                        Your experience has been submitted successfully, and was sent to an admin for review. It will help fellow McMaster Engineering students prepare for interviews.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2.5 bg-maceng-maroon text-white rounded font-medium text-sm hover:bg-maceng-maroon/90 transition-colors"
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
                            className="px-6 py-2.5 border border-maceng-maroon text-maceng-maroon rounded font-medium text-sm hover:bg-maceng-maroon/5 transition-colors"
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

                <h1 className="font-playfair text-3xl font-semibold text-maceng-maroon mt-6 mb-2">
                    Submit an Experience
                </h1>
                <p className="text-[15px] text-[#555]">
                    Share your interview experience to help fellow McMaster Engineering students.
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
                    <p className="text-xs text-[#888] mt-1">Must be a @mcmaster.ca email address. Don't worry, this is only to verify you're a student and prevent spam. Your identity remains anonymous. </p>
                </div>

                {/* Company Search */}
                <div className="relative" ref={suggestionsRef}>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">
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
                            className={`flex-1 py-2 px-3 text-sm border rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon ${selectedCompany ? 'border-green-500 bg-green-50' : 'border-[#ccc]'
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
                    {showSuggestions && companySuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-[#ccc] rounded shadow-lg max-h-48 overflow-y-auto">
                            {companySuggestions.map((company) => (
                                <button
                                    key={company.id}
                                    type="button"
                                    onClick={() => handleCompanySelect(company)}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#fafafa] transition-colors border-b border-[#f0f0f0] last:border-b-0"
                                >
                                    <span className="font-medium text-[#333]">{company.name}</span>
                                    {company.industries.length > 0 && (
                                        <span className="text-[#888] ml-2 text-xs">
                                            {company.industries.join(', ')}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                    {/* Company request trigger */}
                    {!selectedCompany && (
                        <div className="mt-2">
                            <button
                                type="button"
                                onClick={() => { setShowRequestModal(true); setRequestStatus('idle'); setRequestName(''); }}
                                className="text-xs text-maceng-orange hover:text-maceng-maroon transition-colors"
                            >
                                Can't find your company? Request it →
                            </button>
                        </div>
                    )}
                </div>

                {/* Position */}
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">
                        Position <span className="text-maceng-orange">*</span>
                    </label>
                    <input
                        type="text"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="e.g. Software Engineering Intern"
                        className="w-full py-2 px-3 text-sm border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon"
                        required
                    />
                </div>

                {/* Interview Acquisition */}
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">
                        How did you get the interview?
                    </label>
                    <input
                        type="text"
                        value={interviewAcquisition}
                        onChange={(e) => setInterviewAcquisition(e.target.value)}
                        placeholder="e.g. Career Fair, LinkedIn, Cold Apply, Referral"
                        className="w-full py-2 px-3 text-sm border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon"
                    />
                    <p className="text-xs text-[#888] mt-1">Optional. Helps others understand the application process.</p>
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

                {/* Offer Received */}
                <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={offerReceived}
                            onChange={(e) => setOfferReceived(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-[#ddd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-maceng-maroon"></div>
                    </label>
                    <span className="text-sm text-[#333]">Received an offer</span>
                </div>

                {/* Difficulty */}
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">
                        Interview Difficulty
                    </label>
                    <div className="flex gap-2 items-center">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => setDifficulty(level)}
                                className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${difficulty === level
                                    ? 'bg-maceng-maroon text-white shadow-md'
                                    : 'bg-[#f0f0f0] text-[#555] hover:bg-[#e0e0e0]'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                        <span className="text-xs text-[#888] ml-2">
                            {difficulty <= 2 ? 'Easy' : difficulty === 3 ? 'Medium' : 'Hard'}
                        </span>
                    </div>
                </div>

                {/* Interview Stages */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-[#333]">
                            Interview Stages
                        </label>
                        <button
                            type="button"
                            onClick={addStage}
                            className="text-sm text-maceng-orange hover:text-maceng-maroon transition-colors font-medium"
                        >
                            + Add Stage
                        </button>
                    </div>
                    {stages.length === 0 && (
                        <p className="text-xs text-[#888] italic">
                            No stages added yet. Click "Add Stage" to document each interview round.
                        </p>
                    )}
                    <div className="space-y-4">
                        {stages.map((stage, index) => (
                            <div key={index} className="border border-[#e5e5e5] rounded p-4 bg-[#fafafa]">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-medium text-maceng-maroon uppercase tracking-wide">
                                        Stage {index + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeStage(index)}
                                        className="text-xs text-[#888] hover:text-red-500 transition-colors"
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
                                        className="py-1.5 px-2.5 text-sm border border-[#ddd] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon"
                                    />
                                    <input
                                        type="text"
                                        value={stage.duration || ''}
                                        onChange={(e) => updateStage(index, 'duration', e.target.value)}
                                        placeholder="Duration (e.g. 45 min)"
                                        className="py-1.5 px-2.5 text-sm border border-[#ddd] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon"
                                    />
                                </div>
                                <textarea
                                    value={stage.questions.join('\n')}
                                    onChange={(e) => updateStage(index, 'questions', e.target.value.split('\n').filter(q => q.trim()))}
                                    placeholder="Questions asked"
                                    rows={2}
                                    className="w-full py-1.5 px-2.5 text-sm border border-[#ddd] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon resize-none"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tips */}
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">
                        Tips & Advice
                    </label>
                    <textarea
                        value={tips}
                        onChange={(e) => setTips(e.target.value)}
                        placeholder="Any advice for future candidates? (optional)"
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
                    className="w-full py-3 bg-maceng-maroon text-white rounded font-medium text-sm hover:bg-maceng-maroon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Submitting...' : 'Submit Experience'}
                </button>
            </form>

            {/* Company Request Modal */}
            {showRequestModal && (
                <div
                    className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowRequestModal(false)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="font-playfair text-lg text-maceng-maroon mb-1">Request a Company</h3>
                        <p className="text-xs text-[#888] mb-4">An admin will review and add it shortly.</p>

                        {requestStatus === 'success' ? (
                            <div className="text-center py-4">
                                <p className="text-green-600 font-medium text-sm">✓ Request submitted!</p>
                                <button
                                    onClick={() => setShowRequestModal(false)}
                                    className="mt-3 text-xs text-[#888] hover:text-[#333]"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={requestName}
                                    onChange={(e) => setRequestName(e.target.value)}
                                    placeholder="Company name"
                                    autoFocus
                                    className="w-full py-2.5 px-3.5 text-sm border border-[#ddd] rounded-lg font-inter bg-white focus:outline-none focus:ring-4 focus:ring-maceng-maroon/10 focus:border-maceng-maroon transition-all mb-3"
                                />
                                <input
                                    type="email"
                                    value={requestEmail}
                                    onChange={(e) => setRequestEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && requestName.trim() && handleRequestSubmit()}
                                    placeholder="Your email (optional)"
                                    className="w-full py-2.5 px-3.5 text-sm border border-[#ddd] rounded-lg font-inter bg-white focus:outline-none focus:ring-4 focus:ring-maceng-maroon/10 focus:border-maceng-maroon transition-all mb-4"
                                />
                                {requestStatus === 'error' && (
                                    <p className="text-xs text-red-600 mb-2">Failed to submit. Try again.</p>
                                )}
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => setShowRequestModal(false)}
                                        className="px-3 py-1.5 text-sm text-[#666] hover:text-[#333] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRequestSubmit}
                                        disabled={!requestName.trim() || requestStatus === 'submitting'}
                                        className="px-4 py-1.5 bg-maceng-maroon text-white text-sm rounded font-medium hover:bg-maceng-maroon/90 transition-colors disabled:opacity-50"
                                    >
                                        {requestStatus === 'submitting' ? 'Sending...' : 'Submit'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[#e5e5e5] text-[13px] text-[#666]">
                <p>
                    © {new Date().getFullYear()} MacEngDB · Built by McMaster Engineering students
                </p>
            </footer>
        </div>
    );
}
