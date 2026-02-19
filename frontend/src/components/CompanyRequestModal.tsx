import { useState } from 'react';
import { submitCompanyRequest } from '../api/api';

interface CompanyRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CompanyRequestModal({ isOpen, onClose }: CompanyRequestModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setStatus('submitting');
        try {
            await submitCompanyRequest(name.trim(), email.trim() || undefined);
            setStatus('success');
            setName('');
            setEmail('');
        } catch {
            setStatus('error');
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="font-playfair text-lg text-maceng-maroon mb-1">Request a Company</h3>
                <p className="text-xs text-[#888] mb-4">An admin will review and add it shortly.</p>

                {status === 'success' ? (
                    <div className="text-center py-4">
                        <p className="text-green-600 font-medium text-sm">✓ Request submitted!</p>
                        <div className="flex gap-3 justify-center mt-3">
                            <button
                                onClick={() => setStatus('idle')}
                                className="text-xs text-maceng-orange hover:text-maceng-maroon cursor-pointer"
                            >
                                Request another
                            </button>
                            <button
                                onClick={onClose}
                                className="text-xs text-[#888] hover:text-[#333] cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Company name"
                            autoFocus
                            className="w-full py-2.5 px-3.5 text-sm border border-[#ddd] rounded-lg font-inter bg-white focus:outline-none focus:ring-4 focus:ring-maceng-maroon/10 focus:border-maceng-maroon transition-all mb-3"
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleSubmit()}
                            placeholder="Your email (optional)"
                            className="w-full py-2.5 px-3.5 text-sm border border-[#ddd] rounded-lg font-inter bg-white focus:outline-none focus:ring-4 focus:ring-maceng-maroon/10 focus:border-maceng-maroon transition-all mb-4"
                        />
                        {status === 'error' && (
                            <p className="text-xs text-red-600 mb-2">Too many requests! Try again in a minute.</p>
                        )}
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={onClose}
                                className="px-3 py-1.5 text-sm text-[#666] hover:text-[#333] transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!name.trim() || status === 'submitting'}
                                className="px-4 py-1.5 bg-maceng-maroon text-white text-sm rounded font-medium hover:bg-maceng-maroon/90 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {status === 'submitting' ? 'Sending...' : 'Submit'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
