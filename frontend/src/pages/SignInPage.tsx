import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function SignInPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        const token = data.session?.access_token;
        if (!token) {
            setError('Failed to get authentication token');
            setLoading(false);
            return;
        }

        // Check for pending profile registration (from two-step signup flow)
        const pendingProfile = localStorage.getItem('pendingProfile');
        if (pendingProfile) {
            try {
                const profileData = JSON.parse(pendingProfile);
                const registerResponse = await fetch(`${API_BASE_URL}/api/users/register`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(profileData)
                });

                if (registerResponse.ok) {
                    // Successfully registered - clear pending data and continue
                    localStorage.removeItem('pendingProfile');
                } else if (registerResponse.status === 400) {
                    // Profile already exists - clear pending and continue
                    localStorage.removeItem('pendingProfile');
                } else {
                    const errorData = await registerResponse.json();
                    throw new Error(errorData.detail || 'Failed to complete registration');
                }
            } catch (err) {
                console.error('Error completing registration:', err);
                localStorage.removeItem('pendingProfile');
                // Continue anyway - user can try again later
            }
        } else {
            // No pending profile - check if user profile exists in our database
            try {
                const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.status === 404) {
                    // User exists in Supabase but not in our DB - redirect to complete profile
                    setError('Please complete your profile registration.');
                    setLoading(false);
                    navigate('/signup');
                    return;
                }
            } catch (err) {
                console.error('Error fetching user:', err);
            }
        }

        setLoading(false);
        navigate('/');
    };

    return (
        <div className="min-h-screen py-6 px-8 max-w-md mx-auto">
            {/* Sign In Form */}
            <main>
                <h1 className="font-playfair text-2xl text-maceng-maroon dark:text-maceng-orange mb-2">
                    Sign In
                </h1>
                <p className="text-[15px] text-[#666] dark:text-[#e5e5e5] mb-8">
                    Welcome back. Sign in to access your account.
                </p>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded text-red-700 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-[#333] dark:text-white mb-1.5"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@mcmaster.ca"
                            required
                            className="w-full py-2.5 px-3 text-[15px] border border-[#ccc] dark:border-[#444] rounded font-inter bg-white dark:bg-[#111111] dark:text-white focus:outline-none focus:border-maceng-maroon dark:focus:border-maceng-orange transition-colors"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-[#333] dark:text-white mb-1.5"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full py-2.5 px-3 text-[15px] border border-[#ccc] dark:border-[#444] rounded font-inter bg-white dark:bg-[#111111] dark:text-white focus:outline-none focus:border-maceng-maroon dark:focus:border-maceng-orange transition-colors"
                        />
                    </div>

                    <div className="flex justify-end text-sm">
                        <a
                            href="#forgot"
                            className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange"
                        >
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 px-4 bg-maceng-maroon dark:bg-maceng-orange text-white rounded font-medium text-[15px] hover:bg-maceng-maroon/90 dark:hover:bg-maceng-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-[#666] dark:text-[#e5e5e5]">
                    Don't have an account?{' '}
                    <Link
                        to="/signup"
                        className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange font-medium"
                    >
                        Sign up
                    </Link>
                </p>
            </main>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[#e5e5e5] dark:border-[#444] text-[13px] text-[#666] dark:text-[#d4d4d4]">
                <p>© {new Date().getFullYear()} MacEngDB</p>
            </footer>
        </div>
    );
}
