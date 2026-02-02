import { Link } from 'react-router-dom';

export default function SignInPage() {
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

            {/* Sign In Form */}
            <main>
                <h1 className="font-playfair text-2xl text-maceng-maroon mb-2">
                    Sign In
                </h1>
                <p className="text-[15px] text-[#666] mb-8">
                    Welcome back. Sign in to access your account.
                </p>

                <form className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-[#333] mb-1.5"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="you@mcmaster.ca"
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

                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center gap-2 text-[#555]">
                            <input type="checkbox" className="rounded border-[#ccc]" />
                            Remember me
                        </label>
                        <a
                            href="#forgot"
                            className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange"
                        >
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="button"
                        className="w-full py-2.5 px-4 bg-maceng-maroon text-white rounded font-medium text-[15px] hover:bg-maceng-maroon/90 transition-colors"
                    >
                        Sign In
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-[#666]">
                    Don't have an account?{' '}
                    <Link
                        to="/signup"
                        className="text-maceng-orange underline decoration-maceng-orange/50 hover:decoration-maceng-orange"
                    >
                        Sign up
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
