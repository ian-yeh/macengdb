import { useParams, Link } from 'react-router-dom';
import CompanyDetailSkeleton from '../components/features/companies/CompanyDetailSkeleton';
import DetailPage from '../components/DetailPage';
import { mostCommon, sharedDate } from '../utils';
import ExperienceCard from '../components/ExperienceCard';
import { useCompany, useCompanyExperiences } from '../hooks/useApi';

export default function CompanyPage() {
    const { companyId } = useParams<{ companyId: string }>();

    const { data: company, isLoading, error } = useCompany(companyId!);
    const { data: experiences = [], isLoading: experiencesLoading, error: experiencesError } = useCompanyExperiences(companyId!);

    if (isLoading || experiencesLoading) return <CompanyDetailSkeleton />;

    if (error || !company || experiencesError) {
        return (
            <main className="mx-auto max-w-[1080px] px-4 py-24 text-center sm:px-6">
                <p className="text-ink-2">We couldn't find that company.</p>
                <Link to="/" className="btn btn-ghost mt-4">All companies</Link>
            </main>
        );
    }

    const n = experiences.length;
    const offers = experiences.filter(e => e.offer_received).length;
    const source = mostCommon(experiences.map(e => e.interview_acquisition));
    const facts: [string, string][] = [[String(n), n === 1 ? 'experience' : 'experiences']];
    if (company.avg_difficulty) facts.push([`${company.avg_difficulty} / 5`, 'avg. difficulty']);
    if (n) facts.push([`${offers} of ${n}`, 'got an offer']);
    if (source) facts.push([source, 'most common source']);

    return (
        <DetailPage
            back={{ to: '/', label: 'All companies' }}
            title={company.name}
            tags={company.industries}
            facts={facts}
            share={{ to: '/submit', label: `Share your ${company.name} interview`, state: { org: { id: company.id, name: company.name } } }}
            outcomeLabels={['Offer', 'No offer']}
            empty="No one has shared an interview here yet. Yours would be the first."
            items={experiences.map(e => ({
                id: e.id,
                term: e.term,
                ok: e.offer_received,
                card: (
                    <ExperienceCard
                        title={e.position}
                        term={e.term}
                        outcome={e.offer_received}
                        outcomeLabels={['Offer', 'No offer']}
                        difficulty={e.difficulty}
                        source={e.interview_acquisition}
                        stages={e.stages}
                        tip={e.tips}
                        date={sharedDate(e.created_at)}
                    />
                ),
            }))}
        />
    );
}
