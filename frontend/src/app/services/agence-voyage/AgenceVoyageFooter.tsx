import React from "react";

export default function AgenceVoyageFooter() {
  return (
    <footer className="w-full bg-white text-black py-10 px-6 mt-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex-1 flex flex-col items-start">
          <h2 className="text-2xl font-extrabold mb-2">Explore the World with Asmyne Group</h2>
          <p className="text-gray-700 mb-4">Your trusted partner for unforgettable journeys and the best travel deals.</p>
          <span className="text-gray-500 text-sm">© 2026 Asmyne Group. All rights reserved.</span>
        </div>
        <div className="flex-1 flex flex-col items-end">
          <div className="flex gap-4 mb-2">
            <a href="https://www.instagram.com/asmynegroup?igsh=M3FpNzA2dTZzdXl4" className="text-[#8C6B3E] hover:text-[#8C6B3E]" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram text-2xl"></i></a>
            <a href="https://www.facebook.com/share/1KGpFstMcy/" className="text-[#8C6B3E] hover:text-[#8C6B3E]" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook text-2xl"></i></a>
            <a href="https://www.youtube.com/@asmynegroup" className="text-[#8C6B3E] hover:text-[#8C6B3E]" aria-label="YouTube" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube text-2xl"></i></a>
            <a href="https://www.tiktok.com/@asmynegroup?_r=1&_t=ZS-98GMg7lSOjB" className="text-[#8C6B3E] hover:text-[#8C6B3E]" aria-label="TikTok" target="_blank" rel="noopener noreferrer"><i className="fab fa-tiktok text-2xl"></i></a>
          </div>
          <div className="flex gap-6 text-[#8C6B3E] text-sm">
            <a href="#" className="hover:text-[#8C6B3E] underline">Privacy Policy</a>
            <a href="#" className="hover:text-[#8C6B3E] underline">Terms of Service</a>
            <a href="#" className="hover:text-[#8C6B3E] underline">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
