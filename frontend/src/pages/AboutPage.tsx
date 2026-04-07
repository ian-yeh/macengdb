import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-8 md:py-12 px-4 md:px-8 max-w-4xl mx-auto flex flex-col">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-maceng-maroon dark:text-maceng-orange hover:underline mb-6 group">
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Home
      </Link>
      <h1 className="font-playfair text-4xl md:text-6xl font-bold text-[#222] dark:text-white leading-[1.1] mb-6">About <span className="text-maceng-maroon dark:text-maceng-orange italic">Us</span></h1>
      <hr className="border-t border-[#eee] dark:border-[#333] mb-8" />
      <div className="flex-grow">
        <p className="text-[#666] dark:text-[#e5e5e5] mb-4">
          Welcome to MacEngDB! We are dedicated to providing a comprehensive database of engineering companies and design teams,
          making it easier for students and professionals to discover opportunities and connect with the engineering community.
        </p>
        <p className="text-[#666] dark:text-[#e5e5e5] mb-4">
          Our mission is to bridge the gap between talented individuals and innovative engineering organizations, fostering growth and collaboration within the industry.
        </p>
        <p className="text-[#666] dark:text-[#e5e5e5]">
          Whether you are looking for internships, full-time positions, or just want to explore the engineering landscape, MacEngDB is your go-to resource.
        </p>
      </div>
      <Footer />
    </div>
  );
}
