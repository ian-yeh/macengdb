import { Link } from 'react-router-dom';

export default function SignUpPage() {
    return (
        <div className="min-h-screen py-12 px-8 max-w-md mx-auto">
            {/* Header */}
            <header className="mb-10">
                <Link
                    to="/"
                    className="font-playfair text-2xl font-semibold"
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

                <form className="space-y-5">
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
                            placeholder="John Doe"
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
                            placeholder="you@mcmaster.ca"
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
                            htmlFor="year"
                            className="block text-sm font-medium text-[#333] mb-1.5"
                        >
                            Graduation Year
                        </label>
                        <input
                            type="number"
                            id="year"
                            placeholder="2026"
                            min="2020"
                            max="2035"
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
                            placeholder="••••••••"
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
                            placeholder="••••••••"
                            className="w-full py-2.5 px-3 text-[15px] border border-[#ccc] rounded font-inter bg-white focus:outline-none focus:border-maceng-maroon transition-colors"
                        />
                    </div>

                    <button
                        type="button"
                        className="w-full py-2.5 px-4 bg-maceng-maroon text-white rounded font-medium text-[15px] hover:bg-maceng-maroon/90 transition-colors"
                    >
                        Create Account
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
