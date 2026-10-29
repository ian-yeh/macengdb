import Skeleton from '../../ui/Skeleton';

export default function CompanyDetailSkeleton() {
    return (
        <main className="mx-auto max-w-[1080px] px-4 sm:px-6">
            <Skeleton width="110px" height="16px" className="mt-9" />
            <div className="border-b border-line pb-7 pt-6">
                <Skeleton width="240px" height="44px" className="mb-3" />
                <Skeleton width="220px" height="18px" className="mb-6" />
                <div className="flex gap-7">
                    <Skeleton width="70px" height="36px" />
                    <Skeleton width="70px" height="36px" />
                    <Skeleton width="70px" height="36px" />
                </div>
            </div>
            <div className="space-y-4 pt-8">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="rounded-[14px] border border-line bg-surface p-6">
                        <Skeleton width="45%" height="24px" className="mb-4" />
                        <Skeleton width="30%" height="16px" className="mb-6" />
                        <Skeleton width="90%" height="14px" className="mb-2" />
                        <Skeleton width="70%" height="14px" />
                    </div>
                ))}
            </div>
        </main>
    );
}
