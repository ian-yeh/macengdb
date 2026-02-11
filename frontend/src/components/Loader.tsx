export default function Loader({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                {/* Animated maroon dots */}
                <div className="flex gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-maceng-maroon animate-loader-dot" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 rounded-full bg-maceng-maroon animate-loader-dot" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 rounded-full bg-maceng-orange animate-loader-dot" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-sm text-[#888] italic font-inter">{message}</p>
            </div>
        </div>
    );
}
