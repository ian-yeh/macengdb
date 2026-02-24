import Skeleton from './Skeleton';

export default function CompanyListSkeleton() {
    return (
        <div className="animate-fade-in">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b-2 border-maceng-maroon/10 dark:border-maceng-orange/10">
                        <th className="text-left py-3 pr-4 font-playfair italic text-maceng-maroon/40 dark:text-maceng-orange/40 font-semibold text-[15px] md:text-[16px] uppercase tracking-wider">
                            Company
                        </th>
                        <th className="hidden md:table-cell text-left py-3 pr-6 font-playfair italic text-maceng-maroon/40 dark:text-maceng-orange/40 font-semibold text-[16px] uppercase tracking-wider">
                            Industry
                        </th>
                        <th className="text-right md:text-center py-3 font-playfair italic text-maceng-maroon/40 dark:text-maceng-orange/40 font-semibold text-[15px] md:text-[16px] uppercase tracking-wider w-24 md:w-32">
                            Experiences
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#eee] dark:divide-[#333]">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} className="animate-row-in" style={{ animationDelay: `${i * 30}ms` }}>
                            <td className="py-4 pr-4">
                                <div className="flex flex-col gap-2">
                                    <Skeleton width="120px" height="18px" />
                                    <div className="md:hidden">
                                        <Skeleton width="80px" height="12px" />
                                    </div>
                                </div>
                            </td>
                            <td className="hidden md:table-cell py-4 pr-6">
                                <Skeleton width="150px" height="14px" />
                            </td>
                            <td className="py-4 text-right md:text-center flex justify-end md:justify-center">
                                <Skeleton width="24px" height="24px" circle />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
