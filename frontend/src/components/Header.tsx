import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white border-b border-[#ddd] py-5 sticky top-0 z-[100]">
      <div className="max-w-[1200px] mx-auto px-5">
        <nav className="flex justify-between items-center">
          <Link to="/" className="font-playfair text-[28px] font-bold text-[#333] no-underline">
            <span className="text-maceng-maroon">MacEng</span>
            <span className="text-[#666]">DB</span>
          </Link>
          <div className="flex gap-[30px] items-center">
            <a href="#courses" className="no-underline text-[#666] font-medium transition-colors hover:text-[#333]">Courses</a>
            <a href="#about" className="no-underline text-[#666] font-medium transition-colors hover:text-[#333]">About</a>
            <a className="bg-[#333] text-white py-2.5 px-6 rounded-md no-underline font-medium transition-colors hover:bg-[#555]" href="#signup">Sign Up</a>
          </div>
        </nav>
      </div>
    </header>
  );
}
