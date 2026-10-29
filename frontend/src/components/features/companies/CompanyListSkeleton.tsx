import Skeleton from '../../ui/Skeleton';

export default function CompanyListSkeleton() {
    return (
        <div aria-busy="true">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4 border-b border-line px-2 py-4">
                    <Skeleton width="160px" height="18px" />
                    <Skeleton width="24px" height="16px" />
                </div>
            ))}
        </div>
    );
}
