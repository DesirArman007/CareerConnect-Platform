import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";

export const HeroLeftColumn: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/explore");
    }
  };

  return (
    <div className="flex flex-col items-start text-left z-20">

      {/* Eyebrow */}
      <p className="text-[#FF5500] font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase mb-4 sm:mb-5">
        REAL JOBS. REAL COMPANIES.
      </p>

      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[60px] xl:text-[66px] font-black tracking-tight text-white leading-[1.06] mb-5">
        Find the job. <br />
        Go straight to <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5500] via-[#FF6610] to-[#FF7720]">
          the source.
        </span>
      </h1>

      {/* Supporting copy */}
      <p className="text-gray-400 text-base sm:text-lg max-w-lg mb-8 sm:mb-10 leading-relaxed font-normal">
        Discover real job openings from companies that are hiring. Compare roles in one place, then apply directly on the company's official career page.
      </p>

      {/* Single Large Premium Search Bar */}
      <div className="w-full max-w-md sm:max-w-[460px] mb-8 sm:mb-10">
        <form
          onSubmit={handleSearch}
          className="relative flex items-center w-full bg-[#0d0d0f]/95 border border-orange-500/30 hover:border-orange-500/60 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 rounded-full p-2 pl-5 sm:pl-6 shadow-[0_0_35px_rgba(255,85,0,0.12)] transition-all duration-300 backdrop-blur-xl"
        >
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0 mr-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles, skills or companies..."
            className="w-full bg-transparent text-white text-sm sm:text-base placeholder:text-gray-500 focus:outline-none pr-3"
          />
          <button
            type="submit"
            aria-label="Search"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#FF5500] to-[#FF4500] hover:from-[#FF6610] hover:to-[#FF5500] active:scale-95 text-white flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-md shadow-orange-500/30 cursor-pointer"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
