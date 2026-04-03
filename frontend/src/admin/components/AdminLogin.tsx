import { useState } from 'react';
import { Link } from 'react-router-dom';

interface AdminLoginProps {
    onLogin: (key: string) => Promise<boolean>;
    error: string;
}

export default function AdminLogin({ onLogin, error }: AdminLoginProps) {
    const [keyInput, setKeyInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        await onLogin(keyInput);
        setLoading(false);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full animate-fade-up">
                <Link to="/" className="text-maceng-maroon dark:text-maceng-orange hover:opacity-80 transition-opacity text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-8">
                    ← Back to home
                </Link>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h1 className="font-playfair text-4xl font-bold dark:text-white">Admin Access.</h1>
                        <p className="text-[#666] dark:text-[#a0a0a0]">Enter the security key to review pending contributions.</p>
                    </div>

                    <div className="space-y-4">
                        <input
                            type="password"
                            value={keyInput}
                            onChange={(e) => setKeyInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Enter admin key..."
                            className="w-full bg-transparent border-b-2 border-[#eee] dark:border-[#333] focus:border-maceng-maroon dark:focus:border-maceng-orange py-4 text-2xl outline-none transition-colors dark:text-white placeholder:text-[#ccc] dark:placeholder:text-[#333]"
                        />
                        {error && (
                            <p className="text-sm text-red-500 font-bold animate-shake">{error}</p>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !keyInput}
                            className="w-full py-4 bg-maceng-maroon dark:bg-maceng-orange text-white rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-maceng-maroon/20 dark:shadow-maceng-orange/30 disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : 'Enter Dashboard →'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
