import MarkdownPage from '../components/MarkdownPage';
import aboutContent from '../content/about.md?raw';

export default function AboutPage() {
  return <MarkdownPage content={aboutContent} />;
}
