import MarkdownPage from '../components/MarkdownPage';
import privacyContent from '../content/privacy.md?raw';

export default function PrivacyPage() {
  return <MarkdownPage content={privacyContent} />;
}
