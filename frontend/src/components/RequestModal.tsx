import { useState } from 'react';
import { submitCompanyRequest, submitDesignTeamRequest } from '../api/api';

interface RequestModalProps {
    kind: 'company' | 'design team';
    initialName?: string;
    onClose: () => void;
}

export default function RequestModal({ kind, initialName = '', onClose }: RequestModalProps) {
    const [name, setName] = useState(initialName);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setStatus('submitting');
        try {
            const submit = kind === 'company' ? submitCompanyRequest : submitDesignTeamRequest;
            await submit(name.trim(), email.trim() || undefined);
            setStatus('success');
            setName('');
            setEmail('');
        } catch {
            setStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="request-title"
                className="w-full max-w-sm rounded-[14px] border border-line bg-surface p-6 shadow-card"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.key === 'Escape' && onClose()}
            >
                <h3 id="request-title" className="text-xl">Request a {kind}</h3>
                <p className="mb-4 mt-1 text-sm text-ink-3">We'll review it and add it to the list.</p>

                {status === 'success' ? (
                    <div className="py-2">
                        <p className="text-sm font-semibold text-good">Request sent.</p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setStatus('idle')} className="btn btn-ghost">Request another</button>
                            <button onClick={onClose} className="btn btn-primary">Done</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={kind === 'company' ? 'Company name' : 'Design team name'}
                            aria-label={kind === 'company' ? 'Company name' : 'Design team name'}
                            autoFocus
                            className="field mb-3"
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Your email (optional)"
                            aria-label="Your email (optional)"
                            className="field mb-4"
                        />
                        {status === 'error' && (
                            <p className="mb-3 text-sm text-bad">Too many requests. Try again in a minute.</p>
                        )}
                        <div className="flex justify-end gap-2">
                            <button onClick={onClose} className="btn btn-ghost">Cancel</button>
                            <button onClick={handleSubmit} disabled={!name.trim() || status === 'submitting'} className="btn btn-primary">
                                {status === 'submitting' ? 'Sending...' : 'Send request'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
