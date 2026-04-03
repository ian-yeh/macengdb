import { useState } from 'react';
import { adminCreateCompany } from '../../api/api';
import { useQueryClient } from '@tanstack/react-query';

interface CreateCompanyTabProps {
    adminKey: string;
    showFeedback: (key: string, message: string, type: 'success' | 'error') => void;
    startProcessing: (key: string) => void;
    stopProcessing: (key: string) => void;
    processing: Set<string>;
}

export default function CreateCompanyTab({ 
    adminKey, 
    showFeedback, 
    startProcessing, 
    stopProcessing, 
    processing 
}: CreateCompanyTabProps) {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [industries, setIndustries] = useState('');

    const handleCreate = async () => {
        if (!name.trim() || processing.has('create-company')) return;
        startProcessing('create-company');
        try {
            const industryList = industries
                ? industries.split(',').map(s => s.trim()).filter(s => s !== '')
                : [];
            await adminCreateCompany(adminKey, name.trim(), industryList);
            showFeedback('create-company', 'Company created successfully!', 'success');
            setName('');
            setIndustries('');
            queryClient.invalidateQueries({ queryKey: ['companies'] });
        } catch { showFeedback('create-company', 'Failed to create company', 'error'); }
        finally { stopProcessing('create-company'); }
    };

    return (
        <div className="max-w-xl animate-fade-up space-y-8 py-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold dark:text-white font-playfair">Add a New Company.</h2>
                <p className="text-sm text-[#666] dark:text-[#a0a0a0]">Manually add a company to the database without a user request.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest">Company Name</label>
                    <input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Google, Tesla, McMaster..."
                        className="w-full bg-transparent border-b-2 border-[#eee] dark:border-[#333] focus:border-maceng-maroon dark:focus:border-maceng-orange py-2 text-xl outline-none transition-colors dark:text-white"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#999] uppercase tracking-widest">Industries (Comma Separated)</label>
                    <input 
                        value={industries}
                        onChange={(e) => setIndustries(e.target.value)}
                        placeholder="e.g. Software, Hardware, Consulting..."
                        className="w-full bg-transparent border-b-2 border-[#eee] dark:border-[#333] focus:border-maceng-maroon dark:focus:border-maceng-orange py-2 text-xl outline-none transition-colors dark:text-white"
                    />
                </div>

                <button 
                    onClick={handleCreate}
                    disabled={!name.trim() || processing.has('create-company')}
                    className="px-8 py-4 bg-maceng-maroon dark:bg-maceng-orange text-white rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50"
                >
                    {processing.has('create-company') ? 'Creating...' : 'Create Company →'}
                </button>
            </div>
        </div>
    );
}
