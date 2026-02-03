import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function SignUpPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        program: '',
        graduationYear: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.id]: e.target.value
        }));
    };

    const handleSignUp = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate McMaster email
        const emailDomain = formData.email.split('@')[1];
        if (!['mcmaster.ca', 'alumni.mcmaster.ca'].includes(emailDomain)) {
            setError('Must use a McMaster email (@mcmaster.ca or @alumni.mcmaster.ca)');
            return;
        }

        setLoading(true);

        // 1. Create Supabase auth account
        const { data, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        // 2. Store profile data for later registration (after email confirmation)
        const profileData = {
            email: formData.email,
            name: formData.name,
            program: formData.program,
            graduation_year: parseInt(formData.graduationYear),
        };
        localStorage.setItem('pendingProfile', JSON.stringify(profileData));

        // Check if we got a session (email confirmation disabled) or not (email confirmation enabled)
        const token = data.session?.access_token;

        if (token) {
            // Email confirmation disabled - register immediately
            try {
                const response = await fetch(`${API_BASE_URL}/api/users/register`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(profileData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to create profile');
                }

                localStorage.removeItem('pendingProfile');
                setLoading(false);
                navigate('/');
                return;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to create profile');
                setLoading(false);
                return;
            }
        }

        // Email confirmation required - show success message
        setLoading(false);
        setSuccess('Account created! Please check your email to confirm your account. After confirming, sign in to complete your profile.');
    };

    return (
        <div className="min-h-screen py-12 px-8 max-w-md mx-auto">
            {/* Header */}
            <header className="mb-10">
                <Link
                    to="/"
                    className="font-playfair text-2xl font-semibold no-underline"
                >
                    <span className="text-maceng-maroon">MacEng</span>
                    <span className="text-[#666]">DB</span>
                </Link>
            </header>

            {/* Sign Up Form */}
            <main>
                <h1 className="font-playfair text-2xl text-maceng-maroon mb-2">
                    Sign Up
                </h1>
                <p className="text-[15px] text-[#666] mb-8">
                    Join MacEngDB to share and access interview experiences.
                </p>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                        {success}
                        <Link
                            to="/signin"
                            className="block mt-3 text-maceng-maroon font-medium underline"
                        >
                            Go to Sign In →
                        </Link>
                    </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-5">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-[#333] mb-1.5"
                        >
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            className="w-full py-2.5 px-3 text-[15px] border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon transition-colors"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-[#333] mb-1.5"
                        >
                            McMaster Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@mcmaster.ca"
                            required
                            className="w-full py-2.5 px-3 text-[15px] border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon transition-colors"
                        />
                        <p className="text-xs text-[#888] mt-1">
                            Must be @mcmaster.ca or @alumni.mcmaster.ca
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="program"
                            className="block text-sm font-medium text-[#333] mb-1.5"
                        >
                            Program
                        </label>
                        <select
                            id="program"
                            value={formData.program}
                            onChange={handleChange}
                            required
                            className="w-full py-2.5 px-3 text-[15px] border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon transition-colors"
                        >
                            <option value="">Select your program</option>
                            <option value="Software">Software Engineering</option>
                            <option value="Computer">Computer Engineering</option>
                            <option value="Electrical">Electrical Engineering</option>
                            <option value="Mechanical">Mechanical Engineering</option>
                            <option value="Mechatronics">Mechatronics Engineering</option>
                            <option value="Civil">Civil Engineering</option>
                            <option value="Chemical">Chemical Engineering</option>
                            <option value="Materials">Materials Engineering</option>
                            <option value="Engineering Physics">Engineering Physics</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="graduationYear"
                            className="block text-sm font-medium text-[#333] mb-1.5"
                        >
                            Graduation Year
                        </label>
                        <input
                            type="number"
                            id="graduationYear"
                            value={formData.graduationYear}
                            onChange={handleChange}
                            placeholder="2026"
                            min="2020"
                            max="2035"
                            required
                            className="w-full py-2.5 px-3 text-[15px] border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon transition-colors"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-[#333] mb-1.5"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className="w-full py-2.5 px-3 text-[15px] border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon transition-colors"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-[#333] mb-1.5"
                        >
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className="w-full py-2.5 px-3 text-[15px] border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 px-4 bg-maceng-maroon text-white rounded font-medium text-[15px] hover:bg-maceng-maroon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-[#666]">
                    Already have an account?{' '}
                    <Link
                        to="/signin"
                        className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange"
                    >
                        Sign in
                    </Link>
                </p>
            </main>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[#e5e5e5] text-[13px] text-[#666]">
                <p>© {new Date().getFullYear()} MacEngDB</p>
            </footer>
        </div>
    );
}
