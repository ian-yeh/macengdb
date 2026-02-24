import { useState } from 'react';
import { submitDesignTeamRequest } from '../api/api';

interface DesignTeamRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DesignTeamRequestModal({ isOpen, onClose }: DesignTeamRequestModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setStatus('submitting');
        try {
            await submitDesignTeamRequest(name.trim(), email.trim() || undefined);
            setStatus('success');
            setName('');
            setEmail('');
        } catch {
            setStatus('error');
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/30 dark:bg-black/60 flex items-center justify-center z-[200] p-4 transition-colors"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-[#111111] border dark:border-[#444] rounded-lg shadow-xl p-6 w-full max-w-sm transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="font-playfair text-lg text-maceng-maroon dark:text-maceng-orange mb-1">Request a Design Team</h3>
                <p className="text-xs text-[#888] dark:text-[#a0a0a0] mb-4">An admin will review and add it shortly.</p>

                {status === 'success' ? (
                    <div className="text-center py-4">
                        <p className="text-green-600 dark:text-green-400 font-medium text-sm">✓ Request submitted!</p>
                        <div className="flex gap-3 justify-center mt-3">
                            <button
                                onClick={() => setStatus('idle')}
                                className="text-xs text-maceng-orange hover:text-maceng-maroon dark:hover:text-white cursor-pointer transition-colors"
                            >
                                Request another
                            </button>
                            <button
                                onClick={onClose}
                                className="text-xs text-[#888] dark:text-[#a0a0a0] hover:text-[#333] dark:hover:text-[#eee] cursor-pointer transition-colors"
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
                            placeholder="Design team name"
                            autoFocus
                            className="w-full py-2.5 px-3.5 text-sm border border-[#ddd] dark:border-[#444] rounded-lg font-inter bg-white dark:bg-[#161616] dark:text-white focus:outline-none focus:ring-4 focus:ring-maceng-maroon/10 dark:focus:ring-maceng-orange/10 focus:border-maceng-maroon dark:focus:border-maceng-orange transition-all mb-3"
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleSubmit()}
                            placeholder="Your email (optional)"
                            className="w-full py-2.5 px-3.5 text-sm border border-[#ddd] dark:border-[#444] rounded-lg font-inter bg-white dark:bg-[#161616] dark:text-white focus:outline-none focus:ring-4 focus:ring-maceng-maroon/10 dark:focus:ring-maceng-orange/10 focus:border-maceng-maroon dark:focus:border-maceng-orange transition-all mb-4"
                        />
                        {status === 'error' && (
                            <p className="text-xs text-red-600 dark:text-red-400 mb-2">Too many requests! Try again in a minute.</p>
                        )}
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={onClose}
                                className="px-3 py-1.5 text-sm text-[#666] dark:text-[#e5e5e5] hover:text-[#333] dark:hover:text-white transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!name.trim() || status === 'submitting'}
                                className="px-4 py-1.5 bg-maceng-maroon dark:bg-maceng-orange text-white text-sm rounded font-medium hover:bg-maceng-maroon/90 dark:hover:bg-maceng-orange/90 transition-colors disabled:opacity-50 cursor-pointer"
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
