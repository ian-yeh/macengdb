import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-8 md:py-12 px-4 md:px-8 max-w-4xl mx-auto flex flex-col">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-maceng-maroon dark:text-maceng-orange hover:underline mb-6 group animate-fade-in-subtle" style={{ animationDelay: '0ms' }}>
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Home
      </Link>
      <h1 className="font-playfair text-4xl md:text-6xl font-bold text-[#222] dark:text-white leading-[1.1] mb-6 animate-fade-in-subtle" style={{ animationDelay: '100ms' }}>Privacy <span className="text-maceng-maroon dark:text-maceng-orange italic">Policy</span></h1>
      <hr className="border-t border-[#eee] dark:border-[#333] mb-8 animate-fade-in-subtle" style={{ animationDelay: '200ms' }} />
      <div className="flex-grow animate-fade-in-subtle" style={{ animationDelay: '300ms' }}>
        <p className="text-[#666] dark:text-[#e5e5e5] mb-4">
          At MacEngDB, we are committed to protecting your privacy. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you visit our website MacEngDB.com,
          including any other media form, media channel, mobile website, or mobile application related or connected thereto (collectively, the "Site").
          Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the Site.
        </p>
        <h2 className="text-2xl font-semibold mb-3 dark:text-white">Collection of Your Information</h2>
        <p className="text-[#666] dark:text-[#e5e5e5] mb-4">
          We may collect information about you in a variety of ways. The information we may collect on the Site includes:
        </p>
        <ul className="list-disc pl-5 text-[#666] dark:text-[#e5e5e5] mb-4">
          <li>
            <strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address,
            email address, and telephone number, and demographic information, such as your age, gender,
            hometown, and interests, that you voluntarily give to us when you register with the Site
            or when you choose to participate in various activities related to the Site, such as online chat and message boards.
          </li>
          <li>
            <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site,
            such as your IP address, your browser type, your operating system, your access times,
            and the pages you have viewed directly before and after accessing the Site.
          </li>
        </ul>
        <h2 className="text-2xl font-semibold mb-3 dark:text-white">Use of Your Information</h2>
        <p className="text-[#666] dark:text-[#e5e5e5] mb-4">
          Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience.
          Specifically, we may use information collected about you via the Site to:
        </p>
        <ul className="list-disc pl-5 text-[#666] dark:text-[#e5e5e5] mb-4">
          <li>Create and manage your account.</li>
          <li>Email you regarding your account or order.</li>
          <li>Enable user-to-user communications.</li>
          <li>Generate a personal profile about you to make your visit to the Site more personalized.</li>
          <li>Increase the efficiency and operation of the Site.</li>
          <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-3 dark:text-white">Disclosure of Your Information</h2>
        <p className="text-[#666] dark:text-[#e5e5e5] mb-4">
          We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
        </p>
        <ul className="list-disc pl-5 text-[#666] dark:text-[#e5e5e5] mb-4">
          <li>
            <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process,
            to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others,
            we may share your information as permitted or required by any applicable law, rule, or regulation.
          </li>
          <li>
            <strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf,
            including data analysis, email delivery, hosting services, customer service, and marketing assistance.
          </li>
        </ul>
        <h2 className="text-2xl font-semibold mb-3 dark:text-white">Security of Your Information</h2>
        <p className="text-[#666] dark:text-[#e5e5e5] mb-4">
          We use administrative, technical, and physical security measures to help protect your personal information.
          While we have taken reasonable steps to secure the personal information you provide to us,
          please be aware that despite our efforts, no security measures are perfect or impenetrable,
          and no method of data transmission can be guaranteed against any interception or other type of misuse.
        </p>
      </div>
      <Footer />
    </div>
  );
}
