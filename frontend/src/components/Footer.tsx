export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#111111] border-t border-[#ddd] dark:border-[#444] py-10 mt-20 transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex justify-between items-center max-md:flex-col max-md:gap-5 max-md:text-center">
          <div className="font-playfair text-[28px] font-bold text-[#333] dark:text-white">
            <span className="text-maceng-maroon dark:text-maceng-orange">MacEng</span>
            <span className="text-[#666] dark:text-[#e5e5e5]">DB</span>
          </div>
          <div className="flex gap-6">
            <a href="#about" className="text-[#666] dark:text-[#e5e5e5] no-underline text-sm hover:text-[#333] dark:hover:text-white">About</a>
            <a href="#contact" className="text-[#666] dark:text-[#e5e5e5] no-underline text-sm hover:text-[#333] dark:hover:text-white">Contact</a>
            <a href="#privacy" className="text-[#666] dark:text-[#e5e5e5] no-underline text-sm hover:text-[#333] dark:hover:text-white">Privacy</a>
            <a href="#terms" className="text-[#666] dark:text-[#e5e5e5] no-underline text-sm hover:text-[#333] dark:hover:text-white">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
