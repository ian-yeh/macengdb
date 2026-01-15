import { type Experience as ExperienceType } from '../../api/types';

interface ExperienceCardProps {
    experience: ExperienceType;
}

function ExperienceCard({ experience }: ExperienceCardProps) {
    const formattedDate = new Date(experience.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <div className="bg-white border border-[#e0e0e0] rounded-xl p-6 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
            <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
                <h4 className="font-semibold text-lg text-[#333]">{experience.title}</h4>
                <span className="text-sm text-[#888]">{formattedDate}</span>
            </div>
            <p className="text-[#444] leading-[1.7] text-[15px]">{experience.description}</p>
        </div>
    );
}

interface ExperiencesSectionProps {
    experiences: ExperienceType[];
}

export default function ExperiencesSection({ experiences }: ExperiencesSectionProps) {
    if (experiences.length === 0) {
        return (
            <section className="py-10 pb-20">
                <div className="max-w-[1200px] mx-auto px-5">
                    <h3 className="text-2xl font-playfair text-[#333] mb-8">Experiences</h3>
                    <div className="text-center py-20 text-[#666] bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <div className="text-4xl mb-4">💼</div>
                        <p className="text-lg">No experiences shared yet. Be the first!</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-10 pb-20">
            <div className="max-w-[1200px] mx-auto px-5">
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                    <h3 className="text-2xl font-playfair text-[#333]">Experiences</h3>
                    <button className="bg-[#333] text-white py-2.5 px-6 rounded-md font-medium transition-colors hover:bg-[#555]">
                        Share Experience
                    </button>
                </div>
                <div className="flex flex-col gap-5">
                    {experiences.map((experience) => (
                        <ExperienceCard key={experience.id} experience={experience} />
                    ))}
                </div>
            </div>
        </section>
    );
}
