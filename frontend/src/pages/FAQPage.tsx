import { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';

const FAQ_ITEMS = [
  {
    question: 'What is MacEngDB?',
    answer:
      'MacEngDB is a community-driven platform where McMaster Engineering students share real interview and application experiences — for both companies and design teams. It helps you prepare smarter by learning from those who came before you.',
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
      'Absolutely! On the homepage, click the "Request it" link below the action buttons. We will review and add it as soon as possible.',
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
    <div className="border-b border-[#eee] dark:border-[#333]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left group cursor-pointer"
      >
        <span className="font-semibold text-[#333] dark:text-white group-hover:text-maceng-maroon dark:group-hover:text-maceng-orange transition-colors pr-4">
          {question}
        </span>
        <span
          className={`text-maceng-maroon dark:text-maceng-orange text-xl flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="text-[#666] dark:text-[#b0b0b0] leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
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
        Frequently Asked Questions
      </h1>

      <hr
        className="border-t border-[#eee] dark:border-[#333] mb-8 animate-fade-in-subtle"
        style={{ animationDelay: '200ms' }}
      />

      <div
        className="flex-grow animate-fade-in-subtle"
        style={{ animationDelay: '300ms' }}
      >
        <div className="border-t border-[#eee] dark:border-[#333]">
          {FAQ_ITEMS.map((item, index) => (
            <FAQItem key={index} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
