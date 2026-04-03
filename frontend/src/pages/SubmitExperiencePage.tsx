import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { searchCompanies, submitExperience } from '../api/api';
import { type Company, type InterviewStage, type ExperienceSubmitData } from '../api/types';
import CompanyRequestModal from '../components/features/companies/CompanyRequestModal';
import Footer from '../components/layout/Footer';
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
            <div className="min-h-screen py-8 md:py-12 px-4 md:px-8 max-w-2xl mx-auto flex flex-col items-center justify-center">
                <div className="text-center py-16 flex-grow">
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
                    ← Back to companies
                </Link>

                <h1 className="font-playfair text-4xl font-bold text-[#222] dark:text-white mb-3">
                    Submit an Experience
                </h1>
                <p className="text-[17px] text-[#555] dark:text-[#b0b0b0] leading-relaxed">
                    Share your interview journey to help fellow McMaster Engineering students prepare with confidence.
                </p>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-12 flex-grow">
                {/* 1. Core Details */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-maceng-maroon/10 dark:bg-maceng-orange/10 flex items-center justify-center text-maceng-maroon dark:text-maceng-orange font-bold text-sm">1</div>
                        <h2 className="text-xl font-bold text-[#222] dark:text-white">Role Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Company Search */}
                        <div className="relative md:col-span-2" ref={suggestionsRef}>
                            <label className="block text-sm font-semibold text-[#333] dark:text-white mb-2">
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
                                    className={`flex-1 py-2.5 px-4 text-sm border rounded-lg font-inter bg-white dark:bg-[#111] dark:text-white focus:outline-none focus:ring-2 focus:ring-maceng-maroon/20 dark:focus:ring-maceng-orange/20 ${selectedCompany ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' : 'border-[#ccc] dark:border-[#444]'}`}
                                />
                                {selectedCompany && (
                                    <button
                                        type="button"
                                        onClick={handleCompanyClear}
                                        className="px-2 text-[#888] hover:text-[#333] transition-colors"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            {showSuggestions && (companySuggestions.length > 0 || (companyQuery.trim() && !selectedCompany)) && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#111] border border-[#ccc] dark:border-[#444] rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                    {companySuggestions.map((company) => (
                                        <button
                                            key={company.id}
                                            type="button"
                                            onClick={() => handleCompanySelect(company)}
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-[#fafafa] dark:hover:bg-[#222] transition-colors border-b border-[#f0f0f0] dark:border-[#444] last:border-b-0"
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
                                            className="w-full text-left px-4 py-4 text-sm hover:bg-maceng-orange/5 transition-colors border-t border-[#f0f0f0] dark:border-[#444] flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#333] dark:text-white">Use <span className="font-bold text-maceng-orange">"{companyQuery}"</span> as a new company</span>
                                            </div>
                                            <span className="text-[10px] bg-maceng-orange/10 text-maceng-orange px-2 py-0.5 rounded font-bold uppercase tracking-wider">New</span>
                                        </button>
                                    )}
                                </div>
                            )}
                            {!selectedCompany && (
                                <div className="mt-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setShowRequestModal(true)}
                                        className="text-xs font-semibold text-maceng-orange hover:text-maceng-maroon transition-colors"
                                    >
                                        Don't see your company? Request it →
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Position */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-[#333] dark:text-white mb-2">
                                Position <span className="text-maceng-orange">*</span>
                            </label>
                            <input
                                type="text"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                placeholder="e.g. Software Engineering Intern"
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

                        {/* Interview Acquisition */}
                        <div>
                            <label className="block text-sm font-semibold text-[#333] dark:text-white mb-2">
                                Acquisition
                            </label>
                            <input
                                type="text"
                                value={interviewAcquisition}
                                onChange={(e) => setInterviewAcquisition(e.target.value)}
                                placeholder="e.g. Referral, OscarPlus"
                                className="w-full py-2.5 px-4 text-sm border border-[#ccc] dark:border-[#444] rounded-lg font-inter bg-white dark:bg-[#111] dark:text-white focus:outline-none focus:ring-2 focus:ring-maceng-maroon/20 dark:focus:ring-maceng-orange/20"
                            />
                        </div>

                        {/* Offer & Difficulty Group */}
                        <div className="md:col-span-2 flex flex-col md:flex-row md:items-end gap-8 pt-2">
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-[#333] dark:text-white mb-3">
                                    Overall Difficulty
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
                                        {difficulty <= 2 ? 'Easy' : difficulty === 3 ? 'Medium' : 'Hard'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 h-10">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={offerReceived}
                                        onChange={(e) => setOfferReceived(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-5 bg-[#ddd] dark:bg-[#333] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-maceng-maroon dark:peer-checked:bg-maceng-orange"></div>
                                </label>
                                <span className="text-sm font-semibold text-[#333] dark:text-white">Received an offer</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Interview Process */}
                <section className="space-y-6">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-maceng-maroon/10 dark:bg-maceng-orange/10 flex items-center justify-center text-maceng-maroon dark:text-maceng-orange font-bold text-sm">2</div>
                            <h2 className="text-xl font-bold text-[#222] dark:text-white">Interview Rounds</h2>
                        </div>
                        <button
                            type="button"
                            onClick={addStage}
                            className="px-4 py-1.5 bg-maceng-maroon/5 dark:bg-maceng-orange/10 text-maceng-maroon dark:text-maceng-orange rounded-lg font-bold text-xs hover:bg-maceng-maroon/10 dark:hover:bg-maceng-orange/20 transition-all border border-maceng-maroon/10 dark:border-maceng-orange/20"
                        >
                            + Add Round
                        </button>
                    </div>

                    <p className="text-[14px] text-[#777] dark:text-[#a0a0a0] leading-relaxed mb-6">
                        Break down each stage of the process. Mention the format (video, coding, in-person), typical questions, and how long it lasted.
                    </p>

                    {stages.length === 0 && (
                        <div className="bg-[#fcfcfc] dark:bg-[#111] border-2 border-dashed border-[#eee] dark:border-[#333] rounded-xl py-12 text-center">
                            <p className="text-sm text-[#888] italic">No rounds documented yet. Share the process step-by-step.</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {stages.map((stage, index) => (
                            <div key={index} className="relative group bg-white dark:bg-[#111] border border-[#eee] dark:border-[#333] rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-maceng-maroon/10 dark:bg-maceng-orange/10 text-maceng-maroon dark:text-maceng-orange px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-widest">
                                            Stage {index + 1}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeStage(index)}
                                        className="text-xs font-bold text-[#bbb] hover:text-red-500 transition-colors"
                                    >
                                        Remove Round
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#999]">Stage Name</label>
                                        <input
                                            type="text"
                                            value={stage.name}
                                            onChange={(e) => updateStage(index, 'name', e.target.value)}
                                            placeholder="e.g. Technical Interview"
                                            className="w-full py-2 px-3 text-sm border border-[#eee] dark:border-[#333] rounded-lg font-inter bg-[#fafafa] dark:bg-[#1a1a1a] dark:text-white focus:outline-none focus:border-maceng-maroon/30 dark:focus:border-maceng-orange/30"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#999]">Duration</label>
                                        <input
                                            type="text"
                                            value={stage.duration || ''}
                                            onChange={(e) => updateStage(index, 'duration', e.target.value)}
                                            placeholder="e.g. 1 hour"
                                            className="w-full py-2 px-3 text-sm border border-[#eee] dark:border-[#333] rounded-lg font-inter bg-[#fafafa] dark:bg-[#1a1a1a] dark:text-white focus:outline-none focus:border-maceng-maroon/30 dark:focus:border-maceng-orange/30"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#999]">Questions & Content</label>
                                    <textarea
                                        value={stage.questions.join('\n')}
                                        onChange={(e) => updateStage(index, 'questions', e.target.value.split('\n').filter(q => q.trim()))}
                                        placeholder="What did they ask? What topics were covered?"
                                        rows={3}
                                        className="w-full py-3 px-3 text-sm border border-[#eee] dark:border-[#333] rounded-lg font-inter bg-[#fafafa] dark:bg-[#1a1a1a] dark:text-white focus:outline-none focus:border-maceng-maroon/30 dark:focus:border-maceng-orange/30 min-h-[100px]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tips & Advice - De-emphasized */}
                <div className="pt-6 border-t border-[#eee] dark:border-[#333]">
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#999] mb-3">
                        Tips & Advice (Optional)
                    </label>
                    <textarea
                        value={tips}
                        onChange={(e) => setTips(e.target.value)}
                        placeholder="Any last advice for future candidates? What helped you succeed?"
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
                        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg px-4 py-3 mb-6 animate-shake">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-maceng-maroon dark:bg-maceng-orange text-white rounded-xl font-bold text-base hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-maceng-maroon/20 dark:shadow-maceng-orange/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Submitting...' : 'Submit Experience'}
                    </button>
                    <p className="text-center text-xs text-[#999] mt-4">
                        By submitting, you agree that your experience will be reviewed by an admin.
                    </p>
                </div>
            </form>

            <CompanyRequestModal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
            />

            <Footer />
        </div>
    );
}
