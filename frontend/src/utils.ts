export const mostCommon = (values: (string | null)[]) => {
    const counts = new Map<string, number>();
    for (const v of values) if (v?.trim()) counts.set(v.trim(), (counts.get(v.trim()) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0];
};

export const sharedDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
