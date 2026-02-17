import Skeleton from './Skeleton';

export default function CompanyDetailSkeleton() {
    return (
        <div className="animate-fade-in">
            {/* Header Skeleton */}
            <header className="mb-8">
                <Skeleton width="140px" height="16px" className="mb-8" />
                <Skeleton width="280px" height="40px" className="mb-4" />
                <Skeleton width="200px" height="20px" className="mb-6" />
                <div className="flex gap-4 border-b border-[#e5e5e5] pb-6">
                    <Skeleton width="100px" height="16px" />
                </div>
            </header>

            {/* Experiences List Skeleton */}
            <section>
                <Skeleton width="200px" height="28px" className="mb-8" />

                <div className="space-y-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border-b border-[#e5e5e5] pb-8">
                            <div className="flex justify-between items-start mb-4">
                                <Skeleton width="180px" height="24px" />
                                <Skeleton width="60px" height="18px" />
                            </div>

                            <div className="flex gap-2 mb-6">
                                <Skeleton width="100px" height="24px" className="rounded-full" />
                                <Skeleton width="100px" height="24px" className="rounded-full" />
                            </div>

                            <div className="space-y-3">
                                <Skeleton width="100%" height="16px" />
                                <Skeleton width="90%" height="16px" />
                                <Skeleton width="40%" height="16px" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
