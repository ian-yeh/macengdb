import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line py-7 text-[13px] text-ink-3">
      <div className="mx-auto flex max-w-[1080px] flex-wrap justify-between gap-4 px-4 sm:px-6">
        <span>
          <span className="font-playfair font-bold text-accent">MacEng</span>
          <span className="font-playfair">DB</span> - built by McMaster engineering students
        </span>
        <nav className="flex gap-5">
          <Link to="/about" className="hover:text-ink">About</Link>
          <Link to="/faq" className="hover:text-ink">FAQ</Link>
          <Link to="/privacy" className="hover:text-ink">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}
