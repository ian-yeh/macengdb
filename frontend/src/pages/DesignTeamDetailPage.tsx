import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDesignTeam, fetchDesignTeamReviews } from '../api/api';
import CompanyDetailSkeleton from '../components/features/companies/CompanyDetailSkeleton';
import DetailPage from '../components/DetailPage';
import { mostCommon, sharedDate } from '../utils';
import ExperienceCard from '../components/ExperienceCard';

export default function DesignTeamDetailPage() {
    const { teamId } = useParams<{ teamId: string }>();

    const { data: team, isLoading, error } = useQuery({
        queryKey: ['design-team', teamId],
        queryFn: () => fetchDesignTeam(teamId!),
        enabled: !!teamId,
    });

    const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
        queryKey: ['design-team-reviews', teamId],
        queryFn: () => fetchDesignTeamReviews(teamId!),
        enabled: !!teamId,
    });

    if (isLoading || reviewsLoading) return <CompanyDetailSkeleton />;

    if (error || !team) {
        return (
            <main className="mx-auto max-w-[1080px] px-4 py-24 text-center sm:px-6">
                <p className="text-ink-2">We couldn't find that design team.</p>
                <Link to="/?tab=design-teams" className="btn btn-ghost mt-4">All design teams</Link>
            </main>
        );
    }

    const n = reviews.length;
    const accepted = reviews.filter(r => r.accepted).length;
    const source = mostCommon(reviews.map(r => r.interview_acquisition));
    const facts: [string, string][] = [[String(n), n === 1 ? 'experience' : 'experiences']];
    if (team.avg_difficulty) facts.push([`${team.avg_difficulty} / 5`, 'avg. difficulty']);
    if (n) facts.push([`${accepted} of ${n}`, 'got accepted']);
    if (source) facts.push([source, 'most common source']);

    return (
        <DetailPage
            back={{ to: '/?tab=design-teams', label: 'All design teams' }}
            title={team.name}
            tags={team.categories}
            description={(team.description || team.website_url) && (
                <p className="mt-3 text-ink-2">
                    {team.description}{' '}
                    {team.website_url && (
                        <a href={team.website_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline underline-offset-2">
                            Website
                        </a>
                    )}
                </p>
            )}
            facts={facts}
            share={{ to: '/submit-design-team', label: 'Share your application', state: { org: { id: team.id, name: team.name } } }}
            outcomeLabels={['Accepted', 'Not accepted']}
            empty="No one has shared an application here yet. Yours would be the first."
            items={reviews.map(r => ({
                id: r.id,
                term: r.term,
                ok: r.accepted,
                card: (
                    <ExperienceCard
                        title={r.position}
                        term={r.term}
                        outcome={r.accepted}
                        outcomeLabels={['Accepted', 'Not accepted']}
                        difficulty={r.difficulty}
                        source={r.interview_acquisition}
                        body={r.description && <p className="mt-4 whitespace-pre-wrap text-sm text-ink-2">{r.description}</p>}
                        tip={r.tips}
                        date={sharedDate(r.created_at)}
                    />
                ),
            }))}
        />
    );
}
