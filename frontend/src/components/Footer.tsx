export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#ddd] py-10 mt-20">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex justify-between items-center max-md:flex-col max-md:gap-5 max-md:text-center">
          <div className="font-playfair text-[28px] font-bold text-[#333]">
            <span className="text-maceng-maroon">MacEng</span>
            <span className="text-[#666]">DB</span>
          </div>
          <div className="flex gap-6">
            <a href="#about" className="text-[#666] no-underline text-sm hover:text-[#333]">About</a>
            <a href="#contact" className="text-[#666] no-underline text-sm hover:text-[#333]">Contact</a>
            <a href="#privacy" className="text-[#666] no-underline text-sm hover:text-[#333]">Privacy</a>
            <a href="#terms" className="text-[#666] no-underline text-sm hover:text-[#333]">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
