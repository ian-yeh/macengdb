import ReactMarkdown from 'react-markdown';

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {} as Record<string, string>, body: raw };
  const frontmatter: Record<string, string> = {};
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) frontmatter[key.trim()] = rest.join(':').trim();
  });
  return { data: frontmatter, body: match[2] };
}

interface MarkdownPageProps {
  content: string;
}

export default function MarkdownPage({ content }: MarkdownPageProps) {
  const { data, body } = parseFrontmatter(content);
  const title = data.title || '';

  return (
    <main className="mx-auto max-w-[720px] px-4 pt-14 sm:px-6 animate-rise">
      <h1 className="text-[clamp(36px,5vw,52px)] font-bold leading-[1.05] tracking-tight">{title}</h1>
      <div className="prose-maceng mt-8 border-t border-line pt-8">
        <ReactMarkdown>{body}</ReactMarkdown>
      </div>
    </main>
  );
}
