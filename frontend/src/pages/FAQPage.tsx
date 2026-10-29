import { useState } from 'react';

const FAQ_ITEMS = [
  {
    question: 'What is MacEngDB?',
    answer:
      'MacEngDB is a community-driven platform where McMaster Engineering students share real interview and application experiences for both companies and design teams. It helps you prepare smarter by learning from those who came before you.',
  },
  {
    question: 'Who can submit an experience?',
    answer:
      'Any McMaster student with a valid @mcmaster.ca email address can submit. Your identity stays completely anonymous — we only use your email to verify you are a Mac student.',
  },
  {
    question: 'Is my submission anonymous?',
    answer:
      'Yes, 100%. Your email is used solely for verification and is never displayed publicly. The experiences shown on the site contain no identifying information.',
  },
  {
    question: 'How are experiences reviewed?',
    answer:
      'Every submission goes through a review process before being published. We check for inappropriate content, spam, and accuracy to maintain the quality of the database.',
  },
  {
    question: 'Can I request a company or design team to be added?',
    answer:
      'Yes. Below the list on the homepage, click "Request it". We will review it and add it as soon as possible.',
  },
  {
    question: 'How can I contribute or give feedback?',
    answer:
      'The best way to contribute is by submitting your own experiences. If you have feedback, a feedback form is coming soon!',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-line">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="group flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 font-semibold group-hover:text-accent">{question}</span>
        <span className={`flex-shrink-0 text-xl text-accent transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} aria-hidden="true">+</span>
      </button>
      <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="leading-relaxed text-ink-2">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <main className="mx-auto max-w-[720px] px-4 pt-14 sm:px-6 animate-rise">
      <h1 className="text-[clamp(36px,5vw,52px)] font-bold leading-[1.05] tracking-tight">Frequently asked questions</h1>
      <div className="mt-8 border-t border-line">
        {FAQ_ITEMS.map((item) => (
          <FAQItem key={item.question} question={item.question} answer={item.answer} />
        ))}
      </div>
    </main>
  );
}
