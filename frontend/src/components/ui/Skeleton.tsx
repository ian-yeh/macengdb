interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    className?: string;
    circle?: boolean;
}

export default function Skeleton({
    width,
    height,
    className = '',
    circle = false
}: SkeletonProps) {
    const style: React.CSSProperties = {
        width,
        height,
        ...(circle ? { borderRadius: '50%' } : {})
    };

    return (
        <div
            className={`skeleton ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
}
