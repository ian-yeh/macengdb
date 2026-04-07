import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Footer from './layout/Footer';

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
    <div className="min-h-screen py-8 md:py-12 px-4 md:px-8 max-w-4xl mx-auto flex flex-col">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-maceng-maroon dark:text-maceng-orange hover:underline mb-6 group animate-fade-in-subtle"
        style={{ animationDelay: '0ms' }}
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Home
      </Link>

      <h1
        className="font-playfair text-4xl md:text-6xl font-bold text-[#222] dark:text-white leading-[1.1] mb-6 animate-fade-in-subtle"
        style={{ animationDelay: '100ms' }}
      >
        {title}
      </h1>

      <hr
        className="border-t border-[#eee] dark:border-[#333] mb-8 animate-fade-in-subtle"
        style={{ animationDelay: '200ms' }}
      />

      <div
        className="flex-grow animate-fade-in-subtle prose-maceng"
        style={{ animationDelay: '300ms' }}
      >
        <ReactMarkdown>{body}</ReactMarkdown>
      </div>

      <Footer />
    </div>
  );
}
